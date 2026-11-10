// import { Module } from '@nestjs/common';
// import { VisitsController } from './visits.controller';
// import { VisitsService } from './visits.service';

// @Module({
//   controllers: [VisitsController],
//   providers: [VisitsService]
// })
// export class VisitsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { Visit, VisitSchema } from './schemas/visit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}