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
    result
  });
};

export const getTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decode_authorization?.user_id);
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views
  };
  return res.json({
    message: 'Get Tweet Successfully',
    result: tweet
  });
};
