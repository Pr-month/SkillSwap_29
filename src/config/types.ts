import { ConfigType } from '@nestjs/config';
import { appConfig } from './app.config';
import { dbConfig } from './db.config';
import { jwtConfig } from './jwt.config';
import { fileConfig } from './file.config';

export type IAppConfig = ConfigType<typeof appConfig>;
export type IDbConfig = ConfigType<typeof dbConfig>;
export type IJwtConfig = ConfigType<typeof jwtConfig>;
export type IFileConfig = ConfigType<typeof fileConfig>;
