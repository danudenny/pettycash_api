// tslint:disable: no-console
import express = require('express');
import dayjs from 'dayjs';
import fs = require('fs');

import { AWS_S3 } from '../constants/aws-s3.constant';
import axios from 'axios';
import { LoaderEnv } from '../../config/loader';

export class AwsS3Service {
  static defaultBucketName = LoaderEnv.envs.AWS_S3_BUCKET;

  public static uploadFileBuffer(
    fileBuffer: Buffer,
    fileOriginalName: string,
    fileMime: string,
    pathId?: string,
    bucketName?: string,
    acl: 'private' | 'public-read' = 'private',
  ) {
    if (!bucketName) {
      bucketName = this.defaultBucketName;
    }

    const fullName = pathId
      ? pathId
      : `${dayjs().format('YYYY/M/D')}/${fileOriginalName}`;
    const awsKey = `attachments/${fullName}`;
    // attachments/tms-check-in/123456789-file.png OR attachments/123456789-file.png
    // CHANGE: attachments/tms-check-in/19/8/12/file.png OR attachments/19/8/12/file.png

    // NOTE: The optional contentType option can be used to set Content/mime type of the file.
    // By default the content type is set to application/octet-stream.
    // ACL: "private"|"public-read"|"public-read-write"|"authenticated-read"|"aws-exec-read"|"bucket-owner-read"|"bucket-owner-full-control"|string
    return AWS_S3.putObject({
      ACL: acl,
      ContentType: fileMime,
      Body: fileBuffer,
      Bucket: bucketName,
      Key: awsKey,
    })
      .promise()
      .then(() => {
        return {
          awsKey,
          acl,
        };
      });
  }

  public static uploadFileBase64(
    base64String: string,
    awsKey: string,
    bucketName?: string,
  ) {
    if (!bucketName) {
      bucketName = this.defaultBucketName;
    }

    // const awsKey = `attachments/${
    //   pathId ? `${pathId}/` : ''
    // }${moment().format('Y/M/D')}/${fileOriginalName}`;
    // attachments/tms-check-in/123456789-file.png OR attachments/123456789-file.png
    // CHANGE: attachments/tms-check-in/19/8/12/file.png OR attachments/19/8/12/file.png

    // Ensure that you POST a base64 data to your server.
    const base64Data = Buffer.from(
      base64String.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    // Getting the file type, ie: jpeg, png or gif
    const type = base64String.split(';')[0].split('/')[1];
    const contentType = `image/${type}`;

    // NOTE: The optional contentType option can be used to set Content/mime type of the file.
    // By default the content type is set to application/octet-stream.
    return AWS_S3.putObject({
      ACL: 'public-read',
      ContentType: contentType,
      Body: base64Data,
      Bucket: bucketName,
      Key: awsKey,
    })
      .promise()
      .then(() => {
        return {
          awsKey,
          contentType,
        };
      });
  }

  public static async uploadFromUrl(
    url: string,
    awsKey: string,
    bucketName?: string,
  ) {
    // init bucketName
    if (!bucketName) {
      bucketName = this.defaultBucketName;
    }

    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      if (res) {
        // NOTE: The optional contentType option can be used to set Content/mime type of the file.
        // By default the content type is set to application/octet-stream.
        return AWS_S3.putObject({
          ACL: 'public-read',
          ContentType: res.headers['content-type'],
          Body: res.data, // buffer
          Bucket: bucketName,
          Key: awsKey,
        })
          .promise()
          .then(() => {
            return {
              awsKey,
            };
          });
      }
    } catch (error) {
      console.error(error);
    }
  }

  public static async uploadFromFilePath(
    filePath: string,
    fileName: string,
    bucketName?: string,
  ) {
    // init bucketName
    if (!bucketName) {
      bucketName = this.defaultBucketName;
    }
    const awsKey = fileName;
    try {
      // upload file to S3
      return AWS_S3.putObject({
        ACL: 'public-read',
        Body: fs.readFileSync(filePath),
        Bucket: bucketName,
        Key: awsKey,
      })
        .promise()
        .then(() => {
          return { awsKey };
        });
    } catch (err) {
      console.error(err);
    }
  }

  public static downloadFileAndStreamToClient(
    res: express.Response,
    bucketName: string,
    key: string,
    fileName: string,
    fileMime?: string,
  ) {
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    if (fileMime) {
      res.setHeader('Content-Type', fileMime);
    }

    const fileStream = AWS_S3.getObject({
      Bucket: bucketName,
      Key: key,
    }).createReadStream();
    fileStream.pipe(res);
  }

  public static async deleteFile(bucketName: string, key: string) {
    return AWS_S3.deleteObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }

  public static async getSignedUrl(
    bucketName: string,
    key: string,
    expires: number = 60,
  ) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expires, // time in seconds: e.g. 60 * 5 = 5 mins
    };

    const signedUrl = await new Promise((resolve, reject) => {
      AWS_S3.getSignedUrl('getObject', params, (err, url) => {
        if (err) reject(err);
        resolve(url);
      });
    });
    return signedUrl;
  }
}
