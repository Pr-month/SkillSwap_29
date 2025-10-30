import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return public URL when file is provided', async () => {
    const mockFile = { filename: 'testfile.jpg' } as Express.Multer.File;
    const expectedUrl = `http://localhost:3000/public/${mockFile.filename}`;

    jest.spyOn(service, 'getPublicFileUrl').mockReturnValue(expectedUrl);

    const result = await controller.uploadFile(mockFile);
    expect(result).toEqual({ url: expectedUrl });
  });

  it('should throw HttpException when file is not provided', async () => {
    await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
      new HttpException('Файл не указан', HttpStatus.BAD_REQUEST),
    );
  });
});
