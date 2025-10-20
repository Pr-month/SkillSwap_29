import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getPublicFileUrl(filename: string): string {
    return `http://localhost:3000/public/${filename}`;
  }
}
