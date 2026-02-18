
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from 'src/users/entities/user.entity';

config({ path: '.env' });


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '10'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  
  entities: [User],
  
  synchronize: process.env.NODE_ENV === 'dev', 
  logging: process.env.NODE_ENV === 'dev',
};

export default new DataSource(dataSourceOptions);