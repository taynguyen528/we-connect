import { NextFunction, Request, Response } from 'express';
import path from 'path';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import mediasService from '~/services/medias.services';
import fs from 'fs';

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req);
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  });
};

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req);
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  });
};

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req);
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  });
};

export const videoStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  console.log('check id: ', id);
  const result = await mediasService.getVideoStatus(id as string);
  return res.json({
    message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
    result
  });
};

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const mime = await import('mime');

  const range = req.headers.range;
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header');
  }

  // custom streaming video
  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
  const videoSize = fs.statSync(videoPath).size; // bytes
  // dung lượng video cho mỗi đoạn stream
  const chunkSize = 10 ** 6;
  // lấy giá trị byte bắt đầu từ header Range
  const start = Number(range.replace(/\D/g, ''));
  // lấy giá trị byte kết thúc -> Vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1);

  // dung lượng thực tế cho mỗi đoạn stream(thường là chunksize, trừ đoạn cuối cùng)
  const contentLength = end - start + 1;
  const contentType = mime.default.getType(videoPath) || 'video/*';
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  };
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoSteams = fs.createReadStream(videoPath, { start, end });
  videoSteams.pipe(res);
};

export const serveM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // const realId = id.replace('m3u8', '');
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params;
  // segment: 0.ts, 1.ts, 2.ts
  console.log(segment);
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};
