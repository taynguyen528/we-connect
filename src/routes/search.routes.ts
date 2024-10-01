import { Router } from 'express';
import { searchController } from '~/controllers/search.controller';
import { searchValidator } from '~/middlewares/search.middlewares';
import { paginationValidator } from '~/middlewares/tweets.middlewares';
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares';

const searchRouter = Router();

searchRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  searchValidator,
  paginationValidator,
  searchController
);

export default searchRouter;
