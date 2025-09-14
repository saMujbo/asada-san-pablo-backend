import { Injectable } from '@nestjs/common';
import { CreateTraceProjectDto } from './dto/create-trace-project.dto';
import { UpdateTraceProjectDto } from './dto/update-trace-project.dto';

@Injectable()
export class TraceProjectService {
  constructor(
    @InjectRepository(TraceProject)
    private readonly traceProjectRepo: Repository<TraceProject>,
  ){}
  async create(createTraceProjectDto: CreateTraceProjectDto) {
    const newTraceProject = await this.traceProjectRepo.create(createTraceProjectDto)
  
    return await this.traceProjectRepo.save(newTraceProject)
  }

 async findAll() {
    return await this.traceProjectRepo.find({where:{IsActive:true}});
  }

  async findOne(id: number) {
    const foundTraceProject = await this.traceProjectRepo.findOne({
    Where:{Id,IsActive:true},
    })
        if(!foundTraceProject) throw new NoFoundExeception(`TraceProject with Id ${Id} not found`)
    return foundTraceProject;
  }

  async update(Id: number, updateTraceProjectDto: UpdateTraceProjectDto) {
    const updateTraceProject = await this.traceProjectRepo.findOne({where:{Id}});

    if(!updateTraceProject) throw new NotFoundException(`TraceProject with Id ${Id} not found`)
      if(updateTraceProjectDto.Name !== undefined && updateTraceProjectDto.Name != null && updateTraceProjectDto.Name!='')
        updateTraceProject.Name = updateTraceProjectDto.Name;
    if (updateTraceProject.date !== undefined) updateTraceProject.date = updateTraceProject.date as any;
        updateTraceProject.date = updateTraceProjectDto.date;
      if(updateTraceProjectDto.Observation !== undefined && updateTraceProjectDto.Observation != null updateTraceProjectDto.Observation !='')
          updateTraceProject.Observation = updateTraceProjectDto.Observation;

    return await this.traceProjectRepo.save(updateTraceProject);
  }

  async remove(Id: number) {
    const traceProject = await this.findOne(Id);

    traceProject.IsActive = false;
    return await this.traceProjectRepo.save(traceProject);
  }

    async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);

    return await this.traceProjectRepo.save(updateActive);
  }
}
