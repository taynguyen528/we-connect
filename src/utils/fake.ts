import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { RegisterRequestBody } from '~/models/request/User.requests';
import { TweetRequestBody } from '~/models/request/Tweet.request';
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum';
import databaseService from '~/services/database.services';
import { hashPassword } from './crypto';
import User from '~/models/schemas/User.schema';
import Follower from '~/models/schemas/Follower.schema';
import tweetsService from '~/services/tweets.services';

// Mật khẩu cho các fake user
const PASSWORD = 'Pttn2002@';

// ID tài khoản của mình, dùng để follow người khác
const MYID = new ObjectId('66ebe3b88ff46809b7de6564');

// Số lượng user được tạo, mỗi user sẽ được mặc định tweet 2 cái
const USER_COUNT = 100;

const createRandomUser = () => {
  const user: RegisterRequestBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  };
  return user;
};

const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: [],
    medias: [],
    mentions: [],
    parent_id: null
  };

  return tweet;
};

const users: RegisterRequestBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
});

const insertMultipleUsers = async (users: RegisterRequestBody[]) => {
  console.log('Creating users...');
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId();
      await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      );
      return user_id;
    })
  );
  console.log(`Created ${result.length} users`);
  return result;
};

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...');
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) => {
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      );
    })
  );
  console.log(`Followed ${result.length} users`);
};

const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log(`Creating tweets...`);
  console.log(`Counting...`);
  let count = 0;
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        tweetsService.createTweet(id.toString(), createRandomTweet()),
        tweetsService.createTweet(id.toString(), createRandomTweet())
      ]);
      count += 2;
      console.log(`Created ${count} tweets`);
    })
  );
  return result;
};

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids);
  insertMultipleTweets(ids);
});
