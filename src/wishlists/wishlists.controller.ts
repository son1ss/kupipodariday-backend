import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createWishlistDto: CreateWishlistDto) {
    const wishlist = await this.wishlistsService.create(
      req.user.userId,
      createWishlistDto,
    );

    return wishlist;
  }

  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('You are not allowed to edit this wishlist');
    }
    return this.wishlistsService.update(+id, updateWishlistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this wishlist',
      );
    }
    return this.wishlistsService.remove(+id);
  }
}
