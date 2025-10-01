import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAgentSupplierDto } from './dto/create-agent_supplier.dto';
import { UpdateAgentSupplierDto } from './dto/update-agent_supplier.dto';
import { Repository } from 'typeorm';

import { changeState } from 'src/utils/changeState';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentSupplier } from './entities/agent_supplier.entity';
import { LegalSupplierService } from 'src/legal-supplier/legal-supplier.service';

@Injectable()
export class AgentSupplierService {
  constructor(
    @InjectRepository(AgentSupplier)
    private readonly agentSupplierRepo: Repository<AgentSupplier>,
    private readonly legalSupplierSv: LegalSupplierService,
  ) {}

  async create(createAgentSupplierDto: CreateAgentSupplierDto) {
    const supplierExists = await this.legalSupplierSv.findOne(createAgentSupplierDto.LegalSupplierId);
    const newAgentSupplier = this.agentSupplierRepo.create({
      Name: createAgentSupplierDto.Name,
      Surname1: createAgentSupplierDto.Surname1,
      Surname2: createAgentSupplierDto.Surname2,
      Email: createAgentSupplierDto.Email,
      PhoneNumber: createAgentSupplierDto.PhoneNumber,
      LegalSupplier: supplierExists,
    });
    return await this.agentSupplierRepo.save(newAgentSupplier);
  }

  async findAll() {
    return await this.agentSupplierRepo.find({relations: ['LegalSupplier']});
  }

  async findOne(Id: number) {
    const found = await this.agentSupplierRepo.findOne({where:{Id, IsActive: true}, relations: ['LegalSupplier']});
    if(!found) throw new ConflictException(`AgentSupplier with ${Id} not found`);
    return found;
  }

  async update(Id: number, updateAgentSupplierDto: UpdateAgentSupplierDto) {
  const agentSupplier = await this.agentSupplierRepo.findOne({ where: { Id } });
  if (!agentSupplier) {
    throw new ConflictException(`AgentSupplier with Id ${Id} not found`);
  }

  if (updateAgentSupplierDto.Name?.trim()) {
    agentSupplier.Name = updateAgentSupplierDto.Name;
  }
  if (updateAgentSupplierDto.Surname1?.trim()) {
    agentSupplier.Surname1 = updateAgentSupplierDto.Surname1;
  }
  if (updateAgentSupplierDto.Surname2?.trim()) {
    agentSupplier.Surname2 = updateAgentSupplierDto.Surname2;
  }
  if (updateAgentSupplierDto.PhoneNumber?.trim()) {
    agentSupplier.PhoneNumber = updateAgentSupplierDto.PhoneNumber;
  }
  if (updateAgentSupplierDto.Email?.trim()) {
    agentSupplier.Email = updateAgentSupplierDto.Email;
  }
  if (updateAgentSupplierDto.IsActive !== undefined && updateAgentSupplierDto.IsActive !== null) {
    agentSupplier.IsActive = updateAgentSupplierDto.IsActive;
  }

  const saved = await this.agentSupplierRepo.save(agentSupplier);
  return saved; // ✅ devuelve JSON actualizado
}

  async remove(Id: number) {
    const agentSupplier = await this.agentSupplierRepo.findOneBy({Id});
    if(!agentSupplier) throw new ConflictException(`AgentSupplier with ${Id} not found`);
    agentSupplier.IsActive = false;
    return await this.agentSupplierRepo.save(agentSupplier);
  }

  async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive); 
  }
}