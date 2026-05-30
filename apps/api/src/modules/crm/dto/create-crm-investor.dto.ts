import { IsString, IsUUID, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateCrmInvestorDto {
  @IsUUID()
  startupId: string;

  @IsUUID()
  investorId: string;

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
}
