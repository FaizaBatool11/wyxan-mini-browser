// import { Module } from '@nestjs/common';
// import { PeopleController } from './people.controller';
// import { PeopleService } from './people.service';

// @Module({
//   controllers: [PeopleController],
//   providers: [PeopleService]
// })
// export class PeopleModule {}


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { Person, PersonSchema } from './schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Person.name,
        schema: PersonSchema,
      },
    ]),
  ],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
