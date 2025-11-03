import { Test, TestingModule } from '@nestjs/testing';
import { ReportsGateway } from './reports.gateway';

describe('ReportsGateway', () => {
  let gateway: ReportsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsGateway],
    }).compile();

    gateway = module.get<ReportsGateway>(ReportsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
