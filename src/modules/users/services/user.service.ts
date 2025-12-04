import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDocument } from '../entities/user.entity';
import { LoggerService, StripeService } from '../../../shared';
import { ClerkUser } from '../../../core';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly stripeService: StripeService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByClerkId(createUserDto.clerkId);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Create Stripe customer if not provided
    let stripeCustomerId = createUserDto.stripeCustomerId;
    if (!stripeCustomerId) {
      try {
        const customer = await this.stripeService.createCustomer({
          email: createUserDto.email,
          name: `${createUserDto.firstName || ''} ${createUserDto.lastName || ''}`.trim(),
          metadata: { clerkId: createUserDto.clerkId },
        });
        stripeCustomerId = customer.id;
      } catch (error) {
        this.logger.error('Failed to create Stripe customer', error.stack, {
          operation: 'createUser',
          metadata: { clerkId: createUserDto.clerkId, email: createUserDto.email },
        });
        // Continue without Stripe customer for now
      }
    }

    const user = await this.userRepository.create({
      ...createUserDto,
      stripeCustomerId,
      roles: createUserDto.roles || ['user'],
      isActive: true,
    });

    this.logger.log('User created successfully', {
      operation: 'createUser',
      metadata: { userId: user._id, clerkId: user.clerkId },
    });

    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userRepository.find({});
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByClerkId(clerkId: string): Promise<UserDocument> {
    const user = await this.userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userRepository.updateById(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log('User updated successfully', {
      operation: 'updateUser',
      metadata: { userId: id },
    });

    return user;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.userRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    this.logger.log('User deleted successfully', {
      operation: 'deleteUser',
      metadata: { userId: id },
    });
  }

  async updateLastLogin(clerkUser: ClerkUser): Promise<UserDocument> {
    const user = await this.userRepository.updateLastLogin(clerkUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deactivateUser(clerkId: string): Promise<UserDocument> {
    const user = await this.userRepository.deactivateUser(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log('User deactivated', {
      operation: 'deactivateUser',
      metadata: { clerkId },
    });

    return user;
  }

  async activateUser(clerkId: string): Promise<UserDocument> {
    const user = await this.userRepository.activateUser(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log('User activated', {
      operation: 'activateUser',
      metadata: { clerkId },
    });

    return user;
  }

  async getUserProfile(clerkUser: ClerkUser): Promise<UserDocument> {
    return this.findByClerkId(clerkUser.id);
  }

  async updateUserProfile(
    clerkUser: ClerkUser,
    updateDto: Partial<UpdateUserDto>,
  ): Promise<UserDocument> {
    const user = await this.findByClerkId(clerkUser.id);
    return this.update(user._id.toString(), updateDto);
  }
}
