import { IsString, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';

export class UpdateCrmInvestorDto {
  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsNumber()
  relationshipScore?: number;

  @IsOptional()
  @IsNumber()
  temperatureScore?: number;

  @IsOptional()
  @IsNumber()
  fitScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
