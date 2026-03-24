import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectStateService } from './project-state/project-state.service';
import { UsersService } from 'src/users/users.service';
import { TotalActualExpenseService } from 'src/total-actual-expense/total-actual-expense.service';
import { DropboxService } from 'src/dropbox/dropbox.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: {
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    projectRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepo,
        },
        {
          provide: ProjectStateService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: TotalActualExpenseService,
          useValue: {},
        },
        {
          provide: DropboxService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns paginated search results with material-style meta', async () => {
    const data = [{ Id: 1, Name: 'Proyecto A', IsActive: true }];
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };

    projectRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.search({
      page: 1,
      limit: 10,
      name: 'proyecto',
      projectState: '2',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('LOWER(project.Name) LIKE :name', {
      name: '%proyecto%',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'project.ProjectState = :projectState',
      { projectState: '2' },
    );
    expect(result).toEqual({
      data,
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });
});
