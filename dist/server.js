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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const curtain_service_1 = require("./app/modules/curtain/curtain.service");
const user_model_1 = require("./app/modules/user/user.model");
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.database_url);
            console.log('🍃 MongoDB connected successfully to Curtainz Studio database!');
            // Automatically seed fabric catalog if empty
            try {
                const seedResult = yield curtain_service_1.CurtainService.seedCurtainsIntoDB();
                if (seedResult.seeded) {
                    console.log(`✨ Seeded ${seedResult.count} initial curtains and fabrics.`);
                }
            }
            catch (seedErr) {
                console.warn('Fabric seed notice:', seedErr);
            }
            // Automatically seed default Admin user if none exists
            try {
                const existingAdmin = yield user_model_1.User.findOne({ email: 'admin@curtainz.ai' });
                if (!existingAdmin) {
                    yield user_model_1.User.create({
                        name: 'Curtainz Studio Admin',
                        email: 'admin@curtainz.ai',
                        password: 'admin123456',
                        role: 'admin',
                        phone: '+971 52 313 5707',
                        location: 'Dubai Design District (d3), UAE',
                        bio: 'Chief Store Administrator for Curtainz Studio Dubai',
                        status: 'active',
                    });
                    console.log('👑 Default Admin user created: admin@curtainz.ai / admin123456');
                }
            }
            catch (adminErr) {
                console.warn('Admin seed notice:', adminErr);
            }
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`🚀 Curtainz Backend Server is running on port ${config_1.default.port}`);
            });
        }
        catch (err) {
            console.error('Failed to start server:', err);
        }
    });
}
main();
process.on('unhandledRejection', (err) => {
    console.log(`😈 unhandledRejection detected:`, err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.log(`😈 uncaughtException detected:`, err);
    process.exit(1);
});
