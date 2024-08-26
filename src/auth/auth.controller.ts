import { Controller, Post, Body, Get, Param, Patch, Delete, Put, Req } from '@nestjs/common';
import { AuthorizationService } from './auth.service';

@Controller('auth')
export class AuthorizationController {

  constructor(private readonly authorizationService: AuthorizationService) { }

  @Post('system-token')
  createSystemToken(
    @Req() request: Request,
  ) {
    const response = this.authorizationService.createSystemToken(request)
    return response;
  }

  @Post('user-login')
  userLogin(
    @Req() request: Request,
    @Body('email') email: string,
    @Body('password') pw: string,
    @Body('expired') expiredJWT: string,
  ) {
    const response = this.authorizationService.userLogin(email, pw, expiredJWT, request);
    return response;
  }

  /* @Get()
  getAllProducts() {
    return this.authorizationService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id') prodId: number,) {
    return this.authorizationService.getOneProduct(prodId);
  }

  @Get('example-route/:id')
  getProduct2(@Param('id') prodId: number,) {
    return this.authorizationService.getOneProduct(prodId);
  }

  @Get(':id/example-route')
  getProduct3(@Param('id') prodId: number,) {
    return this.authorizationService.getOneProduct(prodId);
  }

  @Put(':id')
  updateProductPUT(@Param('id') prodId: number,
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('price') prodPrice: number,) {
    this.authorizationService.updateProduct(prodId, prodTitle, prodDesc, prodPrice);
    return this.authorizationService.getOneProduct(prodId);
  }

  @Patch(':id')
  updateProduct(@Param('id') prodId: number,
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('price') prodPrice: number,) {
    this.authorizationService.updateProduct(prodId, prodTitle, prodDesc, prodPrice);
    return this.authorizationService.getOneProduct(prodId);
  }

  @Delete(':id')
  removeProduct(@Param('id') prodId: number,) {
    this.authorizationService.deleteProduct(prodId);
    return this.authorizationService.getProducts();
  } */

}