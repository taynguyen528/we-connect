import express, { Request, Response, Router } from 'express';
import usersRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import mediasRouter from './routes/medias.router';
import { initFolder } from './utils/file';

const app = express();
databaseService.connect();

const router = Router();
const port = 4000;

// tạo folder upload
initFolder();

app.use(express.json());

app.use('/users', usersRouter);
app.use('/medias', mediasRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// error handler
app.use(defaultErrorHandler);
