import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TweetRequestBody } from '~/models/request/Tweet.request';
import { TokenPayload } from '~/models/request/User.requests';
import tweetsService from '~/services/tweets.services';

config();

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await tweetsService.createTweet(user_id, req.body);
  return res.json({
    message: 'Create Tweet Successfully',
    data: result
  });
};
