import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from '../../modules/investors/investors.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('InvestorsService', () => {
  let service: InvestorsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestorsService,
        {
          provide: PrismaService,
          useValue: {
            investor: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InvestorsService>(InvestorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return investors with pagination', async () => {
      const mockInvestors = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      ];

      jest.spyOn(prismaService.investor, 'findMany').mockResolvedValue(mockInvestors);

      const result = await service.findAll('org_1', 0, 20);

      expect(result).toEqual(mockInvestors);
      expect(prismaService.investor.findMany).toHaveBeenCalled();
    });

    it('should filter by sector', async () => {
      const mockInvestors = [
        { id: '1', firstName: 'John', sectors: ['AI', 'SaaS'] },
      ];

      jest.spyOn(prismaService.investor, 'findMany').mockResolvedValue(mockInvestors);

      const result = await service.findAll('org_1', 0, 20, { sector: 'AI' });

      expect(result).toEqual(mockInvestors);
    });
  });

  describe('create', () => {
    it('should create a new investor', async () => {
      const createData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        title: 'Partner',
      };

      const mockCreatedInvestor = { id: '1', ...createData };

      jest.spyOn(prismaService.investor, 'create').mockResolvedValue(mockCreatedInvestor);

      const result = await service.create('org_1', createData);

      expect(result).toEqual(mockCreatedInvestor);
      expect(prismaService.investor.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createData),
      });
    });
  });

  describe('search', () => {
    it('should search investors by name', async () => {
      const mockResults = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
      ];

      jest.spyOn(prismaService.investor, 'findMany').mockResolvedValue(mockResults);

      const result = await service.search('org_1', 'John');

      expect(result).toEqual(mockResults);
    });
  });
});
