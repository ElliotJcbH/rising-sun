import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutController } from './about.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [],
  controllers: [AppController, AboutController, AuthController], // AboutController is a Test Controller
  providers: [AppService, AuthService],
})
export class AppModule {}