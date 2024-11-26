import { Request } from 'express';
import User from './models/schemas/User.schema';
import { TokenPayload } from './models/request/User.requests';
import Tweet from './models/schemas/Twitter.schema';

declare module 'express' {
  interface Request {
    user?: User;
    decode_authorization?: TokenPayload;
    decode_refresh_token?: TokenPayload;
    decode_email_verify_token?: TokenPayload;
    decode_forgot_password_token?: TokenPayload;
    tweet?: Tweet;
  }
}
