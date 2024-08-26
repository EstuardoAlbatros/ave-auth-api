import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb+srv://admin:UPMpfRbnvllJQFFe@cab-0.qro8zhj.mongodb.net/ave?retryWrites=true&w=majority&appName=cab-0'),
  ],
  providers: [],
})
export class AppModule { }