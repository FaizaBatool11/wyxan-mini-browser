// import { Controller } from '@nestjs/common';

// @Controller('visits')
// export class VisitsController {}

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  // Save a website visit
  @Post()
  async create(
    @Body()
    body: {
      person: string;
      site: string;
      navigationType?: string;
    },
  ) {
    if (
      !body.person?.trim() ||
      !body.site?.trim()
    ) {
      throw new BadRequestException(
        'Person ID and Site ID are required',
      );
    }

    return this.visitsService.create(body);
  }

  // Get browsing history of a person
  @Get('person/:personId')
  async findByPerson(@Param('personId') personId: string) {
    return this.visitsService.findByPerson(personId);
  }
}