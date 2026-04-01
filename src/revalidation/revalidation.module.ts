import { Module } from '@nestjs/common';
import { RevalidationService } from './revalidation.service';

@Module({
  controllers: [],
  providers: [RevalidationService],
  exports: [RevalidationService],
})
export class RevalidationModule {}
