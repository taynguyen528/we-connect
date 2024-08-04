import express, { Request, Response, Router } from 'express';
import usersRouter from './routes/users.router';
import databaseService from './services/database.services';

const app = express();

const router = Router();
const port = 3000;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World TN!');
});

databaseService.connect();

app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
