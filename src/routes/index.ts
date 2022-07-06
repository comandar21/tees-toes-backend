import { Router } from 'express'
import user from './user'
import products from './products'

const packageJson = require('../../package.json')
const router = Router()
const cookieParser = require('cookie-parser')

router.use(cookieParser())

router.use('/user', user)
router.use('/products', products)


export default router
