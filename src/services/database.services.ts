import { error } from 'console';
import { config } from 'dotenv';
import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import User from '~/models/schemas/User.schema';
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

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string);
  }
}

const databaseService = new DatabaseService();

export default databaseService;
