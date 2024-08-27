import { AuthorizationService } from './auth.service';
import { Controller, Post, Body, Req } from '@nestjs/common';

@Controller('auth')
export class AuthorizationController {

  constructor(private readonly authorizationService: AuthorizationService) { }

  @Post('system-token')
  async createSystemToken(
    @Req() request: Request,
    @Body('email') email: string,
    @Body('password') pw: string,
  ) {
    const response = await this.authorizationService.createSystemToken(request, email, pw)
    return response;
  }

  @Post('login')
  async userLogin(
    @Body('email') email: string,
    @Body('password') pw: string,
    @Body('expired') expiredJWT: string,
  ) {
    const response = await this.authorizationService.userLogin(email, pw, expiredJWT);
    return response;
  }

  @Post('logout')
  userLogOut(
    @Body('username') username: string,
  ) {
    const response = this.authorizationService.userLogOut(username);
    return response;
  }

}