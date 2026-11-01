"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./app/config"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlwares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middlwares/notFound"));
const app = (0, express_1.default)();
// Parsers with 50mb limit for AI room image uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS Configuration
const allowedOrigins = [
    config_1.default.client_url,
    'http://localhost:3000',
    'http://localhost:5173',
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // Dev-friendly permissive
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Application routes
app.use('/api/v1', routes_1.default);
// Root Healthcheck
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✨ Curtain AI AI Studio Engine & Management Backend API is Live!',
        version: '1.0.0',
        documentation: '/api/v1',
    });
});
// Global error handler
app.use(globalErrorHandler_1.default);
// Not found route handler
app.use(notFound_1.default);
exports.default = app;
