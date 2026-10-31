"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlwares/validateRequest"));
const visualizer_controller_1 = require("./visualizer.controller");
const visualizer_validation_1 = require("./visualizer.validation");
const router = express_1.default.Router();
router.post('/generate', (0, validateRequest_1.default)(visualizer_validation_1.VisualizerValidation.generateVisualizationValidationSchema), visualizer_controller_1.VisualizerController.generateImage);
router.get('/recent', visualizer_controller_1.VisualizerController.getRecentVisualizations);
exports.VisualizerRoutes = router;
