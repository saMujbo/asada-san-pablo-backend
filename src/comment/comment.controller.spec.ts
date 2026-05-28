import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: {
    create: jest.Mock;
    findAll: jest.Mock;
    search: jest.Mock;
    recentCount: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    commentService = {
      create: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      recentCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: commentService,
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to the service', () => {
    const dto = { Message: 'Nueva observacion' };
    const created = { Id: 1, ...dto };

    commentService.create.mockReturnValue(created);

    expect(controller.create(dto)).toBe(created);
    expect(commentService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to the service', () => {
    const comments = [{ Id: 1, Message: 'Comentario' }];

    commentService.findAll.mockReturnValue(comments);

    expect(controller.findAll()).toBe(comments);
    expect(commentService.findAll).toHaveBeenCalled();
  });

  it('delegates search to the service', () => {
    const query = { page: 1, limit: 10, read: 'false' };
    const response = { data: [], meta: { total: 0 } };

    commentService.search.mockReturnValue(response);

    expect(controller.search(query)).toBe(response);
    expect(commentService.search).toHaveBeenCalledWith(query);
  });

  it('delegates recentCount to the service', () => {
    const query = { hours: 24, unread: 'true' };
    const response = { count: 2 };

    commentService.recentCount.mockReturnValue(response);

    expect(controller.recentCount(query)).toBe(response);
    expect(commentService.recentCount).toHaveBeenCalledWith(query);
  });

  it('delegates findOne to the service', () => {
    const comment = { Id: 1, Message: 'Comentario' };

    commentService.findOne.mockReturnValue(comment);

    expect(controller.findOne(1)).toBe(comment);
    expect(commentService.findOne).toHaveBeenCalledWith(1);
  });

  it('delegates update to the service', () => {
    const updated = { Id: 1, IsRead: true };

    commentService.update.mockReturnValue(updated);

    expect(controller.update(1)).toBe(updated);
    expect(commentService.update).toHaveBeenCalledWith(1);
  });

  it('delegates remove to the service', () => {
    const removed = { Id: 1, IsActive: false };

    commentService.remove.mockReturnValue(removed);

    expect(controller.remove(1)).toBe(removed);
    expect(commentService.remove).toHaveBeenCalledWith(1);
  });
});
