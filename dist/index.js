"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
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
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const database_1 = require("./database");
const routes_1 = require("./routes");
exports.app = express();
const server = new http.Server(exports.app);
database_1.open();
//app.use(cors())
exports.app.use(bodyParser.json({ limit: '100mb' }));
exports.app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
exports.app.use(morgan('dev'));
// app.use(express.static('avatar'));
// app.use(express.static('post'));
exports.app.use(routes_1.default);
// app.set("views", path.join(process.env.ROOT_PATH, "views"));
// app.set("view engine", "ejs");
// app.use(express.static(path.join(process.env.ROOT_PATH, "/css")))
const port = nconf.get('PORT') || 4410;
// app.use(express.static(path.join(process.env.ROOT_PATH, './client/build')))
server.listen(port, () => console.log('http://localhost:' + port));
//# sourceMappingURL=index.js.map