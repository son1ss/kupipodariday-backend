import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishesService } from '../wishes/wishes.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createOfferDto: CreateOfferDto) {
    const wish = await this.wishesService.findOne(createOfferDto.itemId);
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    if (wish.owner.id === req.user.userId) {
      throw new BadRequestException('You cannot contribute to your own wish');
    }
    if (Number(wish.raised) >= Number(wish.price)) {
      throw new BadRequestException('Wish is already fully funded');
    }

    const offer = await this.offersService.create(
      req.user.userId,
      createOfferDto,
    );

    wish.raised =
      (Number(wish.raised) * 100 + createOfferDto.amount * 100) / 100;
    await this.wishesService.update(wish.id, wish);

    return offer;
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const offer = await this.offersService.findOne(+id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.findOne(+id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.user.id !== req.user.userId) {
      throw new ForbiddenException('You are not allowed to delete this offer');
    }

    const wish = await this.wishesService.findOne(offer.item.id);
    wish.raised -= offer.amount;
    await this.wishesService.update(wish.id, wish);

    return this.offersService.remove(+id);
  }
}
