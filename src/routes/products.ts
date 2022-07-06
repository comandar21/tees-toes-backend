import { Router } from 'express'
import * as Products from '../controllers/products'
import { authenticateJWT } from '../middleware/authenticateJWT'
import ensureLoggedIn from '../middleware/ensureLoggedIn'

const router = Router()
router.post('/addProduct', (req, res) => Products.addProduct(req, res))
// router.get('/getProducts', (req, res) => { Products.getProducts(req, res) })
router.use(ensureLoggedIn)

export default router

