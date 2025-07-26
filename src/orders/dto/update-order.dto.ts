import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../enums/order.status.enum';

export class UpdateOrderDto {
  @IsUUID()
  id: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
