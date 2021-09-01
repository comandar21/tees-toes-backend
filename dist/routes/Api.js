"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const express_1 = require("express");
const router = express_1.Router();
const cors = require('cors');
const user_1 = require("./user");
router.use('/user', user_1.default);
router.use(authenticateJWT_1.authenticateJWT);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ENABLE_SENTRY = false;
router.use((error, _request, response, _next) => {
    const status = error.status || 500;
    if (!IS_PRODUCTION && status >= 500)
        console.log(error);
    response.status(status);
    response.json({
        status: error.status,
        message: ENABLE_SENTRY ? response.sentry : error.message,
        error: {}
    });
});
exports.default = router;
//# sourceMappingURL=api.js.map