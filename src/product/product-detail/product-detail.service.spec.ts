import { Test, TestingModule } from '@nestjs/testing';
import { ProductDetailService } from './product-detail.service';

describe('ProductDetailService', () => {
  let service: ProductDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductDetailService],
    }).compile();

    service = module.get<ProductDetailService>(ProductDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
