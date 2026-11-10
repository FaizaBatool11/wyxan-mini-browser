// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class VisitsService {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit, VisitDocument } from './schemas/visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name)
    private visitModel: Model<VisitDocument>,
  ) {}

  // Save a new website visit
  async create(data: {
    person: string;
    site: string;
    navigationType?: string;
  }) {
    const visit = new this.visitModel({
      person: new Types.ObjectId(data.person),
      site: new Types.ObjectId(data.site),
      navigationType: data.navigationType || 'typed',
    });

    return visit.save();
  }

  // Get browsing history of a person
  async findByPerson(personId: string) {
    if (!Types.ObjectId.isValid(personId)) {
      throw new NotFoundException('Invalid person ID');
    }

    return this.visitModel
      .find({ person: new Types.ObjectId(personId) })
      .populate('site', 'title address')
      .sort({ visitedAt: -1 })
      .exec();
  }
}