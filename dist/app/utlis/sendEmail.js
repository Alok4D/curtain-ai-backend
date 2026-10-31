"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendEmail = (to_1, html_1, ...args_1) => __awaiter(void 0, [to_1, html_1, ...args_1], void 0, function* (to, html, subject = 'Password Reset Request') {
    var _a, _b;
    // If host is smtp.gmail.com, use service: 'gmail' for best compatibility with Google App Passwords
    const isGmail = (_a = config_1.default.email_host) === null || _a === void 0 ? void 0 : _a.includes('gmail');
    const transportOptions = isGmail
        ? {
            service: 'gmail',
            auth: {
                user: config_1.default.email_user,
                pass: (_b = config_1.default.email_pass) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, ''),
            },
        }
        : {
            host: config_1.default.email_host,
            port: config_1.default.email_port,
            secure: config_1.default.email_port === 465,
            auth: {
                user: config_1.default.email_user,
                pass: config_1.default.email_pass,
            },
        };
    const transporter = nodemailer_1.default.createTransport(transportOptions);
    const info = yield transporter.sendMail({
        from: config_1.default.email_from,
        to,
        subject,
        text: 'Please reset your password using the link provided in the email.',
        html,
    });
    return info;
});
exports.sendEmail = sendEmail;
