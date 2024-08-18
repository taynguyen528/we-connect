import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import HTTP_STATUS from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/Error';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);

    const errors = validationResult(req);
    // không có lỗi thì next
    if (errors.isEmpty()) {
      return next();
    }
    const errorsObject = errors.mapped();

    const entityError = new EntityError({ errors: {} });

    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg);
      }
      entityError.errors[key] = errorsObject[key];
    }

    next(entityError);
  };
};

// import express from 'express';
// import { ValidationChain, validationResult } from 'express-validator';

// export const validate = (validations: ValidationChain[]) => {
//   return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     for (let validation of validations) {
//       await validation.run(req);
//     }

//     const errors = validationResult(req);
//     if (errors.isEmpty()) {
//       return next();
//     }

//     res.status(400).json({ errors: errors.array() });
//   };
// };
