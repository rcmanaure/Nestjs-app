import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared';
import { DatabaseModule } from './database';
import { UsersModule } from './modules/users';

@Module({
  imports: [CoreModule, SharedModule, DatabaseModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
