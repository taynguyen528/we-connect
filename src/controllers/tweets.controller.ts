import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TweetType } from '~/constants/enum';
import { Pagination, TweetParam, TweetQuery, TweetRequestBody } from '~/models/request/Tweet.request';
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
    user_views: result.user_views,
    updated_at: result.updated_at
  };
  return res.json({
    message: 'Get Tweet Successfully',
    result: tweet
  });
};

export const getTweetChildrenController = async (
  req: Request<TweetParam, any, any, TweetQuery>,
  res: Response,
  next: NextFunction
) => {
  const tweetId = req.params.tweet_id;
  const tweet_type = Number(req.query.tweet_type) as TweetType;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const user_id = req.decode_authorization?.user_id;

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: tweetId,
    tweet_type,
    limit,
    page,
    user_id
  });

  return res.json({
    message: 'Get Tweet Children Successfully',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  });
};

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.decode_authorization?.user_id as string;

  const limit = Number(req.query.limit);
  const page = Number(req.query.page);

  const result = await tweetsService.getNewFeeds({ user_id, limit, page });

  return res.json({
    message: 'Get New Feeds Successfully',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  });
};
