
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true })
export class Site {

  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  address!: string;

   @Prop({ required: true })
  html!: string;

  @Prop({ required: true, default: '' })
  searchText!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Person',
    required: true,
  })
  author!: Types.ObjectId;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
