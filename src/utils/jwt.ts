import { Request } from 'express';
import { get } from 'lodash';

import * as jwt from 'jsonwebtoken';

import fs from 'fs';
import path from 'path';
import randtoken from 'rand-token';
import jwtExpress from 'express-jwt';
import UserLoginAttributes from '@albatrosdeveloper/ave-models-npm/lib/schemas/userLogin/userLogin.entity';

export interface Token {
  jwt: string;
  refresh_token: string;
  grant_type?: string;
  user?: UserLoginAttributes | any;
}

const publicKey: any = fs.readFileSync(
  `${path.dirname(`${__dirname}/../../../`)}/jwtRS256.key.pub`
);

const privateKey = fs.readFileSync(`${path.dirname(`${__dirname}/../../../`)}/jwtRS256.key`);

export default jwtExpress({
  secret: publicKey,
  algorithms: ['RS256'],
  userProperty: 'payload',
  getToken: (req: Request): any => {
    if (
      get(req, 'headers.authorization') && get(req, 'headers.authorization', []).split(' ')[0] === 'Bearer'
    ) {
      return get(req, 'headers.authorization').split(' ')[1];
    }
    if (get(req, 'query.token')) {
      return get(req, 'query.token');
    }
    return undefined;
  }
});

export const createJWT = (user: Partial<UserLoginAttributes>, expiresIn = '30m', grantType = 'access_token', roleGroupName?): Token => {
  const new_user = {
    ...user,
    role_group_name: roleGroupName
  }
  return {
    jwt: jwt.sign({ user: new_user, grant_type: grantType }, privateKey, { algorithm: 'RS256', expiresIn }, undefined), refresh_token: randtoken.uid(256), grant_type: grantType, user: new_user
  };
}
