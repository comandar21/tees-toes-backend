import { Router } from 'express'
import * as User from '../controllers/user'
import { authenticateJWT } from '../middleware/authenticateJWT'
import ensureLoggedIn from '../middleware/ensureLoggedIn'

const router = Router()
router.get("/test", (req, res) => {
    console.log("testing");
    res.send({ msg: "success" })
})
router.post('/', (req, res) => User.user(req, res))
router.use(ensureLoggedIn)

export default router

const user = [
    {
        name: "abc",
        email: "abc@gmail.com",
        username: "abcdef"
    }
]

