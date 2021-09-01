import BadRequestError from './BadRequestError'

export default class BadUrlParameterError extends BadRequestError {
  constructor(message?: string) {
    super('Bad URL Parameter')
  }
}
