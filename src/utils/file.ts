import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads/images');

  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // tạo folder nested
    });
  }
};

export const handleUploadSingeImage = async (req: Request) => {
  const formidable = (await import('formidable')).default;

  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3000 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));
      if (!valid) {
        form.emit('error' as any, new Error('File  type is not valid') as any);
      }

      return valid;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'));
      }

      resolve(files);
    });
  });
};
