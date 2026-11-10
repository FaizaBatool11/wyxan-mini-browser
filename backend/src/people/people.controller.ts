// import { Controller } from '@nestjs/common';

// @Controller('people')
// export class PeopleController {}


import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  async create(@Body('name') name: string) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Person name is required');
    }

    return this.peopleService.create(name);
  }

  @Get()
  async findAll() {
    return this.peopleService.findAll();
  }
}
