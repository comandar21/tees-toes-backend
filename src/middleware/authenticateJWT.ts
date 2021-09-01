import * as nconf from 'nconf'
import * as jwt from 'jsonwebtoken'
import InvalidJWTError from '../errors/InvalidJWTError'


export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  const jwtHeader = req.headers['x-jwt']

  const token = jwtHeader ? jwtHeader : authHeader ? authHeader.split(' ')[1] : null
  if (token) {
    jwt.verify(token, nconf.get('JWT_SECRET'), (err, user) => {
      if (err) return next(new InvalidJWTError())
      if (err) return next()
      req.user = user
      next()
    })
  } else next()
}
