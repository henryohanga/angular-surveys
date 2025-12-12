import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  cdnUrl: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontDomain: string | undefined;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY'
    );

    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'angular-surveys-uploads'
    );
    this.cloudFrontDomain = this.configService.get<string>(
      'AWS_CLOUDFRONT_DOMAIN'
    );
    this.maxFileSize =
      this.configService.get<number>('MAX_FILE_SIZE_MB', 10) * 1024 * 1024;
    this.allowedMimeTypes = this.configService
      .get<string>(
        'ALLOWED_MIME_TYPES',
        'image/*,application/pdf,video/*,audio/*'
      )
      .split(',')
      .map((t) => t.trim());

    this.s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  private validateMimeType(mimeType: string): boolean {
    return this.allowedMimeTypes.some((allowed) => {
      if (allowed.endsWith('/*')) {
        const prefix = allowed.slice(0, -1);
        return mimeType.startsWith(prefix);
      }
      return mimeType === allowed;
    });
  }

  private generateKey(surveyId: string, filename: string): string {
    const uniqueId = uuidv4();
    const sanitizedName = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    return `surveys/${surveyId}/${uniqueId}-${sanitizedName}`;
  }

  private getCdnUrl(key: string): string {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async getPresignedUploadUrl(
    surveyId: string,
    filename: string,
    mimeType: string,
    size: number
  ): Promise<PresignedUrlResult> {
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${
          this.maxFileSize / 1024 / 1024
        }MB)`
      );
    }

    if (!this.validateMimeType(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} is not allowed`);
    }

    const key = this.generateKey(surveyId, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
      ContentLength: size,
      Metadata: {
        'original-filename': filename,
        'survey-id': surveyId,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      uploadUrl,
      key,
      cdnUrl: this.getCdnUrl(key),
    };
  }

  async uploadFile(surveyId: string, file: MulterFile): Promise<UploadResult> {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${
          this.maxFileSize / 1024 / 1024
        }MB)`
      );
    }

    if (!this.validateMimeType(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`
      );
    }

    const key = this.generateKey(surveyId, file.originalname);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-filename': file.originalname,
        'survey-id': surveyId,
      },
    });

    await this.s3Client.send(command);

    this.logger.log(`File uploaded: ${key}`);

    return {
      key,
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
      cdnUrl: this.getCdnUrl(key),
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted: ${key}`);
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
