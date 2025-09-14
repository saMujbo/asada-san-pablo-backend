import { Injectable } from '@nestjs/common';
import { CreateProjectStateDto } from './dto/create-project-state.dto';
import { UpdateProjectStateDto } from './dto/update-project-state.dto';

@Injectable()
export class ProjectStateService {
  create(createProjectStateDto: CreateProjectStateDto) {
    return 'This action adds a new projectState';
  }

  findAll() {
    return `This action returns all projectState`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectState`;
  }

  update(id: number, updateProjectStateDto: UpdateProjectStateDto) {
    return `This action updates a #${id} projectState`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectState`;
  }
}
