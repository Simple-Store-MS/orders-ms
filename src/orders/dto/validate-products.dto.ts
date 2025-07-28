import { IsBoolean, IsPositive } from 'class-validator';

export class ValidateProductsDto {
  @IsPositive({ each: true })
  public ids: number[];

  @IsBoolean()
  public withDeleted? = false;
}
