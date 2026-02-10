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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }: { req: Request }) => ({ req }),
      introspection: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*/.entity.{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      retryDelay: 3000,
      retryAttempts: 10,
      ssl: true,
      extra: {
        options: process.env.DB_ENDPOINT_ID
          ? `project=${process.env.DB_ENDPOINT_ID}`
          : 'project=ep-wispy-tooth-ahdjh5gr',
      },
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    PropertyModule,
    FilesModule,
    PromptAiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
