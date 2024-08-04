import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
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
