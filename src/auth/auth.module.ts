import { Module } from "@nestjs/common";
import { AuthorizationController } from "./auth.controller";
import { AuthorizationService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import UserLogin, { UserLoginSchema } from "@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserLogin.name,
        schema: UserLoginSchema,
        collection: 'user-login',
      },
    ]),
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})

export class AuthModule { }