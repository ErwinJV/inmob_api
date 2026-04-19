import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PropertyModule } from './property/property.module';
import { FilesModule } from './files/files.module';
import { PromptAiModule } from './prompt-ai/prompt-ai.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RevalidationModule } from './revalidation/revalidation.module';

const isProduction = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: isProduction
        ? join(process.cwd(), 'src/schema.gql')
        : false,
      context: ({ req }: { req: Request }) => ({ req }),
      introspection: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*/.entity.{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: false,
      retryDelay: 3000,
      retryAttempts: 3,

      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false,
      extra: {
        options: process.env.DB_ENDPOINT_ID
          ? `project=${process.env.DB_ENDPOINT_ID}`
          : 'project=ep-wispy-tooth-ahdjh5gr',
        max: 1, // Solo 1 conexión para serverless
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 10000,
      },
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    PropertyModule,
    FilesModule,
    PromptAiModule,
    CloudinaryModule,
    RevalidationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
