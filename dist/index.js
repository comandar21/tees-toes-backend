"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require('dotenv').config();
const nconf = require("nconf");
const { errorHandler, logger } = require('forest-express');
const { ensureAuthenticated, PUBLIC_ROUTES, } = require('forest-express-mongoose');
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
]);
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const database_1 = require("./database");
const routes_1 = require("./routes");
const cookieParser = require('cookie-parser');
exports.app = express();
const server = new http.Server(exports.app);
database_1.open();
exports.app.use(cors());
exports.app.use(bodyParser.json({ limit: '100mb' }));
exports.app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
exports.app.use(morgan('dev'));
exports.app.use(cookieParser());
exports.app.use(routes_1.default);
const whitelist = [/\.forestadmin\.com$/, /localhost:\d{4}$/, /\.join\.mahadao\.com$/]; //white list consumers
const testCorsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
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
exports.app.use(cors(testCorsOptions));
// const addForestAdmin = async (app) => {
//   // console.log()
//   app.use(cors({
//     origin: [/\.forestadmin\.com$/],
//     allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
//     credentials: true
//   }))
//   app.use('/forest', (request, response, next) => {
//     if (PUBLIC_ROUTES.includes(request.url)) {
//       return next()
//     }
//     return ensureAuthenticated(request, response, next)
//   })
//   const corsConfig: any = {
//     origin: [/\.forestadmin\.com$/],
//     allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
//     maxAge: 86400, // NOTICE: 1 day
//     credentials: true,
//   }
//   app.use('/forest/authentication', cors({
//     ...corsConfig,
//     // The null origin is sent by browsers for redirected AJAX calls
//     // we need to support this in authentication routes because OIDC
//     // redirects to the callback route
//     origin: corsConfig.origin.concat('null')
//   }))
//   app.use(await require('forest-express-mongoose').init({
//     modelsDir: path.join(__dirname, '/database/models'),
//     configDir: path.join(__dirname, '/database'),
//     envSecret: process.env.FOREST_ENV_SECRET,
//     authSecret: process.env.FOREST_AUTH_SECRET,
//     mongoose
//   }))
//   app.use('/forest', jwt({
//     secret: process.env.FOREST_AUTH_SECRET,
//     credentialsRequired: false,
//     algorithms: ['RS256']
//   }))
//   app.use('/forest', errorHandler({ logger }));
//   app.use(cors(corsConfig))
// }
// addForestAdmin(app)
const port = nconf.get('PORT') || 4410;
// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port));
//# sourceMappingURL=index.js.map