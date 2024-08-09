import { Router } from 'express';
import { loginController, logoutController, registerController } from '~/controllers/users.controllers';
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const usersRouter = Router();

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));
/*
  body: {email: string, password: string}
*/

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController));
/* 
  body : {name: string, email: string, password: string, confirm_password: string, date_of_birth: string}
*/

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));
/* 
  header: {Authorization: Bearer <access_token>}
  body : {refresh_token: string}
*/

export default usersRouter;
