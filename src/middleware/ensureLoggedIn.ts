import NotAuthorizedError from '../errors/NotAuthorizedError'


export default (request, _response, next) => {
  if (!request.user) return next(new NotAuthorizedError())
  next()
}
