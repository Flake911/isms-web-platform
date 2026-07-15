import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseInterceptors, UploadedFile, Request, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { EvidenceService } from './evidence.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'evidence'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('api/evidence')
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.SecurityOfficer)
  create(@Body() data: any) { return this.service.create(data); }

  @Post('upload')
  @Roles(Role.SecurityOfficer)
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const data: any = {
      title: body.title || file?.originalname || 'Untitled',
      type: body.type || 'Document',
      referenceType: body.referenceType || null,
      referenceId: body.referenceId || null,
      tags: body.tags || null,
      description: body.description || null,
    };
    if (file) {
      data.fileName = file.originalname;
      data.filePath = file.filename;
      data.fileSize = file.size;
      data.mimeType = file.mimetype;
    }
    return this.service.create(data);
  }

  @Put(':id')
  @Roles(Role.SecurityOfficer)
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @Roles(Role.Auditor)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
