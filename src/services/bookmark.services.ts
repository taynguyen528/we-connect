import Bookmark from '~/models/schemas/Bookmark.schema';
import databaseService from './database.services';
import { ObjectId, WithId } from 'mongodb';

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after',
        includeResultMetadata: true
      }
    );

    return result.value as WithId<Bookmark>;
  }
}

const bookmarkService = new BookmarkService();

export default bookmarkService;