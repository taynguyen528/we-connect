import { error } from 'console';
import { config } from 'dotenv';
import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import Bookmark from '~/models/schemas/Bookmark.schema';
import Follower from '~/models/schemas/Follower.schema';
import Hashtag from '~/models/schemas/Hashtag.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Tweet from '~/models/schemas/Twitter.schema';
import User from '~/models/schemas/User.schema';
import VideoStatus from '~/models/schemas/VideoStatus.schema';
config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.rzqxfxp.mongodb.net`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(`${process.env.DB_NAME}`);
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch {
      console.log('error', error);
      throw error;
    }
  }

  indexUser() {
    this.users.createIndex({ email: 1, password: 1 });
    this.users.createIndex({ email: 1 }, { unique: true });
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(['video_id_1_status_1']);
    if (!exists) {
      this.videoStatus.createIndex({ video_id: 1, status: 1 });
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['token_1_user_id_1']);
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1, user_id: 1 });
    }
  }

  async indexFollowers() {
    const exits = await this.followers.indexExists(['user_id_1_followed_user_id_1']);
    if (!exits) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 });
    }
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text']);
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' });
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string);
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string);
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string);
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string);
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string);
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string);
  }
}

const databaseService = new DatabaseService();

export default databaseService;
