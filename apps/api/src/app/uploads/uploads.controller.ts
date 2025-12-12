import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UploadsService,
  UploadResult,
  PresignedUrlResult,
  MulterFile,
} from './uploads.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned URL for direct S3 upload' })
  @ApiResponse({
    status: 200,
    description: 'Returns presigned upload URL and CDN URL',
  })
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto
  ): Promise<PresignedUrlResult> {
    return this.uploadsService.getPresignedUploadUrl(
      dto.surveyId,
      dto.filename,
      dto.mimeType,
      dto.size
    );
  }

  @Post(':surveyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload file directly through API' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @Param('surveyId') surveyId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      })
    )
    file: MulterFile
  ): Promise<UploadResult> {
    return this.uploadsService.uploadFile(surveyId, file);
  }

  @Delete(':key(*)')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete uploaded file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string): Promise<{ success: boolean }> {
    await this.uploadsService.deleteFile(key);
    return { success: true };
  }

  @Get('download/:key(*)')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signed download URL' })
  @ApiResponse({ status: 200, description: 'Returns signed download URL' })
  async getDownloadUrl(@Param('key') key: string): Promise<{ url: string }> {
    const url = await this.uploadsService.getSignedDownloadUrl(key);
    return { url };
  }
}
