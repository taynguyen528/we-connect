import { Router } from 'express';
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController
} from '~/controllers/users.controllers';
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
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

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));
/* 
  body : {email_verify_token: string}
*/

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController));
/* 
  header: {Authorization: Bearer <access_token>}
  body : {}
*/

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));
/* 
  body : {email: string}
*/

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
);
/* 
  body : {forgot-password-token: string}
*/

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController));
/* 
  body : {forgot-password-token: string, password: string, confirm_password: string}
*/

export default usersRouter;
