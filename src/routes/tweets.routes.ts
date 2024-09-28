import { Router } from 'express';
import { createTweetController, getNewFeedsController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controller';
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  isUserLoggedValidator,
  loginValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const tweetsRouter = Router();

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
);

tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
);

tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
);

// get new-feeds
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNewFeedsController)
);

export default tweetsRouter;
