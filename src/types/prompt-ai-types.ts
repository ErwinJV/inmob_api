import { CreatePropertyInput } from '../property/dto/create-property.input';

export interface ParsedResponse {
  property: CreatePropertyInput;
  details: string;
}
