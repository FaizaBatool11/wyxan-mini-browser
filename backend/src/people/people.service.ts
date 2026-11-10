// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class PeopleService {}


import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Person, PersonDocument } from './schemas/person.schema';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name)
    private personModel: Model<PersonDocument>,
  ) {}

  async create(name: string) {
    const person = new this.personModel({
      name: name.trim(),
    });

    return person.save();
  }

  async findAll() {
    return this.personModel.find().exec();
  }
}
