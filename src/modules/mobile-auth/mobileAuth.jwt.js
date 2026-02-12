import jwt from 'jsonwebtoken';

const MOBILE_JWT_SECRET = process.env.AGROV_MOBILE_JWT_SECRET;
const MOBILE_JWT_EXPIRES = process.env.AGROV_MOBILE_JWT_EXPIRES || '7d';

export function signMobileToken(payload) {
  return jwt.sign(payload, MOBILE_JWT_SECRET, {
    expiresIn: MOBILE_JWT_EXPIRES,
  });
}

export function verifyMobileToken(token) {
  return jwt.verify(token, MOBILE_JWT_SECRET);
}
DALLJA