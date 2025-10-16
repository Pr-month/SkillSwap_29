import { FilesInterceptor } from './files.interceptor';
import { ConfigService } from '@nestjs/config';

describe('FilesInterceptor', () => {
  const configService: ConfigService = new ConfigService();
  it('should be defined', () => {
    expect(new FilesInterceptor(configService)).toBeDefined();
  });
});
