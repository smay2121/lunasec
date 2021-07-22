import { URL } from 'url';

import { Request, Response, Router } from 'express';
import { JWTPayload } from 'jose/types';

import { JWTService } from '../jwt-service';
import { SessionIdProvider } from '../jwt-service/types';

export interface ExpressAuthPluginConfig {
  sessionIdProvider: SessionIdProvider;
  payloadClaims?: string[];
  secureFrameURL: string;
  jwtService: JWTService;
}

export class LunaSecExpressAuthPlugin {
  private readonly secureFrameUrl: string;
  private readonly jwtService: JWTService;
  private readonly config: ExpressAuthPluginConfig;

  constructor(config: ExpressAuthPluginConfig) {
    this.jwtService = config.jwtService;
    this.config = config;
    this.secureFrameUrl = config.secureFrameURL;
  }

  filterClaims(payload: JWTPayload): any {
    const whitelistedClaims = this.config.payloadClaims;
    if (whitelistedClaims === undefined) {
      return payload;
    }
    return Object.keys(payload)
      .filter((claim) => whitelistedClaims.indexOf(claim) !== -1)
      .reduce((claims, claim) => {
        return {
          ...claims,
          [claim]: payload[claim],
        };
      }, {});
  }

  async buildSecureFrameRedirectUrl(stateToken: string, sessionId: string) {
    // This gets set into the "access_token" cookie by the Secure Frame Backend after the redirect
    let access_token = undefined;
    try {
      access_token = await this.jwtService.createAuthenticationJWT({ session_id: sessionId });
    } catch (e) {
      console.error(`error while attempting to create authentication token: ${e}`);
    }

    if (access_token === undefined) {
      return null;
    }

    const redirectUrl = new URL(this.secureFrameUrl);
    redirectUrl.searchParams.append('state', stateToken);
    redirectUrl.searchParams.append('openid_token', access_token.toString());
    redirectUrl.pathname = '/session/create';
    return redirectUrl;
  }

  async handleSecureFrameAuthRequest(req: Request, res: Response) {
    const authFlowCorrelationToken = req.query.state;
    if (typeof authFlowCorrelationToken !== 'string') {
      res.status(400).send({
        success: false,
        error: 'state is not set in request',
      });
      return;
    }

    const sessionId = await this.config.sessionIdProvider(req);
    if (sessionId === null) {
      res.status(400).send({
        success: false,
        error: 'unable to authenticate the user of this request',
      });
      return;
    }
    // This method creates the JWT that becomes the iframe's "access_token" cookie, which contains the sessionId
    const redirectUrl = await this.buildSecureFrameRedirectUrl(authFlowCorrelationToken, sessionId);
    if (redirectUrl === null) {
      console.error('unable to complete auth flow, redirectURL not set');
      res.status(400).send({
        success: false,
        error: 'unable to complete auth flow, building redirect url from node-sdk to go server failed',
      });
      return;
    }

    console.debug('redirecting...', redirectUrl.href);

    res.redirect(redirectUrl.href);
  }

  register(app: Router) {
    app.get('/secure-frame', this.handleSecureFrameAuthRequest.bind(this));
  }
}
