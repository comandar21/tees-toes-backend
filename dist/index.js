"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require('dotenv').config();
const nconf = require("nconf");
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
// app.use(express.static('avatar'));
// app.use(express.static('post'));
exports.app.use(routes_1.default);
exports.app.use(cookieParser());
// const testCorsOptions = {
// 	origin: 'http://locahost:3000',
// 	methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
// 	optionsSuccessStatus: 200,
// 	credentials: true,
// 	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept', 'x-jwt', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'content-type']
// };
// app.use(cors(testCorsOptions));
// const corsOptions = {
// 	origin: "*",
// 	// allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
// 	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept', 'x-jwt', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'content-type'],
// 	credentials: true
// }
// app.use(cors(corsOptions))
// app.use(function (req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
// 	res.header("Access-Control-Allow-Headers", "Origin, Accept, Access-Control-Allow-Origin");
// 	next();
// });
// app.set("views", path.join(process.env.ROOT_PATH, "views"));
// app.set("view engine", "ejs");
// app.use(express.static(path.join(process.env.ROOT_PATH, "/css")))
const port = nconf.get('PORT') || 4410;
// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port));
//# sourceMappingURL=index.js.map