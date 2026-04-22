import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

import { CreatePromptAiDto } from './dto/create-prompt-ai.dto';

import { CreatePropertyInput } from 'src/property/dto/create-property.input';

import { PropertyService } from 'src/property/property.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PromptAiService {
  constructor(
    private readonly userService: UsersService,
    private readonly propertyService: PropertyService,
  ) {}

  async parseMessageToProperty(createPromptAiDto: CreatePromptAiDto) {
    const { message } = createPromptAiDto;

    try {
      const query = `System: Extract clean JSON from Venezuelan Spanish WhatsApp real estate text. Match schema.

Rules:
- Output ONLY valid JSON. No markdown/text.
- Venezuelan Spanish terms: P/E=puesto=parking, maletero=storage, cava=wine cellar, vestier=walk-in closet, cerco electrico=electric fence, hidroneumatico=water pressure system, cocina empotrada=built-in kitchen.
- Keep Spanish for title, description, place.
- Enums: status=SALE|RENT, type=HOUSE|APARTMENT.
- Price always USD. Strip $/Bs/COP/./,. Return number only.
- Strip all emojis/special chars from output.
- Unknown numeric fields=0. No nulls. Exclude main_picture_url.

Location rules (CRITICAL):
- ALL properties are located in Maracaibo, Zulia State, Venezuela.
- Search for the specific neighborhood/sector mentioned in the text within Maracaibo.
- If exact location is found, use its coordinates.
- If location is vague or not found, use Maracaibo city center coordinates: lat=10.6427, long=-71.6125.
- NEVER return coordinates outside Maracaibo metropolitan area.
- place field must always include "Maracaibo" or the neighborhood + "Maracaibo, Zulia".

Title (max 125 chars):
- Concise, descriptive. Format: "[Tipo] en [Operacion] en [Zona], Maracaibo - [destacado]". Ej: "Apartamento en Venta en Uracoa, Maracaibo - 3hab 2baños"

Description (max 1900 chars):
- CRITICAL: Clean, clear, concise paragraph. Remove all noise, redundancy, contact info, and scattered formatting from raw WhatsApp text.
- Synthesize into single flowing paragraph with only essential property details.
- Fix typos and standardize terms.

Schema:
{
  "area": number,
  "description": "string (max 1900, clean & concise)",
  "lat": number,
  "long": number,
  "num_bathrooms": number,
  "num_bedrooms": number,
  "num_parking_lot": number,
  "num_pools": number,
  "place": "string (max 125, always includes Maracaibo)",
  "price": number,
  "status": "SALE"|"RENT",
  "title": "string (max 125, includes Maracaibo)",
  "type": "HOUSE"|"APARTMENT"
}

Maracaibo reference coordinates:
- City center: 10.6427, -71.6125
- North area (Norte): 10.6725, -71.6150
- South area (Sur): 10.5920, -71.6200
- East area (Este): 10.6500, -71.5800
- West area (Oeste): 10.6400, -71.6500

WhatsApp text:
${message}`;

      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.AI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: query }],
        model: 'deepseek-chat',
      });

      console.log(completion.choices[0].message.content);
      return this.parseMarkdownJson(completion.choices[0].message.content);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private parseMarkdownJson(input: string | null) {
    if (!input) {
      throw new Error('Input is null');
    }
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const match = input.match(jsonRegex);

    if (!match || !match[1]) {
      throw new Error('No se encontró bloque JSON válido');
    }

    return JSON.parse(match[1]) as CreatePropertyInput;
  }
}
