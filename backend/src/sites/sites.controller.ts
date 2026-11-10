
import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';

import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // Create a new website
  @Post()
  async create(
    @Body()
    body: {
      title: string;
      address: string;
      html: string;
      author: string;
    },
  ) {
    if (
      !body.title?.trim() ||
      !body.address?.trim() ||
      !body.html?.trim() ||
      !body.author?.trim()
    ) {
      throw new BadRequestException('All fields are required');
    }

    return this.sitesService.create(body);
  }

  // Search website content
  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword?.trim()) {
      throw new BadRequestException('Search keyword is required');
    }

    return this.sitesService.search(keyword);
  }

  // Get all websites
  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  // Update existing website
  @Patch()
  async update(
    @Query('address') address: string,
    @Body()
    body: {
      title: string;
      html: string;
      author: string;
    },
  ) {
    if (
      !address ||
      !body.title?.trim() ||
      !body.html?.trim() ||
      !body.author?.trim()
    ) {
      throw new BadRequestException('All fields are required');
    }

    return this.sitesService.updateByAddress(address, body);
  }

  // Get website by address
//   @Get(':address')
//   async findOne(@Param('address') address: string) {
//     return this.sitesService.findOne(address);
//   }

@Get('by-address')
async findOne(@Query('address') address: string) {
  if (!address?.trim()) {
    throw new BadRequestException('Website address is required');
  }

  return this.sitesService.findOne(address);
}
}
