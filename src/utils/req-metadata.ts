import { AnyCnameRecord } from 'dns';
import { Request } from 'express';
import { get } from 'lodash';

export const getRequestMetadata = (req: Request & AnyCnameRecord) => {
  let ip: string;
  if (req.headers['x-forwarded-for']) {
    [ip] = get(req.headers, 'x-forwarded-for', '').toString().split(',');
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }

  return {
    ip,
    user_agent: req.get('user-agent')
  }
}
