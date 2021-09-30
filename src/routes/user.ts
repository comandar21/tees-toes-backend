import { Router } from 'express'
import * as User from '../controllers/user'
import { authenticateJWT } from '../middleware/authenticateJWT'
import ensureLoggedIn from '../middleware/ensureLoggedIn'

const router = Router()

router.get('/test', ((req, res) => res.send({ message: 'hello world' })))
router.post('/addEmailContractAddress', ((req, res) => { User.addEmailContractAddress(req, res) }))
router.post('/checkMahaFollow', (req, res) => { User.checkMahaFollow(req, res) })
router.post('/editProfile', (req, res) => { User.editProfile(req, res) })
router.post('/getUser', (req, res) => { User.getUser(req, res) })
router.post('/getUserProfile', (req, res) => { User.getUserProfile(req, res) })
router.get('/referralCSV', (req, res) => { User.referralCSV(req, res) })
router.use(authenticateJWT)
router.get('/referralList', (req, res) => { User.referralList(req, res) })
router.get('/referralTree', (req, res) => { User.getReferralTree(req, res) })
router.delete('/deleteUser', (req, res) => { User.deleteUser(req, res) })
router.use(ensureLoggedIn)

export default router

