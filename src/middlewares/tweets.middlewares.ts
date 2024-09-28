import { Request, Response, NextFunction } from 'express';
import { checkSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Error';
import Tweet from '~/models/schemas/Twitter.schema';
import databaseService from '~/services/database.services';
import { numberEnumToArray } from '~/utils/common';
import { wrapRequestHandler } from '~/utils/handlers';
import { validate } from '~/utils/validation';

const tweetTypes = numberEnumToArray(TweetType);
const tweetAudience = numberEnumToArray(TweetAudience);
const mediaTypes = numberEnumToArray(MediaType);
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType;
          // check xem nếu "type" là retweet, comment, quotetweet thì "parent_id" phải là "tweet_id" của tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
          }
          // Nếu "type" là tweet thì "parent_id" phải là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL);
          }
          return true;
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType;
          const hashtags = req.body.hashtags as string[];
          const mentions = req.body.mentions as string[];
          // check xem nếu "type" là  comment, quotetweet, tweet và không có "mentions" và "hashtags" thì "content" phải là string và không được rỗng
          if (
            [TweetType.Retweet, TweetType.Comment, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING);
          }
          // Nếu "type" là retweet thì "content" phải là ""
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING);
          }

          return true;
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
          }
          return true;
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là user_id
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
          }
          return true;
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là Media Object
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || mediaTypes.includes(item.type);
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT);
          }
          return true;
        }
      }
    }
  })
);

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.INVALID_TWEET_ID
              });
            }

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: { $ifNull: ['$bookmarks', []] }
                    },
                    likes: {
                      $size: { $ifNull: ['$likes', []] }
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$tweet_children', []] },
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$tweet_children', []] },
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$tweet_children', []] },
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray();

            // console.log('tweet: ', tweet);

            if (!tweet) {
              throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: TWEETS_MESSAGES.TWEET_NOT_FOUND });
            }

            (req as Request).tweet = tweet as any;

            return true;
          }
        }
      }
    },
    ['params', 'body']
  )
);

// Muốn sử dụng async await trong handler express thì phải có try cath
// Nếu không muốn dùng try cath thì phải dùng wrapRequestHandler
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet;
  // console.log('tweet: ', tweet);
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decode_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      });
    }

    // Kiểm tra tài khoản tác giả có bị khoá hay bị xóa chưa
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    });
    // console.log('author: ', author);

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      });
    }

    const { user_id } = req.decode_authorization;
    // console.log('user_id: ', user_id);
    // Kiểm tra người xem tweet này có trong Twitter Circle của tác giả hay không
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id));
    // console.log('isInTwitterCircle: ', isInTwitterCircle);
    // Nếu bạn không phải là tác giả và không nằm trong twitter circle thì lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      });
    }
  }
  next();
});

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
);

export const paginationValidator = validate(
  checkSchema({
    limit: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num > 100 || num < 1) {
            throw new Error('1 <= limit <= 100 ');
          }
          return true;
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error('page >=1');
          }
          return true;
        }
      }
    }
  })
);
