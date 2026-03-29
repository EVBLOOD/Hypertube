
import { config } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

config({ path: '.env' });

export const dataSourceOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '10'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
 
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV === 'dev', 
  logging: process.env.NODE_ENV === 'dev',
};

