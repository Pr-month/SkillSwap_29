import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FilesInterceptor } from './files.interceptor';
import { fileConfig } from '@/config/file.config';

describe('FilesInterceptor', () => {
  let interceptor: FilesInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          load: [fileConfig],
        }),
      ],
      providers: [FilesInterceptor],
    }).compile();

    interceptor = moduleRef.get<FilesInterceptor>(FilesInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
