import { PartialType } from '@nestjs/mapped-types';
import { CreateRevalidationDto } from './create-revalidation.dto';

export class UpdateRevalidationDto extends PartialType(CreateRevalidationDto) {}
