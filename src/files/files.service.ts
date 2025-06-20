import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';

import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
  public constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}
  upload(createFileDto: CreateFileDto) {
    console.log(createFileDto);
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
