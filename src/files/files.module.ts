import { Module } from '@nestjs/common';
import { FilesService } from './files.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [],
  providers: [FilesService],
})
export class FilesModule {}
