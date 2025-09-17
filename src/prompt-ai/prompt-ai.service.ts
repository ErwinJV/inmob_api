import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreatePromptAiDto } from './dto/create-prompt-ai.dto';

import { GoogleGenerativeAI } from '@google/generative-ai';
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
    const genAI = new GoogleGenerativeAI(
      process.env['GOOGLE_GEMINI_AI_API_KEY'] as string,
    );
    const { message } = createPromptAiDto;
    const schemaGql = `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

type PropertyImage {
  """
  """
  id: ID!
  property: Property!
  url: String!
}

type Property {
  """
  Property's id (uuid). Example: "f7d27564-939c-42f2-90f8-ee8eece4bc8c"
  """
  id: ID!

  """
  Property's title. Max character length: 25, Example: "Apartamento en Buena Vista. "
  """
  title: String!

  """
  Property's slug, generate based of the title property. Max character length: 25, Example: "Apartamento-en-Buena-Vista"
  """
  slug: String!

  """
  Property's status. Example: "SALE"
  """
  status: PropertyStatus!

  """
  Property's type. Example: "HOUSE"
  """
  type: PropertyType!

  """
  Property's description. Max character length: 125, Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc."
  """
  description: String!

  """
  Property's user id creator. Example: "1b8800a2-2385-403a-893b-3eba76ba4608"
  """
  userId: String!

  """
  Property's place. Example: "Av. Bella Vista Maracaibo, Zulia'
  """
  place: String!

  """
  Property's latitude (Google Maps). Example: "41.40338"
  """
  lat: Float

  """
  Property's longitude (Google Maps). Example: "2.17403"
  """
  long: Float

  """
  Property's total bathrooms. Example: "2"
  """
  num_bathrooms: Int

  """
  Property's total bedrooms. Example: "4"
  """
  num_bedrooms: Int

  """
  Property's total pools. Example: "1"
  """
  num_pools: Int

  """
  Property's total parkings lot. Example: "2"
  """
  num_parking_lot: Int

  """
  Property's date creation in epoch format (milliseconds) by Date.now(). Example: "1519211809934"
  """
  created_at: Float

  """
  Property's last update date in epoch format (milliseconds) by Date.now() method. Example: "1519211809934"
  """
  updated_at: Float

  """
  Property's user creator
  """
  user: User!
  images: [PropertyImage!]
}

"""
Status of property
"""
enum PropertyStatus {
  SALE
  RENT
}

"""
Type of property
"""
enum PropertyType {
  APARTMENT
  HOUSE
}

type User {
  """
  User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695"
  """
  id: String!

  """
  User's name: Example: "John"
  """
  name: String!

  """
  User's last name: Example: "Walker"
  """
  last_name: String!

  """
  User's email, must be unique. Example: "example@email.com"
  """
  email: String!

  """
  User's password. Must be encrypted
  """
  password: String!

  """
  Boolean data that shows whether the user is active or has been suspended."
  """
  is_active: Boolean!

  """
  Contains the user roles: Array  Example: ['USER', 'ADMIN']
  """
  roles: [String!]!

  """
  Users's date creation in epoch format (milliseconds) by Date.now(). Example: "1519211809934"
  """
  created_at: Float!

  """
  Property's last update date in epoch format (milliseconds) by Date.now(). Example: "1519211809934"
  """
  updated_at: Float!

  """
  Array that contains Properties created by the user
  """
  properties: [Property!]
}

type UsersDataResponse {
  """
  Total users registered in the database, this data is useful for pagination
  """
  total: Int!

  """
  Users, paginated by default in 10
  """
  users: [User!]!
}

type UserUpdateResponse {
  affected: Int
}

type AuthResponse {
  """
  Bearer token response, add this in your header request for several requests
  """
  access_token: String!
}

type AuthVerificationResponse {
  verification: Boolean!
}

type PropertiesDataResponse {
  total: Int!
  properties: [Property!]!
}

type PropertyUpdateResponse {
  affected: Int
}

type Query {
  """
  Return a paginated list of users, authorization bearer token is required in the header request
  """
  users(paginationDto: PaginationDto!): UsersDataResponse!

  """
  Return a single user required by id (uuid), authorization bearer token is required in the header request
  """
  user(id: String!): User!
  verifyAuthToken: AuthVerificationResponse!

  """
  Returns a paginated list of properties
  """
  properties(paginationDto: PaginationDto!): PropertiesDataResponse!

  """
  Return a single property by required term (property id or slug)
  """
  property(term: String!): Property!
}

input PaginationDto {
  limit: Int
  offset: Int
  order: String
}

type Mutation {
  """
  Create a user by createUserInput params, authorization bearer token is required in the header request
  """
  createUser(createUserInput: CreateUserInput!): User!

  """
  Update a single user by updateUserParams and required id (uuid), authorization bearer token is required in the header request
  """
  updateUser(updateUserInput: UpdateUserInput!): UserUpdateResponse!

  """
  Remove a single user required by a required id (uuid), authorization bearer token is required in the header request
  """
  removeUser(id: String!): User!
  login(authInput: AuthInput!): AuthResponse!

  """
  Create a property by createPropertyInput params, authorization bearer token is required in the header request
  """
  createProperty(createPropertyInput: CreatePropertyInput!): Property!

  """
  Update a single property by updatePropertyInput params and required id, authorization bearer token is required in the header request
  """
  updateProperty(
    updatePropertyInput: UpdatePropertyInput!
  ): PropertyUpdateResponse!

  """
  Remove a single property by required id, authorization bearer token is required in the header request
  """
  removeProperty(id: String!): Property!

  """
  Creates a multiple fake properties for development testing
  """
  createMultipleProperties(input: CreateMultiplePropertiesInput!): [Property!]!
}

input CreateUserInput {
  """
  User's name, Example: "John". This field is required | Maximum character length of 25
  """
  name: String!

  """
  User's last name, Example: "Walker". This field is required | Maximum character length of 25
  """
  last_name: String!

  """
  User's email, Example: "example@email.com". This field is required | Maximum character length of 25 | Must be unique
  """
  email: String!

  """
  User's password, Example: "Ghw~j'#>£F|A7FN=OS:6=/q27". This field is required | Maximum character length of 40
  """
  password: String!

  """
  User's roles, example: "['ADMIN',"USER']". This value is optional | If no value is provided, its default value will be "['USER']"
  """
  roles: [String!]
}

input UpdateUserInput {
  """
  User's name, Example: "John". This field is required | Maximum character length of 25
  """
  name: String

  """
  User's last name, Example: "Walker". This field is required | Maximum character length of 25
  """
  last_name: String

  """
  User's email, Example: "example@email.com". This field is required | Maximum character length of 25 | Must be unique
  """
  email: String

  """
  User's password, Example: "Ghw~j'#>£F|A7FN=OS:6=/q27". This field is required | Maximum character length of 40
  """
  password: String

  """
  User's roles, example: "['ADMIN',"USER']". This value is optional | If no value is provided, its default value will be "['USER']"
  """
  roles: [String!]

  """
  User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695". This field is required
  """
  id: String!
}

input AuthInput {
  """
  User's email, Example: "example@email.com". This field is required | Maximum character length of 25 | Must be unique
  """
  email: String!

  """
  User's password, Example: "Ghw~j'#>£F|A7FN=OS:6=/q27". This field is required | Maximum character length of 40
  """
  password: String!
}

input CreatePropertyInput {
  """
  Property's title, Example: "Apartamento en Buena Vista". This field is required | Maximum character length of 80
  """
  title: String!

  """
  Property's status. Example: "SALE". This field is required
  """
  status: PropertyStatus!

  """
  Property's type. Example: "HOUSE". This field is required
  """
  type: PropertyType!

  """
  Property's place. Example: "Av. Bella Vista Maracaibo, Zulia". This field is required | Maximum character length of 125
  """
  place: String!

  """
  Property's description. Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc.". This field is required | Maximum character length of 420
  """
  description: String!

  """
  Property's latitude (Google Maps). Example: "41.40338"
  """
  lat: Float

  """
  Property's longitude (Google Maps). Example: "2.17403"
  """
  long: Float

  """
  Property's total bathrooms. Example: "2"
  """
  num_bathrooms: Int

  """
  Property's total bedrooms. Example: "4"
  """
  num_bedrooms: Int

  """
  Property's total pools. Example: "1"
  """
  num_pools: Int

  """
  Property's total parkings lot. Example: "2"
  """
  num_parking_lot: Int
}

input UpdatePropertyInput {
  """
  Property's title, Example: "Apartamento en Buena Vista". This field is required | Maximum character length of 80
  """
  title: String

  """
  Property's status. Example: "SALE". This field is required
  """
  status: PropertyStatus

  """
  Property's type. Example: "HOUSE". This field is required
  """
  type: PropertyType

  """
  Property's place. Example: "Av. Bella Vista Maracaibo, Zulia". This field is required | Maximum character length of 125
  """
  place: String

  """
  Property's description. Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc.". This field is required | Maximum character length of 420
  """
  description: String

  """
  Property's latitude (Google Maps). Example: "41.40338"
  """
  lat: Float

  """
  Property's longitude (Google Maps). Example: "2.17403"
  """
  long: Float

  """
  Property's total bathrooms. Example: "2"
  """
  num_bathrooms: Int

  """
  Property's total bedrooms. Example: "4"
  """
  num_bedrooms: Int

  """
  Property's total pools. Example: "1"
  """
  num_pools: Int

  """
  Property's total parkings lot. Example: "2"
  """
  num_parking_lot: Int

  """
  User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695". This field is required
  """
  id: String!
}

input CreateMultiplePropertiesInput {
  properties: [CreatePropertyInput!]!
}
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(
        `En base a la estructura de mi schema.gql procesa el siguente mensage a un valor en objeto javascript que corresponda a la estructura de Property y pueda ser usado como parametro para la mutation createProperty, solo devuelve el objeto para parsearlo a objeto con el metodo JSON.parse(), sin ningun texto adicional, solo el objeto, y asegurate que las propiedades no excedan el limite de caracteres permitidos, esto lo puedes revisar en el texto del schema.gql
          Mensaje: ${message}.
          schema.gql:${schemaGql}`,
      );

      const res = result.response.text();
      const parseProperty = this.parseMarkdownJson(res);

      // await this.propertyService.create(user, processProperty);
      console.log({ parseProperty });
      return { parseProperty };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private parseMarkdownJson(input: string) {
    // Expresión regular para extraer el contenido JSON
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const match = input.match(jsonRegex);

    if (!match || !match[1]) {
      throw new Error('No se encontró bloque JSON válido');
    }

    return JSON.parse(match[1]) as CreatePropertyInput;
  }
}
