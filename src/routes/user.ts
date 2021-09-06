import { Router } from 'express'
import * as User from '../controllers/user'
import { authenticateJWT } from '../middleware/authenticateJWT'
import ensureLoggedIn from '../middleware/ensureLoggedIn'

const router = Router()

router.use(authenticateJWT)
router.get('/test', ((req, res) => res.send({ message: 'hello world' })))
router.post('/addEmailContractAddress', ((req, res) => { User.addEmailContractAddress(req, res) }))

router.post('/editProfile', (req, res) => { User.editProfile(req, res) })
router.get('/referralList', (req, res) => { User.referralList(req, res) })

router.use(ensureLoggedIn)

export default router

