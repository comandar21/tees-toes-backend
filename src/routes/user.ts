import { Router } from 'express'
import * as User from '../controllers/user'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = Router()

router.post('/addUser', ((req, res) => User.addUser(req, res)))

router.use(authenticateJWT)

export default router

