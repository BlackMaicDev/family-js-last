import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('UserManagementController', () => {
  let controller: UserManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
