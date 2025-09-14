import { Injectable } from '@nestjs/common';
import { CreateProjectProductDto } from './dto/create-project_product.dto';
import { UpdateProjectProductDto } from './dto/update-project_product.dto';

@Injectable()
export class ProjectProductService {
  create(createProjectProductDto: CreateProjectProductDto) {
    return 'This action adds a new projectProduct';
  }

  findAll() {
    return `This action returns all projectProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectProduct`;
  }

  update(id: number, updateProjectProductDto: UpdateProjectProductDto) {
    return `This action updates a #${id} projectProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectProduct`;
  }
}
