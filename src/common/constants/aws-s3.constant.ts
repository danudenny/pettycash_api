import * as AWS from 'aws-sdk';
import { LoaderEnv } from '../../config/loader';

export const AWS_S3 = new AWS.S3({
  accessKeyId: LoaderEnv.envs.AWS_ACCESS_KEY_ID,
  secretAccessKey: LoaderEnv.envs.AWS_SECRET_ACCESS_KEY,
  region: LoaderEnv.envs.AWS_REGION,
});

export const AWS_BUCKET_NAME = LoaderEnv.envs.AWS_S3_BUCKET;

export const FILE_PROVIDER = {
  AWS_S3: 'aws_s3',
};
