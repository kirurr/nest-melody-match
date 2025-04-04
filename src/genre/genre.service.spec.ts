import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { GenreRepository } from './genre.repository';

describe('GenreService', () => {
  let genreService: GenreService;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let genreRepository: GenreRepository;

  const mockGenreRepository = {
    getGenresByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: GenreRepository,
          useValue: mockGenreRepository,
        },
      ],
    }).compile();

    genreService = module.get<GenreService>(GenreService);
    genreRepository = module.get<GenreRepository>(GenreRepository);
  });

  it('should be defined', () => {
    expect(genreService).toBeDefined();
  });

  describe('calculateUserGenreVector', () => {
    it('should calculate the genre vector correctly', async () => {
      const genresIds = [1, 2, 3];
      const mockGenres = [
        { id: 1, vector: [1, 0, 0, 0, 0] },
        { id: 2, vector: [0, 1, 0, 0, 0] },
        { id: 3, vector: [0, 0, 1, 0, 0] },
      ];

      mockGenreRepository.getGenresByIds.mockResolvedValue(mockGenres);

      const result = await genreService.calculateUserGenreVector(genresIds);

      expect(result).toEqual([1, 1, 1, 0, 0]);
      expect(mockGenreRepository.getGenresByIds).toHaveBeenCalledWith(genresIds);
    });

    it('should return a zero vector if no genres are found', async () => {
      const genresIds = [1, 2, 3];
      mockGenreRepository.getGenresByIds.mockResolvedValue([]);

      const result = await genreService.calculateUserGenreVector(genresIds);

      expect(result).toEqual([0, 0, 0, 0, 0]);
      expect(mockGenreRepository.getGenresByIds).toHaveBeenCalledWith(genresIds);
    });
  });
});