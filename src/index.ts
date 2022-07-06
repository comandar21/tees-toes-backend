require('dotenv').config()
import * as nconf from 'nconf'

// setup nconf
nconf.argv()
  .env()
  .defaults({
    DATABASE_NAME: 'maha-referral',
    DATABASE_URI: 'mongodb://127.0.0.1:27017/tees-totes',
    JWT_SECRET: 'secret_keyboard_cat',
    SITE_URL: 'http://localhost:3000',
  })
  .required(['DATABASE_URI',
    'DATABASE_NAME', 'JWT_SECRET',
  ])

import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import * as http from 'http'
import { open } from './database'
import routes from './routes'

export const app = express()
const server = new http.Server(app)

open()

app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))


app.use(routes)

const port = nconf.get('PORT') || 4410

// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port))
