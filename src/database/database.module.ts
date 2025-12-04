import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/nestjs-app'),
        // Remove deprecated options
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Enable transactions if needed
        // replicaSet: configService.get<string>('MONGODB_REPLICA_SET'),
        // Optional: allow the app to start even if MongoDB is not available initially
        bufferCommands: false,
        bufferMaxEntries: 0,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
