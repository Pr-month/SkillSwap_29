import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { ConfigModule } from '@nestjs/config';
import { fileConfig } from '@/config/file.config';

const mockConfig = {
  fileSize: 2 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  imageCDN: 'http://localhost:3000/public/',
};

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          load: [fileConfig],
        }),
      ],
      providers: [
        FilesService,
        {
          provide: fileConfig.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct public file URL', () => {
    const filename = '1abe5c3a8d7d016b93011b6fa7a40db4.jpg';
    const expectedUrl = `http://localhost:3000/public/${filename}`;
    const result = service.getPublicFileUrl(filename);

    expect(result).toContain(expectedUrl);
  });
});
