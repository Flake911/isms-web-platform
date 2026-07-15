import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateIncidentDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() reporter?: string;
  @IsOptional() @IsString() assignee?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() rootCause?: string;
  @IsOptional() @IsString() resolution?: string;
  @IsOptional() @IsDateString() resolvedAt?: string;
}
