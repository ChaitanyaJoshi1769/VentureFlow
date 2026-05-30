import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateStartupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  currentStage?: string;

  @IsOptional()
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @IsNumber()
  mrr?: number;

  @IsOptional()
  @IsNumber()
  users?: number;

  @IsOptional()
  @IsArray()
  founderIds?: string[];

  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
