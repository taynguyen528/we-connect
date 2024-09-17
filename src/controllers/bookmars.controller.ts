import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { BOOKMARKS_MESSAGES } from '~/constants/messages';
import { BookmarkTweetRequestBody } from '~/models/request/Bookmark.request';
import { TokenPayload } from '~/models/request/User.requests';
import bookmarkService from '~/services/bookmark.services';

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id);

  return res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result
  });
};
