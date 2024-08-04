import { Request, Response } from 'express';
import usersService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'asdas@gmail.com' && password === '123456') {
    res.json({ message: 'Login Success' });
  }

  return res.status(400).json({
    error: 'Login failed'
  });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await usersService.register({ email, password });
    console.log(result);
    return res.status(400).json({
      message: 'Register success',
      result
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Register failed',
      error
    });
  }
};
