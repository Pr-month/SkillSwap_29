import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'Публичный URL для доступа к файлу',
    example: 'https://example.com/public/filename.jpg',
  })
  url: string;
}
