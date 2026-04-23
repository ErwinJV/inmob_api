import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

import { CreatePromptAiDto } from './dto/create-prompt-ai.dto';
import { ParsedResponse } from 'src/types/prompt-ai-types';

@Injectable()
export class PromptAiService {
  constructor() {}

  async parseMessageToProperty(createPromptAiDto: CreatePromptAiDto) {
    const { message } = createPromptAiDto;

    try {
      const query = `System: Extract clean JSON from Venezuelan Spanish WhatsApp text. Properties are in Maracaibo, Venezuela. Match schema.

Rules:
- Output ONLY valid JSON. No markdown/text.
- Venezuelan Spanish terms: P/E=puesto=parking, maletero=storage, cava=wine cellar, vestier=walk-in closet, cerco electrico=electric fence, hidroneumatico=water pressure system, cocina empotrada=built-in kitchen.
- Keep Spanish for title, description, place. Do NOT mention Maracaibo or Zulia in description since all properties are local.
- Enums: status=SALE|RENT, type=HOUSE|APARTMENT.
- Price always USD. Strip $/Bs/COP/./,. Return number only.
- Strip emojis/special chars from output.
- Unknown numeric fields=0. No nulls. Exclude main_picture_url.

Location (Maracaibo only - CRITICAL):
- Analyze the text for spatial relationships: "cerca de", "frente a", "al lado de", "detras de", "a dos cuadras de", "por", "zona de", "sector", "urbanizacion", "conjunto residencial".
- Identify the reference point: landmark, building, shopping center, plaza, avenue, university, hospital, or known area.
- If the property is described relative to a reference point, estimate coordinates near that reference point.
- If the property location is explicitly stated (address, urbanization, sector), use that directly and estimate its coordinates.
- If multiple reference points exist, use the most specific one.
- If location is found, set place with the address and set coordinates accordingly.
- If location is vague and coordinates cannot be determined, set lat and long to Maracaibo center (10.6427, -71.6125) and set place to empty string.
- NEVER return coordinates outside Maracaibo metropolitan area.

Title (max 125 chars):
- Base format: "[Tipo] en [Operacion] en [Lugar]"
- If a standout feature exists (pool, large area, remodeled, luxury, beachfront), append it: "[Tipo] en [Operacion] en [Lugar] - [destacado]"
- The destacado must be a single key feature that makes the property distinctive.
- Keep it concise. Do not list multiple features. Do not include price or contact info.
- If place is empty, use: "[Tipo] en [Operacion] - [destacado]"

Description (max 1900 chars):
- Clean, concise paragraph. Remove noise, redundancy, contact info, scattered formatting.
- Do NOT state the city or country. Focus only on property details, features, and location within Maracaibo.

Details rules (CRITICAL):
- Write in Spanish, using plain user language.
- Explain what fields could not be determined precisely and why.
- Do NOT use technical enum values like SALE, RENT, HOUSE, APARTMENT. Use: "Venta", "Alquiler", "Casa", "Apartamento".
- If coordinates defaulted to Maracaibo center, say: "No se pudo determinar la ubicacion exacta. Se usaron coordenadas generales de Maracaibo."
- If all fields were clear, say: "Todos los campos se determinaron correctamente."

Response format (CRITICAL):
Return a JSON object with this exact structure:
{
  "property": {
    "area": number,
    "description": "string (max 1900)",
    "lat": number,
    "long": number,
    "num_bathrooms": number,
    "num_bedrooms": number,
    "num_parking_lot": number,
    "num_pools": number,
    "place": "string (max 125, empty if coordinates defaulted)",
    "price": number,
    "status": "SALE"|"RENT",
    "title": "string (max 125)",
    "type": "HOUSE"|"APARTMENT"
  },
  "details": "string in Spanish with user-friendly terms only"
}

Text:
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
      console.error('Error parsing message to property:', error);
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
      return JSON.parse(input) as ParsedResponse;
    }

    return JSON.parse(match[1]) as ParsedResponse;
  }
}
