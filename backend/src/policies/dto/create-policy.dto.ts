import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePolicyDto {
  @IsString() title: string;
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() approver?: string;
  @IsOptional() @IsDateString() approvedAt?: string;
  @IsOptional() @IsDateString() reviewDate?: string;
}
