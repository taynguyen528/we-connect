import { Router } from 'express';
import { bookmarkTweetController } from '~/controllers/bookmars.controller';
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const bookmarksRouter = Router();

bookmarksRouter.post('', accessTokenValidator, verifyUserValidator, wrapRequestHandler(bookmarkTweetController));

export default bookmarksRouter;
