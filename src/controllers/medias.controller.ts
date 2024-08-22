import { NextFunction, Request, Response } from 'express';
import { handleUploadSingeImage } from '~/utils/file';

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadSingeImage(req);
  return res.json({
    result: data
  });
};
