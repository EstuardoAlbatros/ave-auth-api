import { Module } from "@nestjs/common";
import { AuthorizationController } from "./auth.controller";
import { AuthorizationService } from "./auth.service";

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
})

export class AuthModule { }