import { Request } from 'express';
import path from 'path';
import sharp from 'sharp';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { isProduction } from '~/constants/config';
import { config } from 'dotenv';
import { EncodingStatus, MediaType } from '~/constants/enum';
import { Media } from '~/models/Other';
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video';
import databaseService from './database.services';
import VideoStatus from '~/models/schemas/VideoStatus.schema';

config();

class Queue {
  items: string[];
  encoding: boolean;
  constructor() {
    this.items = [];
    this.encoding = false;
  }

  async enqueue(item: string) {
    this.items.push(item);
    const idName = path.basename(item, path.extname(item));
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    );
    this.processEncode();
  }

  async processEncode() {
    if (this.encoding) {
      return;
    }

    if (this.items.length > 0) {
      this.encoding = true;
      const videoPath = this.items[0];

      const idName = path.basename(videoPath, path.extname(videoPath));
      await databaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      );

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath);
        this.items.shift();
        await fsPromise.unlink(videoPath);

        const idName = path.basename(videoPath, path.extname(videoPath));
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        );
        console.log(`Encode video ${videoPath} success`);
      } catch (error) {
        const idName = path.basename(videoPath, path.extname(videoPath));
        await databaseService.videoStatus
          .updateOne(
            {
              name: idName
            },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((error) => {
            console.error('Update video status error', error);
          });
        console.error(`Encode video ${videoPath} error`);
        console.error(error);
      }
      this.encoding = false;
      this.processEncode();
    } else {
      console.log('Encode video queue is empty');
    }
  }
}

const queue = new Queue();

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename);
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath);

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        };
      })
    );
    return result;
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req);
    const result: Media[] = files.map((file) => {
      console.log(file);
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      };
    });
    return result;
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // await encodeHLSWithMultipleVideoStreams(file.filepath);
        // await fsPromise.unlink(file.filepath);
        const newName = getNameFromFullName(file.newFilename);
        queue.enqueue(file.filepath);
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}.m3u8`,
          type: MediaType.HLS
        };
      })
    );
    return result;
  }

  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({
      name: id
    });
    console.log(`Fetching video status with name: ${id}`);
    return data;
  }
}

const mediasService = new MediasService();

export default mediasService;
