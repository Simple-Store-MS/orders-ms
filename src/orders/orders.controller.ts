import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersPagination } from './dto/orders-pagination.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('CREATE_ORDER')
  create(@Payload() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @MessagePattern('FIND_ORDERS')
  findAll(@Payload() input: OrdersPagination) {
    return this.ordersService.findAll(input);
  }

  @MessagePattern('FIND_ORDER')
  findOne(@Payload('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('CHANGE_ORDER_STATUS')
  updateOrder(@Payload() dto: UpdateOrderDto) {
    return this.ordersService.updateOrder(dto);
  }
}
