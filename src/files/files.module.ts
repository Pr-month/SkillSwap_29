import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesInterceptor } from './files.interceptor';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesInterceptor],
})
export class FilesModule {}
