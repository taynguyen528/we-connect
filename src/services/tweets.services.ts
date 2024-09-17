import { TweetRequestBody } from '~/models/request/Tweet.request';
import databaseService from './database.services';
import Tweet from '~/models/schemas/Twitter.schema';
import { ObjectId, Timestamp, WithId } from 'mongodb';
import Hashtag from '~/models/schemas/Hashtag.schema';

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map(async (hashtag) => {
        const result = await databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after', includeResultMetadata: true }
        );

        return result;
      })
    );

    return hashtagDocuments.map((hashtag) => (hashtag.value as WithId<Hashtag>)._id);
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags);
    console.log('hashtags ', hashtags);

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [],
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    );

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId });

    return tweet;
  }
}

const tweetsService = new TweetsService();
export default tweetsService;
