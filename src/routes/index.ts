import { Router } from 'express'
import api from './api'
// import forestadmin from './forestadmin'
// import noAuth from './noAuth'
// import mediaServer from './mediaServerWebhook'
// import admindashboard from './admindashboard'

const packageJson = require('../../package.json')
const router = Router()

// router.use('/noAuth', noAuth)
// router.use('/mediaserver', mediaServer)
// // router.use('/api/admindashboard', admindashboard)
// router.get('/', (_request, response) => {
//   response.json({
//     name: 'yugen-server',
//     note: 'developed by vezures.com',
//     online: process.uptime(),
//     version: packageJson.version
//   })
// })

// router.use('/forest', forestadmin)
router.use('/api', api)


export default router
