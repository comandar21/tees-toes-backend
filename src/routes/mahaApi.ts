import { authenticateJWT } from '../middleware/authenticateJWT'
import { Router } from 'express'
const router = Router()
const cors = require('cors')
import user from './user'

router.use('/user', user)
router.get('/testing', (() => {
  // console.log('testing');
}))
router.use(authenticateJWT)


const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const ENABLE_SENTRY = false

router.use((error, _request, response, _next) => {
  const status = error.status || 500
  if (!IS_PRODUCTION && status >= 500) console.log(error)

  response.status(status)
  response.json({
    status: error.status,
    message: ENABLE_SENTRY ? response.sentry : error.message,
    error: {}
  })
})


export default router
