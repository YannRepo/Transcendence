"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LoggerMiddleware = exports.LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        console.log(`req:`, {
            headers: req.headers,
            body: req.body,
            originalUrl: req.originalUrl,
        });
        getResponseLog(res);
        if (next) {
            next();
        }
    }
};
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
const getResponseLog = (res) => {
    const rawResponse = res.write;
    const rawResponseEnd = res.end;
    let chunkBuffers = [];
    console.log(`======>> Beginning res.write`);
    res.write = (...chunks) => {
        var _a;
        const resArgs = [];
        for (let i = 0; i < chunks.length; i++) {
            if (chunks[i])
                resArgs[i] = Buffer.from(chunks[i]);
            if (!chunks[i]) {
                res.once("drain", res.write);
                --i;
            }
        }
        if ((_a = Buffer.concat(resArgs)) === null || _a === void 0 ? void 0 : _a.length) {
            chunkBuffers = [...chunkBuffers, ...resArgs];
        }
        return rawResponse.apply(res, resArgs);
    };
    console.log(`========> Done writing, beginning res.end`);
    res.end = (...chunks) => {
        var _a;
        console.log(`========> Chunks gathered during res.write: ${typeof chunkBuffers}`, Buffer.from(chunkBuffers).toJSON());
        console.log(`========> Chunks to handle during res.end: ${typeof chunks}`, Buffer.from(chunks).toJSON());
        const resArgs = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`res.end chunk ${i} content: ${typeof chunks[i]}`, chunks[i]);
            if (chunks[i])
                resArgs[i] = Buffer.from(chunks[i]);
        }
        if ((_a = Buffer.concat(resArgs)) === null || _a === void 0 ? void 0 : _a.length) {
            chunkBuffers = [...chunkBuffers, ...resArgs];
        }
        const body = Buffer.concat(chunkBuffers).toString("utf8");
        res.setHeader("origin", "restjs-req-res-logging-repo");
        const responseLog = {
            response: {
                statusCode: res.statusCode,
                body: JSON.parse(body) || body || {},
                headers: res.getHeaders(),
            },
        };
        console.log("res: ", responseLog);
        rawResponseEnd.apply(res, resArgs);
        return responseLog;
    };
};
//# sourceMappingURL=logger.middlewares.js.map