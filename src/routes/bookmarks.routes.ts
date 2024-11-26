import { Router } from 'express';
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmars.controller';
import { tweetIdValidator } from '~/middlewares/tweets.middlewares';
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const bookmarksRouter = Router();

bookmarksRouter.post(
  '',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
);

bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkTweetController)
);

export default bookmarksRouter;
