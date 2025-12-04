import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  stripeCustomerId?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });
