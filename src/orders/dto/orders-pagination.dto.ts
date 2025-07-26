import { IsEnum, IsOptional } from 'class-validator';
import { Pagination } from '../../common';
import { OrderStatus } from '../enums/order.status.enum';

export class OrdersPagination extends Pagination {
  @IsOptional()
  @IsEnum(OrderStatus)
  public status?: OrderStatus;
}
