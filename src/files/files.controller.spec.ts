import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigModule } from '@nestjs/config';
import { fileConfig } from '@/config/file.config';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({ isGlobal: true, load: [fileConfig] }),
      ],
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return public URL when file is provided', () => {
    const mockFile = {
      filename: 'testfile.jpg',
      originalname: 'testfile.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
      fieldname: 'file',
      destination: '/tmp',
      path: '/tmp/testfile.jpg',
    } as Express.Multer.File;

    const expectedUrl = `http://localhost:3000/public/${mockFile.filename}`;

    jest.spyOn(service, 'getPublicFileUrl').mockReturnValue(expectedUrl);
    jest.spyOn(service, 'validateFile').mockImplementation(() => {});

    const result = controller.uploadFile(mockFile);
    expect(result).toEqual({ url: expectedUrl });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.validateFile).toHaveBeenCalledWith(mockFile);
  });

  it('should throw BadRequestException when file is not provided', () => {
    // Передаем null, так как именно это вернет @UploadedFile() при отсутствии файла
    expect(() =>
      controller.uploadFile(null as unknown as Express.Multer.File),
    ).toThrow(
      new BadRequestException('Файл не указан или недопустимый тип файла'),
    );
  });
});
