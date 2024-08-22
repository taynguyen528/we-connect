import { Router } from 'express';
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  followController,
  getProfileController,
  unFollowController,
  changePasswordController,
  oauthController
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middlewares';
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifyForgotPasswordTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares';
import { UpdateMeRequestBody } from '~/models/request/User.requests';
import { wrapRequestHandler } from '~/utils/handlers';

const usersRouter = Router();

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));
/*
  body: {email: string, password: string}
*/

usersRouter.get('/oauth/google', wrapRequestHandler(oauthController));
/*
  OAuth with google
  Query: {code: string}
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

usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));
/* 
  header: {Authorization: Bearer <access_token>}
  body : {}
*/

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
);
/* 
  header: {Authorization: Bearer <access_token>}
  body : UserSchema
*/

usersRouter.get('/:username', wrapRequestHandler(getProfileController));
/* 
  header: {Authorization: Bearer <access_token>}
  body : {}
*/

usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapRequestHandler(followController)
);
/* 
  header: {Authorization: Bearer <access_token>}
  body : {followed_user_id: string}
*/

usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifyUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
);
/* 
  header: {Authorization: Bearer <access_token>}
  body : {followed_user_id: string}
*/

usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
);
/* 
  header: {Authorization: Bearer <access_token>}
  body : {old_password: string, password: string, confirm_password: string}
*/

export default usersRouter;
