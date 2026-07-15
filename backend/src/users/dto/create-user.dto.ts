import { IsString, IsEmail, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsIn(['Employee', 'Security Officer', 'Auditor', 'ISMS Manager', 'Organization Admin', 'Super Admin'])
  role?: string;
  @IsOptional() @IsString() organization?: string;
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: string;
  @IsOptional() @IsBoolean() mfaEnabled?: boolean;
}
