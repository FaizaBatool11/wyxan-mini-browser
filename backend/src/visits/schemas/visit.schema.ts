import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

@Schema({ timestamps: true })
export class Visit {
  @Prop({
    type: Types.ObjectId,
    ref: 'Person',
    required: true,
  })
  person!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Site',
    required: true,
  })
  site!: Types.ObjectId;

  @Prop({
    required: true,
    default: Date.now,
  })
  visitedAt!: Date;

  @Prop({
    required: true,
    enum: ['typed', 'link', 'history', 'back', 'forward', 'search'],
    default: 'typed',
  })
  navigationType!: string;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);