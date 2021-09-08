import { Router } from 'express'
import api from './mahaApi'
import twitter from './twitter'

const packageJson = require('../../package.json')
const router = Router()
const cookieParser = require('cookie-parser')

router.use(cookieParser())

router.use('/api', api)
router.use('/twitter', twitter)


export default router
