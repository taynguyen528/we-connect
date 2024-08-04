import { NextFunction, Request, Response } from 'express';
import { checkSchema } from 'express-validator';
import { validate } from '~/utils/validation';

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    });
  }
  next();
};

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: 'Name is required'
      },
      isString: {
        errorMessage: 'Name must be a string'
      },
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: 'Name must be between 1 and 100 characters'
      },
      trim: true
    },
    email: {
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: {
        errorMessage: 'Email is invalid'
      },
      trim: true
    },
    password: {
      notEmpty: {
        errorMessage: 'Password is required'
      },
      isString: {
        errorMessage: 'Password must be a string'
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password must be between 6 and 50 characters'
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must be strong: at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: 'Confirm Password is required'
      },
      isString: {
        errorMessage: 'Confirm Password must be a string'
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Confirm Password must be between 6 and 50 characters'
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Confirm Password must be strong: at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
      }
    },
    date_of_birth: {
      isISO8601: {
        options: { strict: true, strictSeparator: true },
        errorMessage: 'Date of Birth must be a valid ISO8601 date'
      }
    }
  })
);
