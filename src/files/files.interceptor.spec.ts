import { FilesInterceptor } from './files.interceptor';
import { ConfigService } from '@nestjs/config';
import { IFileConfig } from '../config/types';

describe('FilesInterceptor', () => {
  const mockFileConfig: IFileConfig = {
    fileSize: 1024 * 1024 * 2, //2MB
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'FILE_CONFIG') {
        return mockFileConfig;
      }
      return null;
    }),
  } as unknown as ConfigService;

  it('should be defined', () => {
    expect(new FilesInterceptor(mockConfigService)).toBeDefined();
  });

});
