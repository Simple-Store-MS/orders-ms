import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { PrismaClient } from '../../generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrdersPagination } from './dto/orders-pagination.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NATS_SERVICE } from '../config';
import { firstValueFrom } from 'rxjs';
import { Product } from './entities/product.entity';
import { ValidateProductsDto } from './dto/validate-products.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  public constructor(
    @Inject(NATS_SERVICE)
    private readonly natsService: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database CONNECTED');
  }

  async create(createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map(
      (item: OrderItemDto) => item.productId,
    );

    const productsMap = await this.getProductByIds({ ids: productIds });

    const totalAmount = createOrderDto.items.reduce(
      (total, item: OrderItemDto) =>
        total + (productsMap.get(item.productId)?.price ?? 0) * item.quantity,
      0,
    );

    const totalItems = createOrderDto.items.reduce(
      (total, item: OrderItemDto) => total + item.quantity,
      0,
    );

    const order = await this.order.create({
      data: {
        totalAmount,
        totalItems,
        items: {
          createMany: {
            data: createOrderDto.items.map((item: OrderItemDto) => ({
              price: productsMap.get(item.productId)?.price ?? 0,
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        items: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    const items = order.items.map((item) => ({
      ...item,
      name: productsMap.get(item.productId)?.name ?? '',
    }));

    return { ...order, items };
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
    const order = await this.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        message: `The order with id: ${id} was not found`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const productIds = order.items.map((item) => item.productId);

    const productsMap = await this.getProductByIds({
      ids: productIds,
      withDeleted: true,
    });

    const items = order.items.map((item) => ({
      ...item,
      name: productsMap.get(item.productId)?.name ?? '',
    }));

    return { ...order, items };
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

  async getProductByIds(
    input: ValidateProductsDto,
  ): Promise<Map<number, Product>> {
    try {
      const products = await firstValueFrom<Product[]>(
        this.natsService.send('VALIDATE_PRODUCTS', input),
      );

      const productsMap = new Map<number, Product>();
      products.forEach((product: Product) =>
        productsMap.set(product.id, product),
      );

      return productsMap;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
