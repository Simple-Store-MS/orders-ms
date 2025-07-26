import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '../../generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { OrdersPagination } from './dto/orders-pagination.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database CONNECTED');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(input: OrdersPagination) {
    const { limit = 10, page = 1, status } = input;
    const skip = (page - 1) * limit;

    const totalCount = await this.order.count({ where: { status } });

    const lastPage = Math.ceil(totalCount / limit);

    const data = await this.order.findMany({
      skip,
      take: limit,
      where: { status },
    });

    return {
      metadata: { totalCount, page, lastPage },
      data,
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });

    if (!order) {
      throw new RpcException({
        message: `The order with id: ${id} was not found`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async updateOrder(dto: UpdateOrderDto) {
    const { id, status } = dto;
    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return await this.order.update({
      data: { status },
      where: { id },
    });
  }
}
