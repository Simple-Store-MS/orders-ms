import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class Pagination {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  public page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  public limit?: number = 0;
}
