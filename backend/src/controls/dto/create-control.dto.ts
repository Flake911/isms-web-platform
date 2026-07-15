import { IsString, IsOptional } from 'class-validator';

export class CreateControlDto {
  @IsString() code: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() owner?: string;
  @IsOptional() @IsString() annex?: string;
  @IsOptional() @IsString() evidence?: string;
}
