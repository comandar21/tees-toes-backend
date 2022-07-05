import { Router } from 'express'
import user from './user'

const packageJson = require('../../package.json')
const router = Router()
const cookieParser = require('cookie-parser')

router.use(cookieParser())

router.use('/user', user)


export default router
