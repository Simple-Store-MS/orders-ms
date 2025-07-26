import { IsBoolean, IsOptional, IsPositive } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma';

export class CreateOrderDto {
  @IsBoolean()
  paid: boolean;

  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;

  @IsPositive()
  totalAmount: number;

  @IsPositive()
  totalItems: number;
}
