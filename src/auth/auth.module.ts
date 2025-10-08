import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/app.config';
import { IConfig } from 'src/config/types';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (cfg: IConfig) => ({
        secret: cfg.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
