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

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }: { req: Request }) => ({ req }),
      introspection: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env['DB_NAME'],
      host: process.env['DB_HOST'],
      port: process.env['DB_PORT'] as unknown as number,
      password: process.env['DB_PASSWORD'],
      username: process.env['DB_USERNAME'],
      entities: [__dirname + '/**/*/.entity.{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    PropertyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
