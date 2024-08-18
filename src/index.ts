import express, { Request, Response, Router } from 'express';
import usersRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from './middlewares/error.middlewares';

const app = express();
databaseService.connect();

const router = Router();
const port = 3000;
app.use(express.json());


app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// error handler
app.use(defaultErrorHandler);
