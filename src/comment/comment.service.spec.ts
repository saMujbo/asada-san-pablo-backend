import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    commentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentRepo,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a comment', async () => {
    const dto = { Message: 'Nueva observacion' };
    const comment = { Id: 1, ...dto, IsRead: false, IsActive: true };

    commentRepo.create.mockReturnValue(comment);
    commentRepo.save.mockResolvedValue(comment);

    await expect(service.create(dto)).resolves.toBe(comment);
    expect(commentRepo.create).toHaveBeenCalledWith(dto);
    expect(commentRepo.save).toHaveBeenCalledWith(comment);
  });

  it('returns all comments', async () => {
    const comments = [{ Id: 1, Message: 'Comentario' }];

    commentRepo.find.mockResolvedValue(comments);

    await expect(service.findAll()).resolves.toBe(comments);
    expect(commentRepo.find).toHaveBeenCalled();
  });

  it('returns paginated search results', async () => {
    const data = [{ Id: 1, Message: 'Pendiente', IsRead: false }];
    const qb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };

    commentRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.search({ page: 2, limit: 5, read: 'false' });

    expect(commentRepo.createQueryBuilder).toHaveBeenCalledWith('comment');
    expect(qb.skip).toHaveBeenCalledWith(5);
    expect(qb.take).toHaveBeenCalledWith(5);
    expect(qb.andWhere).toHaveBeenCalledWith('comment.IsRead = :read', {
      read: 'false',
    });
    expect(qb.orderBy).toHaveBeenCalledWith('comment.IsRead', 'ASC');
    expect(result).toEqual({
      data,
      meta: {
        total: 1,
        page: 2,
        limit: 5,
        pageCount: 1,
        hasNextPage: false,
        hasPrevPage: true,
      },
    });
  });

  it('finds an active comment by id', async () => {
    const comment = { Id: 1, Message: 'Comentario', IsActive: true };

    commentRepo.findOne.mockResolvedValue(comment);

    await expect(service.findOne(1)).resolves.toBe(comment);
    expect(commentRepo.findOne).toHaveBeenCalledWith({
      where: { Id: 1, IsActive: true },
    });
  });

  it('throws when the comment does not exist', async () => {
    commentRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('marks a comment as read', async () => {
    const comment = { Id: 1, Message: 'Comentario', IsRead: false, IsActive: true };

    commentRepo.findOne.mockResolvedValue(comment);
    commentRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.update(1);

    expect(result.IsRead).toBe(true);
    expect(commentRepo.save).toHaveBeenCalledWith(comment);
  });

  it('soft deletes a comment', async () => {
    const comment = { Id: 1, Message: 'Comentario', IsActive: true };

    commentRepo.findOne.mockResolvedValue(comment);
    commentRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.remove(1);

    expect(result.IsActive).toBe(false);
    expect(commentRepo.save).toHaveBeenCalledWith(comment);
  });

  it('counts recent unread comments using days as priority', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-27T12:00:00.000Z'));
    commentRepo.count.mockResolvedValue(3);

    const result = await service.recentCount({ hours: 1, days: 2, unread: 'true' });

    expect(commentRepo.count).toHaveBeenCalledWith({
      where: {
        IsActive: true,
        CreatedAt: expect.any(Object),
        IsRead: false,
      },
    });
    expect(result).toEqual({
      count: 3,
      from: new Date('2026-04-25T12:00:00.000Z'),
      windowHours: 48,
      unread: 'true',
    });

    jest.useRealTimers();
  });
});
