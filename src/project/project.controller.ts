import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectPaginationDto } from './dto/pagination-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get('search')
  Search(@Query() pagination:ProjectPaginationDto){
    return this.projectService.search(pagination);
  }

  @Get(':id/export/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const projectId = Number(id);
    const { buffer, filename } = await this.projectService.buildProjectPdf(projectId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Post(':id/cover-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadCoverImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen en el campo "file".');
    }

    return this.projectService.uploadCoverImage(id, file);
  }

  @Delete(':id/cover-image')
  removeCoverImage(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.removeCoverImage(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.projectService.remove(id);
  }
}
