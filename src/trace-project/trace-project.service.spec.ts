import { Test, TestingModule } from '@nestjs/testing';
import { TraceProjectService } from './trace-project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TraceProject } from './entities/trace-project.entity';
import { ProjectService } from 'src/project/project.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DropboxService } from 'src/dropbox/dropbox.service';

describe('TraceProjectService', () => {
  let service: TraceProjectService;
  let traceProjectRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let projectService: {
    findOne: jest.Mock;
    isTraceProjectOnProject: jest.Mock;
  };
  let dropboxService: {
    uploadBuffer: jest.Mock;
    getFileSharedLink: jest.Mock;
  };

  beforeEach(async () => {
    traceProjectRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    projectService = {
      findOne: jest.fn(),
      isTraceProjectOnProject: jest.fn(),
    };

    dropboxService = {
      uploadBuffer: jest.fn(),
      getFileSharedLink: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TraceProjectService,
        {
          provide: getRepositoryToken(TraceProject),
          useValue: traceProjectRepo,
        },
        {
          provide: ProjectService,
          useValue: projectService,
        },
        {
          provide: DropboxService,
          useValue: dropboxService,
        },
      ],
    }).compile();

    service = module.get<TraceProjectService>(TraceProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects creation when name is empty after trimming', async () => {
    await expect(
      service.create({
        Name: '   ',
        Observation: 'Observacion valida',
        ProjectId: 1,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects creation when another trace project already uses the same name', async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ Id: 9, Name: 'Seguimiento A' }),
    };

    traceProjectRepo.createQueryBuilder.mockReturnValue(qb);
    projectService.findOne.mockResolvedValue({ Id: 1 });

    await expect(
      service.create({
        Name: ' Seguimiento A ',
        Observation: 'Observacion valida',
        ProjectId: 1,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects update when observation is empty after trimming', async () => {
    traceProjectRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Seguimiento A',
      Observation: 'Texto',
    });

    await expect(
      service.update(1, {
        Observation: '   ',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
