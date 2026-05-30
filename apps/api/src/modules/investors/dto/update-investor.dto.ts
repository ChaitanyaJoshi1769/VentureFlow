import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class UpdateInvestorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsArray()
  sectors?: string[];

  @IsOptional()
  @IsArray()
  stages?: string[];

  @IsOptional()
  @IsNumber()
  checkSizeMin?: number;

  @IsOptional()
  @IsNumber()
  checkSizeMax?: number;

  @IsOptional()
  @IsString()
  investmentThesis?: string;

  @IsOptional()
  @IsBoolean()
  leadInvestor?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}
