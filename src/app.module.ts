import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared';
// Temporarily disable database module to allow app to start without MongoDB
// import { DatabaseModule } from './database';
// import { UsersModule } from './modules/users';

@Module({
  imports: [CoreModule, SharedModule], // DatabaseModule, UsersModule
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
