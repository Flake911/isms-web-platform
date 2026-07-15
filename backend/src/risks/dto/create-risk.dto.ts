import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRiskDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) @Type(() => Number) likelihood?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) @Type(() => Number) impact?: number;
  @IsOptional() @IsNumber() @Type(() => Number) riskScore?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) @Type(() => Number) residualLikelihood?: number | null;
  @IsOptional() @IsInt() @Min(1) @Max(5) @Type(() => Number) residualImpact?: number | null;
  @IsOptional() @IsNumber() @Type(() => Number) residualScore?: number | null;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() owner?: string;
  @IsOptional() @IsString() treatment?: string;
  @IsOptional() @IsString() mitigations?: string;
  @IsOptional() @IsString() riskAppetite?: string;
  @IsOptional() @IsString() linkedAsset?: string;
  @IsOptional() @IsString() linkedThreat?: string;
  @IsOptional() @IsString() linkedVulnerability?: string;
  @IsOptional() @IsDateString() identifiedAt?: string | null;
  @IsOptional() @IsDateString() dueDate?: string | null;
  @IsOptional() @IsDateString() reviewDate?: string | null;
}
