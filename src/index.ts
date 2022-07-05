require('dotenv').config()
import * as nconf from 'nconf'
import * as User from '../src/controllers/user'
const { errorHandler, logger } = require('forest-express');

const {
  ensureAuthenticated,
  PUBLIC_ROUTES,
} = require('forest-express-mongoose');

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
import * as mongoose from 'mongoose'
import * as morgan from 'morgan'
import * as path from 'path'
import * as Sentry from '@sentry/node'
import { open } from './database'
import routes from './routes'
import * as jwt from 'express-jwt'

const cookieParser = require('cookie-parser')
export const app = express()
const server = new http.Server(app)

open()

app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))

app.use(morgan('dev'))

app.use(routes)
app.use(cookieParser());

const port = nconf.get('PORT') || 4410

// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port))
