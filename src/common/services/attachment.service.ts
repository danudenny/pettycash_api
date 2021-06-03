import dayjs from 'dayjs';
import express = require('express');
import { EntityManager, getConnection, getManager } from 'typeorm';
import { HttpException, Injectable } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { AWS_BUCKET_NAME, FILE_PROVIDER } from '../constants/aws-s3.constant';
import { Attachment } from '../../model/attachment.entity';
import { AuthService } from '../../app/services/v1/auth.service';

export class AttachmentService {
  private static async getRepository() {
    const conn = getConnection();
    const repo = conn.getRepository(Attachment);
    return repo;
  }

  public static async uploadFileBufferToS3(
    fileBuffer: Buffer,
    attachmentName: string,
    fileOriginalName: string,
    fileMime: string,
    pathId?: string,
    bucketName?: string,
    typeId?: any,
    tx?: EntityManager,
  ) {
    if (!bucketName) {
      bucketName = AWS_BUCKET_NAME;
    }

    const uploadResponse = await AwsS3Service.uploadFileBuffer(
      fileBuffer,
      fileOriginalName,
      fileMime,
      pathId,
      bucketName,
    );

    const url = `https://${bucketName}.s3.amazonaws.com/${uploadResponse.awsKey}`;

    // Get UserId from Auth
    const { id: userId } = await AuthService.getUser();

    const repo = tx ? tx : getManager();
    const attachment = repo.create(Attachment, {
      bucketName,
      fileMime,
      fileProvider: FILE_PROVIDER.AWS_S3,
      path: uploadResponse.awsKey,
      name: attachmentName,
      fileName: fileOriginalName,
      url,
      typeId: typeId,
      createUserId: userId,
      updateUserId: userId,
    });
    return await repo.save(attachment);
  }

  public static async uploadFileBase64(
    base64String: string,
    pathId?: string,
    fileName?: string,
    isRandomName: boolean = true,
    bucketName?: string,
  ) {
    if (!bucketName) {
      bucketName = AWS_BUCKET_NAME;
    }

    if (isRandomName) {
      const uuidv1 = require('uuid/v1');
      const uuidString = uuidv1();
      fileName = `attachments/${pathId ? `${pathId}/` : ''}${dayjs().format(
        'YYYY/M/D',
      )}/${uuidString}`;
    }

    const uploadResponse = await AwsS3Service.uploadFileBase64(
      base64String,
      fileName,
      bucketName,
    );

    const url = `https://${bucketName}.s3.amazonaws.com/${uploadResponse.awsKey}`;

    // Get UserId from Auth
    const { id: userId } = await AuthService.getUser();

    const repo = await this.getRepository();
    const attachment = repo.create({
      bucketName,
      fileMime: uploadResponse.contentType,
      fileProvider: FILE_PROVIDER.AWS_S3,
      path: uploadResponse.awsKey,
      name: fileName,
      fileName,
      url,
      createUserId: userId,
      updateUserId: userId,
    });
    return await repo.save(attachment);
  }

  /**
   * Upload Multiple Files to AWS S3
   *
   * @private
   * @param {File[]} files multiple file.
   * @param {EntityManager} tx Transaction Manager, optional.
   * @memberof AttachmentService
   */
  public static async uploadFiles(
    files: any,
    pathHandler?: (arg: any) => string,
    typeId?: any,
    tx?: EntityManager,
  ): Promise<Attachment[]> {
    try {
      const attachments: Attachment[] = [];
      for (const file of files) {
        let attachment = null;
        // NOTE: Legacy Code. Don't know why this here 🤔
        // let attachment = await tx.findOne(Attachment, {
        //   where: {
        //     fileName: file.originalname,
        //   },
        //   lock: { mode: 'pessimistic_write' },
        // });

        if (!attachment) {
          // Upload Attachment to AWS S3
          const txManager = tx ? tx : null;
          const pathId = pathHandler(file);
          attachment = await this.uploadFileBufferToS3(
            file.buffer,
            file.originalname,
            file.originalname,
            file.mimetype,
            pathId,
            null,
            typeId,
            txManager,
          );
        }
        attachments.push(attachment);
      }

      return attachments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload Multiple Files to AWS S3 with Custom Name
   *
   * @static
   * @param {*} files
   * @param {(file: any) => string} nameHandler
   * @param {(file: any) => string} [pathHandler]
   * @param {*} [typeId]
   * @param {EntityManager} [tx]
   * @return {*}  {Promise<Attachment[]>}
   * @memberof AttachmentService
   */
  public static async uploadFilesWithCustomName(
    files: any,
    nameHandler: (file: any) => string,
    pathHandler?: (file: any) => string,
    typeId?: any,
    tx?: EntityManager,
  ): Promise<Attachment[]> {
    try {
      const attachments: Attachment[] = [];
      for (const file of files) {
        // Upload Attachment to AWS S3
        const txManager = tx ? tx : null;
        const name = nameHandler(file);
        const pathId = pathHandler(file);
        const attachment = await this.uploadFileBufferToS3(
          file.buffer,
          name,
          file.originalname,
          file.mimetype,
          pathId,
          null,
          typeId,
          txManager,
        );
        attachments.push(attachment);
      }

      return attachments;
    } catch (error) {
      throw error;
    }
  }

  public static async sendAttachmentToClient(
    res: express.Response,
    attachmentId: number,
  ) {
    const repo = await this.getRepository();
    const attachment = await repo.findOne(attachmentId);
    if (!attachment) {
      throw new HttpException('File not found', 404);
    }

    switch (attachment.fileProvider) {
      case FILE_PROVIDER.AWS_S3:
        return AwsS3Service.downloadFileAndStreamToClient(
          res,
          attachment.bucketName,
          attachment.path,
          attachment.fileName,
          attachment.fileMime,
        );
    }
  }

  public static async findById(id: string) {
    const repo = await this.getRepository();
    const attachment = await repo.findOne({ id, isDeleted: false });
    if (!attachment) {
      throw new HttpException('Cannot get attachment, file not found', 404);
    }
    return attachment;
  }

  public static async deleteAttachment(id: string) {
    const repo = await this.getRepository();
    const attachment = await repo.findOne({ id, isDeleted: false });
    if (!attachment) {
      throw new HttpException('Cannot delete attachment, file not found', 404);
    }

    switch (attachment.fileProvider) {
      case FILE_PROVIDER.AWS_S3:
        await AwsS3Service.deleteFile(attachment.bucketName, attachment.path);
        break;
    }

    await repo.remove(attachment);
  }
}
