import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateCapaDto {
  @IsString() title: string;
  @IsOptional() @IsIn(['Corrective', 'Preventive']) type?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() rootCause?: string;
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() owner?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() closedAt?: string;
}
