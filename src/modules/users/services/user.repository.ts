import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../database';
import { User, UserDocument } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ clerkId }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ roles: role }).exec();
  }

  async updateLastLogin(clerkId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { clerkId },
        { lastLoginAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async deactivateUser(clerkId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { clerkId },
        { isActive: false },
        { new: true },
      )
      .exec();
  }

  async activateUser(clerkId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { clerkId },
        { isActive: true },
        { new: true },
      )
      .exec();
  }
}
