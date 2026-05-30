import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePitchDeckDto {
  @IsString()
  title: string;

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
}
