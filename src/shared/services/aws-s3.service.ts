import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LoggerService } from './logger.service';

export interface UploadFileDto {
  file: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
}

export interface UploadedFile {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class AwsS3Service {
  private s3: S3Client;
  private readonly logger = new LoggerService();
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME', '');

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('AWS credentials and bucket name must be configured');
    }

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(dto: UploadFileDto): Promise<UploadedFile> {
    const { file, filename, mimetype, folder = 'uploads' } = dto;
    const key = `${folder}/${Date.now()}-${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimetype,
        ACL: 'public-read', // Adjust based on your security requirements
      });

      await this.s3.send(command);

      const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`, {
        operation: 'uploadFile',
        metadata: { key, url, bucket: this.bucketName },
      });

      return {
        key,
        url,
        bucket: this.bucketName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack, {
        operation: 'uploadFile',
        metadata: { key, filename },
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);

      this.logger.log(`File deleted successfully: ${key}`, {
        operation: 'deleteFile',
        metadata: { key, bucket: this.bucketName },
      });
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack, {
        operation: 'deleteFile',
        metadata: { key },
      });
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });

      this.logger.log(`Generated signed URL for: ${key}`, {
        operation: 'getSignedUrl',
        metadata: { key, expiresIn },
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack, {
        operation: 'getSignedUrl',
        metadata: { key },
      });
      throw error;
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
