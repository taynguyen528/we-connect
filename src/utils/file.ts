import { Request } from 'express';
import { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { UPLOAD_TEMP_DIR } from '~/constants/dir';

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // tạo folder nested
    });
  }
};

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default;

  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
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

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'));
      }

      resolve((files.image as File[])[0]);
    });
  });
};

export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.');
  namearr.pop();
  return namearr.join('');
};