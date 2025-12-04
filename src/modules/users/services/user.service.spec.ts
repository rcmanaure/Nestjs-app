import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User, UserDocument } from '../entities/user.entity';
import { LoggerService, StripeService } from '../../../shared';
import { setupTestModule } from '../../../../test/setup';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let stripeService: StripeService;
  let mockUserModel: Model<UserDocument>;

  const mockUser: Partial<User> = {
    clerkId: 'test-clerk-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await setupTestModule({
      additionalModules: [
        {
          providers: [
            UserService,
            UserRepository,
            {
              provide: LoggerService,
              useValue: {
                log: jest.fn(),
                error: jest.fn(),
              },
            },
            {
              provide: StripeService,
              useValue: {
                createCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
              },
            },
          ],
          exports: [UserService, UserRepository],
        },
      ],
    });

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    stripeService = module.get<StripeService>(StripeService);
    mockUserModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        clerkId: 'test-clerk-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = { ...mockUser, _id: 'test-id' } as UserDocument;
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        roles: ['user'],
        isActive: true,
        stripeCustomerId: 'cus_test123',
      });
      expect(stripeService.createCustomer).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const createUserDto = {
        clerkId: 'existing-clerk-id',
        email: 'existing@example.com',
      };

      jest.spyOn(userRepository, 'findByClerkId').mockResolvedValue(mockUser as UserDocument);

      await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
    });
  });

  describe('findByClerkId', () => {
    it('should return user by clerk id', async () => {
      const user = { ...mockUser, _id: 'test-id' } as UserDocument;
      jest.spyOn(userRepository, 'findByClerkId').mockResolvedValue(user);

      const result = await service.findByClerkId('test-clerk-id');

      expect(result).toEqual(user);
      expect(userRepository.findByClerkId).toHaveBeenCalledWith('test-clerk-id');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findByClerkId').mockResolvedValue(null);

      await expect(service.findByClerkId('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, ...updateDto, _id: 'test-id' } as UserDocument;

      jest.spyOn(userRepository, 'updateById').mockResolvedValue(updatedUser);

      const result = await service.update('test-id', updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.updateById).toHaveBeenCalledWith('test-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      jest.spyOn(userRepository, 'deleteById').mockResolvedValue(true);

      await expect(service.remove('test-id')).resolves.not.toThrow();
      expect(userRepository.deleteById).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'deleteById').mockResolvedValue(false);

      await expect(service.remove('non-existent-id')).rejects.toThrow('User not found');
    });
  });
});
