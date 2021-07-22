import { URL } from 'url';

import { Request, Response, Router } from 'express';

import { JWTService } from '../jwt-service';
import { AuthenticationJWT } from '../jwt-service/authentication-jwt';
import { SessionIdProvider } from '../jwt-service/types';

export interface TokenizerRedirectorConfig {
  sessionIdProvider: SessionIdProvider;
  secureFrameURL: string;
  auth: JWTService;
}

// This route handler redirects
export class TokenizerRedirector {
  private readonly secureFrameUrl: string;
  private readonly auth: JWTService;
  private readonly config: TokenizerRedirectorConfig;

  constructor(config: TokenizerRedirectorConfig) {
    this.auth = config.auth;
    this.config = config;
    this.secureFrameUrl = config.secureFrameURL;
  }

  sendErrorToBrowser(res: Response, errorMessage: string, code = 400) {
    return res.status(code).send({
      success: false,
      error: errorMessage,
    });
  }

  createJWT(sessionId: string) {
    return this.auth.createSessionRedirectJWT({ session_id: sessionId });
  }

  async buildSecureFrameRedirectUrl(sessionId: string, route: string) {
    // This gets set into the "access_token" cookie by the Secure Frame Backend after the redirect
    let jwt: AuthenticationJWT;
    try {
      jwt = await this.createJWT(sessionId);
    } catch (e) {
      console.error(e);
      return;
    }
    const redirectUrl = new URL(this.secureFrameUrl);
    redirectUrl.searchParams.append('signed_session', jwt.toString());
    redirectUrl.pathname = route;
    return redirectUrl;
  }

  async handleRedirect(req: Request, res: Response) {
    console.log('handling a redirect of ', req);
    const sessionId = await this.config.sessionIdProvider(req);
    if (sessionId === null) {
      return this.sendErrorToBrowser(
        res,
        'Could not get a session for the user, is the user logged in and is your sessionIdProvider callback working?',
        401
      );
    }

    const route = req.route.split('/lunasec')[1];
    const redirectUrl = await this.buildSecureFrameRedirectUrl(sessionId, route);
    if (!redirectUrl) {
      return this.sendErrorToBrowser(
        res,
        'Signing the sessionID into a JWT to redirect to the tokenizer failed.  Is your private key set?',
        500
      );
    }

    console.log('redirecting...', redirectUrl.href);
    return res.redirect(redirectUrl.href);
  }

  register(app: Router) {
    // Express accepts an array of routes if we want to lock it down more
    app.get('/lunasec/*', (req, res) => void this.handleRedirect(req, res));
  }
}
