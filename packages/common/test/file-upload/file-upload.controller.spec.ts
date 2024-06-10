import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from '../../src/controllers/file-upload.controller';
import { FileUploadService } from '../../src/services/file-upload.service'; // Ensure this path is correct
import { FastifyReply } from 'fastify';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let filesService: FileUploadService;

  const mockRes = {
    headers: jest.fn(),
    raw: {
      pipe: jest.fn(),
    },
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: {
            download: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
  });

  it('should reject request with parameters containing ../', async () => {
    const destination = ['..%2Ftest%2Fjest-e2e.json', '%2E%2E%2F.env'];
    destination.map(async (file) => {
      await controller.downloadFile(file, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('File download failed');
    });
  });
});
