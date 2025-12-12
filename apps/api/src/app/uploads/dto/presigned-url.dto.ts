import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty({ description: 'Survey ID the file belongs to' })
  @IsString()
  @IsNotEmpty()
  surveyId: string;

  @ApiProperty({ description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(1)
  @Max(50 * 1024 * 1024) // 50MB max
  size: number;
}
