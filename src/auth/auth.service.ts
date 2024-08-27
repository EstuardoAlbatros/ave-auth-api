import { Request } from "express";
import { Connection, Types } from "mongoose";
import { createJWT } from "../utils/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { andWhere, buildQuery, where } from '@albatrosdeveloper/ave-utils-npm/lib/utils/query.util';
import UserLogin, { UserLoginDocument, UserLoginModelExt } from "@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.schema";
import Country, {
  CountryDocument,
  CountryModelExt,
} from '@albatrosdeveloper/ave-models-npm/lib/schemas/country/country.schema';

import get from 'lodash/get';
import pick from 'lodash/pick';
import cleanDeep from 'clean-deep';
import UserLoginAttributes from "@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.entity";

@Injectable()
export class AuthorizationService {

  constructor(
    @InjectModel(UserLogin.name)
    //private readonly userLoginModel: UserLoginModelExt<UserLoginDocument>,
    //TODO Create model in connector to import ModelExt and Document
    private readonly loggedUsersSessionModel: any,
    @InjectConnection() private readonly dbConnection: Connection,
  ) { }

  sanitizeUserData = (user: UserLoginAttributes & any) => {
    const data = pick(user, [
      '_id',
      'username',
      'firstName',
      'lastName',
      'phoneNumber',
      'photo',
      'email',
    ]);

    return data;
  }

  createSystemToken = async (req: Request & any, email: string, pw: string) => {
    try {
      let { apikeymetadata = {} } = req.headers;
      apikeymetadata = JSON.parse(apikeymetadata);
      if (!(apikeymetadata as any).allow_create_system_token) {
        throw new Error('Invalid action');
      }

      const user = await this.findUserByEmailAndPassword(email, pw);

      if (!user) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      if (user) {
        const token = createJWT(this.sanitizeUserData({}), '100y');
        const data: any = {
          _id: new Types.ObjectId(),
          username: `${user.username}-system`,
          enabled: true,
          salt: token.jwt,
        };

        //TODO Create model in connector to INSERT new token through service
        // await this.loggedUsersSessionModel.create([data]);
        await this.dbConnection.collection('logged_user_session').insertOne(data);
        return token;
      } else {
        throw new Error('Invalid user');
      }
    } catch (err) {
      throw err;
      //TODO Implement middleware
      //return errorsMiddleware(typedError, req, res);
    }
  }

  findUserByEmailAndPassword = async (email: string, pw: string): Promise<any> => {
    const userQuery = buildQuery<UserLoginAttributes>(
      where('email', email),
      andWhere('password', pw),
    )
    //const foundUser = await this.userLoginModel.findOne(userQuery);
    const foundUser = await this.dbConnection.collection('users_test').findOne({ email, password: pw });
    return foundUser;
  }

  userLogin = async (email: string, pw: string, expiredJWT: string) => {
    try {
      const user = await this.findUserByEmailAndPassword(email, pw);

      if (!user) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      const exp = expiredJWT || '1h';
      const token = createJWT(this.sanitizeUserData(user), exp, 'access_token');

      const data: any = {
        _id: new Types.ObjectId(),
        username: user.username,
        enabled: true,
        salt: token.jwt,
      };

      //TODO Create model in connector to INSERT new session through service
      // await this.loggedUsersSessionModel.create([data]);
      await this.dbConnection.collection('logged_user_session').insertOne(data);

      return cleanDeep({ ...token });
    } catch (err) {
      throw err;
      //TODO Implement middleware
      //return errorsMiddleware(typedError, req, res);
    }
  }

  userLogOut = async (username: string) => {
    try {

      const userQuery = buildQuery(
        where('username', username)
      );

      //TODO Create model in connector to INSERT new session through service
      //await this.loggedUsersSessionModel.deleteOne(userQuery);
      await this.dbConnection.collection('logged_user_session').deleteOne({ username });
      return true;
    } catch (err) {
      throw err;
      //TODO Implement middleware
      //return errorsMiddleware(typedError, req, res);
    }
  }

}