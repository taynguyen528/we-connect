import { Router } from 'express';
import { createTweetController } from '~/controllers/tweets.controller';
import { createTweetValidator } from '~/middlewares/tweets.middlewares';
import { accessTokenValidator, loginValidator, verifyUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const tweetsRouter = Router();

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
);

export default tweetsRouter;
