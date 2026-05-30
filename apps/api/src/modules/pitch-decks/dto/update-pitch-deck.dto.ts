import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdatePitchDeckDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  s3Key?: string;

  @IsOptional()
  @IsNumber()
  slideCount?: number;

  @IsOptional()
  @IsBoolean()
  createNewVersion?: boolean;
}
