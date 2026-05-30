import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchInvestorDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsArray()
  sectors?: string[];

  @IsOptional()
  @IsArray()
  stages?: string[];

  @IsOptional()
  @IsString()
  geography?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  checkSizeMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  checkSizeMax?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}
