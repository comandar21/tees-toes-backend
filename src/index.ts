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
    DATABASE_URI: 'mongodb://127.0.0.1:27017/maha-referral',
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

app.use(cookieParser());
app.use(routes)

const whitelist = [/\.forestadmin\.com$/, /localhost:\d{4}$/, /\.join\.mahadao\.com$/]; //white list consumers
const testCorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  credentials: true,
  headers: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept', 'x-jwt', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'content-type', 'access-token']
  //allowedHeaders: '*'
};
app.use(cors(testCorsOptions));

const addForestAdmin = async (app) => {

  // console.log()
  app.use(cors({
    origin: [/\.forestadmin\.com$/],
    allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
    credentials: true
  }))

  app.use('/forest', (request, response, next) => {
    if (PUBLIC_ROUTES.includes(request.url)) {
      return next()
    }
    return ensureAuthenticated(request, response, next)
  })

  const corsConfig: any = {
    origin: [/\.forestadmin\.com$/],
    allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
    maxAge: 86400, // NOTICE: 1 day
    credentials: true,
  }

  app.use('/forest/authentication', cors({
    ...corsConfig,
    // The null origin is sent by browsers for redirected AJAX calls
    // we need to support this in authentication routes because OIDC
    // redirects to the callback route
    origin: corsConfig.origin.concat('null')
  }))

  console.log(__dirname);


  app.use(await require('forest-express-mongoose').init({
    modelsDir: path.join(__dirname, '/database/models'),
    configDir: path.join(__dirname, '/database'),
    envSecret: process.env.FOREST_ENV_SECRET,
    authSecret: process.env.FOREST_AUTH_SECRET,
    mongoose
  }))

  app.use('/forest', jwt({
    secret: process.env.FOREST_AUTH_SECRET,
    credentialsRequired: false,
    algorithms: ['RS256']
  }))
  app.use('/forest', errorHandler({ logger }));
  app.use(cors(corsConfig))
}

addForestAdmin(app)


const port = nconf.get('PORT') || 4410

// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port))
