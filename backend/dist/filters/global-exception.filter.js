"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || 'Error';
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof typeorm_1.QueryFailedError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            if (exception.message.includes('invalid input syntax for type uuid')) {
                message = 'Invalid UUID format';
                error = 'Bad Request';
            }
            else {
                message = exception.message;
                error = 'Database Error';
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        console.error(`[Exception] ${request.method} ${request.url}:`, exception);
        response.status(status).json({
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
exports.GlobalExceptionFilter = GlobalExceptionFilter;
//# sourceMappingURL=global-exception.filter.js.map