import { isToken } from '@lunasec/tokenizer-sdk';
import { KeyLike, SignJWT } from 'jose/jwt/sign';
import { JWTPayload } from 'jose/types';

import { getSecretFromSecretProvider, ValidSecretProvider } from './types';

// TODO (cthompson) we should have a base jwt class that these two inherit from
export class LunaSecAuthenticationGrant {
  private readonly authGrant!: string;

  constructor(authGrant: string) {
    this.authGrant = authGrant;
  }

  public isValid(): boolean {
    // TODO: Check the current date against the expiration
    throw new Error('not implemented');
  }

  public toString() {
    return this.authGrant;
  }
}

export class LunaSecDetokenizationGrant {
  private readonly detokenizationGrant!: string;

  constructor(detokenizationGrant: string) {
    this.detokenizationGrant = detokenizationGrant;
  }

  public isValid(): boolean {
    // TODO: Check the current date against the expiration
    throw new Error('not implemented');
  }

  public toString() {
    return this.detokenizationGrant;
  }

  public toJSON() {
    return this.detokenizationGrant;
  }
}

export interface TokenAuthServiceConfig {
  secretProvider: ValidSecretProvider;
}

export class LunaSecTokenAuthService {
  private readonly config!: TokenAuthServiceConfig;

  constructor(config: TokenAuthServiceConfig) {
    this.config = config;
  }

  async getSigningSecretKey(): Promise<KeyLike> {
    // This is the simplest way to reduce the copy-paste code of the code below :shrug:
    // Would a @ts-ignore have been a better solution?
    function _getSecret<T, TFoo extends (provider: T) => Promise<KeyLike>>(providerFn: TFoo, provider: T) {
      return providerFn(provider);
    }

    if (this.config.secretProvider.type === 'awsSecretsManager') {
      return await _getSecret(getSecretFromSecretProvider[this.config.secretProvider.type], this.config.secretProvider);
    }

    if (this.config.secretProvider.type === 'environment') {
      return await _getSecret(getSecretFromSecretProvider[this.config.secretProvider.type], this.config.secretProvider);
    }

    throw new Error('Unknown provider specified');
  }

  private async createJwt(claims: any): Promise<string> {
    const secret = await this.getSigningSecretKey();

    const jwt = await new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setIssuer('node-sdk')
      .setAudience('secure-frame')
      .setExpirationTime('15m')
      .sign(secret);

    return jwt.toString();
  }

  private async createDetokenizationGrant(claims: { token_id: string }) {
    const encodedJwt = await this.createJwt(claims);
    return new LunaSecDetokenizationGrant(encodedJwt);
  }

  public async authenticate(payload: JWTPayload): Promise<LunaSecAuthenticationGrant> {
    const encodedJwt = await this.createJwt(payload);
    return new LunaSecAuthenticationGrant(encodedJwt);
  }

  public async grant(t: string): Promise<LunaSecDetokenizationGrant> {
    if (!isToken(t)) {
      throw new Error('Attempted to create a LunaSec Token Grant from a string that didnt look like a token');
    }
    return this.createDetokenizationGrant({ token_id: t });
  }

  // Handle entire objects that may have some tokens, assumed to be a very common use case with something like a "user" having some tokenized fields
  public async grantifyObject(o: Record<string, any>) {
    const grantPromises = Object.keys(o).map((key) => {
      const val = o[key];
      if (typeof val === 'string' && isToken(val)) {
        return this.createDetokenizationGrant({ token_id: val });
      } else {
        return Promise.resolve(val);
      }
    });
    const grantifiedObject: Record<string, any> = {};
    const valArray = await Promise.all(grantPromises);
    valArray.forEach((val, index) => {
      grantifiedObject[Object.keys(o)[index]] = val;
    });
    return grantifiedObject;
  }

  public verifyTokenGrant(tokenGrant: string | LunaSecDetokenizationGrant): boolean {
    if (typeof tokenGrant === 'object') {
      return tokenGrant.isValid();
    }

    return new LunaSecDetokenizationGrant(tokenGrant).isValid();
  }
}
