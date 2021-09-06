import { Router } from 'express'
import * as Twitter from '../controllers/twitter'

const router = Router()

router.post('/oauth/request_token', async (req, res) => Twitter.oAuthRequestToken(req, res))
router.post('/oauth/access_token', async (req, res) => Twitter.oAuthAccessToken(req, res))
router.get('/users/profile_banner', async (req, res) => Twitter.userProfileBanner(req, res));
router.post('/logout', async (req, res) => Twitter.twitterLogout(req, res));

export default router

