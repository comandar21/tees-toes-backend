import * as nconf from 'nconf'

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


export const app = express()
const server = new http.Server(app)

open()

//app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))

app.use(morgan('dev'))


// app.use(express.static('avatar'));
// app.use(express.static('post'));
app.use(routes)



// app.set("views", path.join(process.env.ROOT_PATH, "views"));
// app.set("view engine", "ejs");
// app.use(express.static(path.join(process.env.ROOT_PATH, "/css")))

const port = nconf.get('PORT') || 4410

// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port))
