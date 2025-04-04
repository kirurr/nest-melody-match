import { Test, TestingModule } from '@nestjs/testing';
import { GenreRepository } from './genre.repository';
import { PrismaService } from '../prisma.service';

describe('GenreRepository', () => {
  let genreRepository: GenreRepository;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    genreRepository = module.get<GenreRepository>(GenreRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(genreRepository).toBeDefined();
  });

  describe('getGenresByIds', () => {
    it('should return genres with parsed vectors', async () => {
      const genresIds = [1, 2, 3];
      const rawGenres = [
        { id: 1, name: 'Action', vector: '[1, 0, 0, 0, 0]' },
        { id: 2, name: 'Comedy', vector: '[0, 1, 0, 0, 0]' },
        { id: 3, name: 'Drama', vector: '[0, 0, 1, 0, 0]' },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(rawGenres);

      const result = await genreRepository.getGenresByIds(genresIds);

      expect(result).toEqual([
        { id: 1, name: 'Action', vector: [1, 0, 0, 0, 0] },
        { id: 2, name: 'Comedy', vector: [0, 1, 0, 0, 0] },
        { id: 3, name: 'Drama', vector: [0, 0, 1, 0, 0] },
      ]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        genresIds,
      );
    });

    it('should return an empty array if no genres are found', async () => {
      const genresIds = [1, 2, 3];
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await genreRepository.getGenresByIds(genresIds);

      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        genresIds,
      );
    });
  });
});
