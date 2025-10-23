import { DataSource } from 'typeorm';
import { dbConfig } from './db.config';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Request } from '../requests/entities/request.entity';

const dbConfiguration = dbConfig();

export const AppDataSource = new DataSource({
  ...dbConfiguration,
  synchronize: false,
  logging: true,
  entities: [User, Skill, Category, Request],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
