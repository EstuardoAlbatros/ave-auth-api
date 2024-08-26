import UserLogin, { UserLoginDocument, UserLoginModelExt } from "@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.schema";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createJWT } from "../utils/jwt";
import { Request } from "express";
import UserLoginAttributes from "@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.entity";
import { v4 as uuidv4 } from 'uuid';

import get from 'lodash/get';
import pick from 'lodash/pick';
import { getRequestMetadata } from "../utils/req-metadata";
import { andWhere, buildQuery, where } from '@albatrosdeveloper/ave-utils-npm/lib/utils/query.util';
import { Types } from "mongoose";
import moment from 'moment-timezone';
import cleanDeep from 'clean-deep';

@Injectable()

export class AuthorizationService {

  constructor(
    @InjectModel(UserLogin.name)
    private readonly userLoginModel: UserLoginModelExt<UserLoginDocument>,
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

  createSystemToken = (req: Request & any) => {
    try {
      const { apiKeyMetadata = {} } = req.headers;
      if (!(apiKeyMetadata as any).allow_create_system_token) {
        throw new Error('Invalid action');
      }

      //TODO Found user validation
      //if (userCreated) {
      if (true) {
        //TODO Found user validation
        const token = createJWT(this.sanitizeUserData({}), '100y');
        const data: any = {
          token: token.jwt,
          //TODO Found user validation
          user: 'example_user',
          session_id: uuidv4(),
          //TODO Found user validation
          name: `system_token: ${'example_username'}`,
          refresh_token: token.refresh_token,
          system: true,
          active: true,
          grant_type: token.grant_type,
          metadata: {
            ...getRequestMetadata(req),
            source: 'system'
          }
        };

        //TODO Create model in connector to INSERT new token through service
        // await Token.create([data]);
        return token;
      } else {
        throw new Error('Invalid user');
      }
    } catch (err) {
      //TODO
    }
  }

  findUserByEmailAndPassword = async (email: string, pw: string) => {
    const userQuery = buildQuery<UserLoginAttributes>(
      where('email', email),
      andWhere('password', pw),
    )
    const foundUser = await this.userLoginModel.findOne(userQuery);
    return foundUser;
  }

  userLogin = async (email: string, pw: string, expiredJWT: string, req: Request & any) => {
    try {
      const user = await this.findUserByEmailAndPassword(email, pw);

      if (!user) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      //TODO Implement middleware pkg to obtain permissions
      /* const permissionsId = get(user, 'permissions_id');
      const foundRoleGroup = await RoleGroup.findOne() */

      const exp = expiredJWT || '1h';
      const token = createJWT(this.sanitizeUserData(user), exp, 'access_token');

      const data: any = {
        token: token.jwt,
        user: user._id.toString(),
        name: `access_token: ${user.username}`,
        session_id: uuidv4(),
        refresh_token: token.refresh_token,
        grant_type: token.grant_type,
        metadata: {
          ...getRequestMetadata(req),
          source: 'login'
        }
      };

      const sessionData = {
        _id: new Types.ObjectId(),
        user_session_id: get(data, 'session_id'),
        model: 'User',
        user_id: get(data, 'user'),
        platform: get(req.body, 'platform', 'web'),
        ip_address: get(data, 'metadata.ip'),
        device_id: get(req.body, 'device_id'),
        device_name: get(req.body, 'device_name'),
        user_agent: get(data, 'metadata.user_agent'),
        exp: moment().add(...exp.split(/(\d+)/).filter((x) => x)).toDate(),
        _deleted: false,
        created_at: new Date()
      }

      //TODO Create model in connector to INSERT new token through service
      //await Token.create([data]);

      //TODO Create model in connector to INSERT new session through service
      //await UserSession.create([sessionData]);

      return cleanDeep({ ...token, change_password: get(user, 'settings.change_password') });
    } catch (err) {
      throw err;
      //TODO Implement middleware
      //return errorsMiddleware(typedError, req, res);
    }
  }

}