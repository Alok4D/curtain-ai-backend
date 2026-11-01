"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.CurtainService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const curtain_model_1 = require("./curtain.model");
const curtain_seed_1 = require("./curtain.seed");
const cloudinary_1 = require("../../utlis/cloudinary");
const ALLOWED_COLORS = [
    'beige',
    'cream',
    'white',
    'off-white',
    'grey',
    'blue',
    'olive',
    'caramel',
    'mustard',
    'charcoal',
    'plum',
    'purple',
    'crimson',
    'red',
    'chestnut',
    'brown',
    'ivory',
    'sage',
    'slate',
];
const ALLOWED_STYLES = [
    'modern',
    'minimalist',
    'scandinavian',
    'classic',
    'contemporary',
    'luxury',
    'boho',
];
const ALLOWED_ROOMS = [
    'living-room',
    'bedroom',
    'dining-room',
    'office',
    'kids-room',
];
const ALLOWED_OPACITIES = [
    'sheer',
    'semi-sheer',
    'light-filtering',
    'room-darkening',
    'blackout',
];
const ALLOWED_CATEGORIES = ['curtains', 'sheers', 'rollers'];
const ALLOWED_PATTERNS = ['plain', 'striped', 'geometric', 'textured'];
const getAllCurtainsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { isDeleted: false };
    if (query.category && query.category !== 'all') {
        filter.category = query.category;
    }
    if (query.isActive !== undefined) {
        filter.isActive = query.isActive === 'true' || query.isActive === true;
    }
    if (query.searchTerm) {
        const searchRegex = new RegExp(query.searchTerm, 'i');
        filter.$or = [
            { name: searchRegex },
            { material: searchRegex },
            { fabric: searchRegex },
            { pattern: searchRegex },
            { texture: searchRegex },
            { category: searchRegex },
            { opacity: searchRegex },
            { colors: { $in: [searchRegex] } },
            { style: { $in: [searchRegex] } },
            { suitableRooms: { $in: [searchRegex] } },
        ];
    }
    const curtains = yield curtain_model_1.Curtain.find(filter).sort({ id: -1, createdAt: -1 });
    return curtains;
});
const getCurtainByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };
    const curtain = yield curtain_model_1.Curtain.findOne(query);
    if (!curtain) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found!');
    }
    return curtain;
});
const createCurtainIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.id) {
        const lastItem = yield curtain_model_1.Curtain.findOne().sort({ id: -1 });
        payload.id = (lastItem === null || lastItem === void 0 ? void 0 : lastItem.id) ? lastItem.id + 1 : Date.now();
    }
    // Auto-upload to Cloudinary if image is provided as base64 DataURL
    if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
        try {
            const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(payload.display_image_url, 'curtains');
            payload.display_image_url = uploadRes.secure_url;
            if (!payload.image_url || payload.image_url.startsWith('data:image')) {
                payload.image_url = uploadRes.secure_url;
            }
        }
        catch (uploadErr) {
            console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
        }
    }
    // Synchronize images array with image_url / display_image_url
    if (payload.images && payload.images.length > 0) {
        if (!payload.display_image_url) {
            payload.display_image_url = payload.images[0];
        }
        if (!payload.image_url) {
            payload.image_url = payload.images[0];
        }
    }
    else if (payload.display_image_url) {
        payload.images = [payload.display_image_url];
    }
    // Cross-sync fabric and material
    if (!payload.fabric && payload.material) {
        payload.fabric = payload.material;
    }
    if (!payload.material && payload.fabric) {
        payload.material = payload.fabric;
    }
    const result = yield curtain_model_1.Curtain.create(payload);
    return result;
});
const updateCurtainInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };
    // Auto-upload to Cloudinary if image is updated as base64 DataURL
    if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
        try {
            const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(payload.display_image_url, 'curtains');
            payload.display_image_url = uploadRes.secure_url;
            if (payload.image_url && payload.image_url.startsWith('data:image')) {
                payload.image_url = uploadRes.secure_url;
            }
        }
        catch (uploadErr) {
            console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
        }
    }
    // Sync images array
    if (payload.images && payload.images.length > 0) {
        if (!payload.display_image_url) {
            payload.display_image_url = payload.images[0];
        }
        if (!payload.image_url) {
            payload.image_url = payload.images[0];
        }
    }
    else if (payload.display_image_url) {
        payload.images = [payload.display_image_url];
    }
    if (payload.fabric && !payload.material) {
        payload.material = payload.fabric;
    }
    else if (payload.material && !payload.fabric) {
        payload.fabric = payload.material;
    }
    const result = yield curtain_model_1.Curtain.findOneAndUpdate(query, payload, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found to update!');
    }
    return result;
});
const deleteCurtainFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id) } : { _id: id };
    const result = yield curtain_model_1.Curtain.findOneAndUpdate(query, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found to delete!');
    }
    return result;
});
const seedCurtainsIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield curtain_model_1.Curtain.countDocuments({ isDeleted: false });
    if (count === 0) {
        yield curtain_model_1.Curtain.insertMany(curtain_seed_1.initialCurtainsSeedData);
        return { seeded: true, count: curtain_seed_1.initialCurtainsSeedData.length };
    }
    return { seeded: false, count };
});
const getCurtainRecommendationsFromDB = (roomImage) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (!roomImage) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Room image is required for recommendation analysis.');
    }
    const apiKey = (_a = config_1.default.openai_api_key) === null || _a === void 0 ? void 0 : _a.trim();
    if (!apiKey) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OpenAI API key is missing. Please configure OPENAI_API_KEY in the environment.');
    }
    let formattedImageUrl = roomImage.trim();
    // If local public image path, read and encode
    if (formattedImageUrl.startsWith('/')) {
        const fs = yield Promise.resolve().then(() => __importStar(require('fs')));
        const path = yield Promise.resolve().then(() => __importStar(require('path')));
        const candidatePaths = [
            path.join(process.cwd(), '../curtain-ai-frontend/public', formattedImageUrl.replace(/^\//, '')),
            path.join(process.cwd(), 'public', formattedImageUrl.replace(/^\//, '')),
        ];
        for (const cand of candidatePaths) {
            if (fs.existsSync(cand)) {
                const buffer = fs.readFileSync(cand);
                const ext = path.extname(cand).toLowerCase();
                const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                formattedImageUrl = `data:${mime};base64,${buffer.toString('base64')}`;
                break;
            }
        }
    }
    const promptInstruction = `
You are the Lead Interior Specialist and Senior Textile Stylist for Curtain AI Studio.
Your task is to analyze the provided room photograph and determine the ideal curtain specifications based on professional interior architecture and international color harmony principles:
1. 60-30-10 Rule: Analyze the 60% dominant space tones (wall paint, ceilings, flooring), 30% secondary tones (large upholstery, sofas, cabinets), and 10% accent notes (cushions, lighting metal, plants).
2. Tonal & Temperature Harmony: Harmonize warm undertones (warm wood, beige/cream walls) with warm neutrals (beige, cream, caramel, olive, sage) or subtle contrasts. Harmonize cool undertones (grey flooring, white marble, chrome) with cool palettes (slate, charcoal, navy blue, crisp white).
3. Lighting, Exposure & Room Function: Consider window orientation and daylight. Low-light or living rooms benefit from sheer / semi-sheer fabrics to illuminate the room; sunny bedrooms and offices benefit from room-darkening or blackout drapery.
4. Specialist Styling Advice: Provide an elegant, warm 2-3 sentence interior design rationale written from Curtain AI's Interior Specialist perspective, explaining why the chosen fabric palettes elevate this specific space.

CRITICAL REQUIREMENT:
You must strictly return JSON conforming to the requested schema. Use ONLY the provided enum values. Do NOT invent or hallucinate any other colors or categories.
`.trim();
    const apiPayload = {
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: promptInstruction,
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Analyze this room photo and provide curtain selection criteria according to Curtain AI interior design standards.',
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: formattedImageUrl,
                            detail: 'high',
                        },
                    },
                ],
            },
        ],
        response_format: {
            type: 'json_schema',
            json_schema: {
                name: 'curtain_interior_specialist_curation',
                strict: true,
                schema: {
                    type: 'object',
                    properties: {
                        roomSummary: {
                            type: 'string',
                            description: 'Concise 1-sentence architectural summary of the room, light level, and dominant decor tone.',
                        },
                        specialistAdvice: {
                            type: 'string',
                            description: "Warm, authoritative advice from Curtain AI's Interior Specialist explaining which colors, fabrics, and textures flatter the room.",
                        },
                        primaryStyle: {
                            type: 'string',
                            enum: ALLOWED_STYLES,
                        },
                        detectedRoom: {
                            type: 'string',
                            enum: ALLOWED_ROOMS,
                        },
                        recommendedCategories: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ALLOWED_CATEGORIES,
                            },
                        },
                        recommendedColors: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ALLOWED_COLORS,
                            },
                        },
                        recommendedOpacities: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ALLOWED_OPACITIES,
                            },
                        },
                        recommendedPatterns: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ALLOWED_PATTERNS,
                            },
                        },
                    },
                    required: [
                        'roomSummary',
                        'specialistAdvice',
                        'primaryStyle',
                        'detectedRoom',
                        'recommendedCategories',
                        'recommendedColors',
                        'recommendedOpacities',
                        'recommendedPatterns',
                    ],
                    additionalProperties: false,
                },
            },
        },
        temperature: 0.2,
    };
    const openAiResponse = yield fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(apiPayload),
    });
    if (!openAiResponse.ok) {
        const errData = (yield openAiResponse.json().catch(() => ({})));
        console.error('OpenAI Specialist recommendation error:', errData);
        const errMsg = ((_b = errData === null || errData === void 0 ? void 0 : errData.error) === null || _b === void 0 ? void 0 : _b.message) ||
            `OpenAI error (${openAiResponse.status}): ${openAiResponse.statusText}`;
        throw new AppError_1.default(openAiResponse.status || http_status_1.default.INTERNAL_SERVER_ERROR, errMsg);
    }
    const responseJson = (yield openAiResponse.json());
    const content = (_e = (_d = (_c = responseJson === null || responseJson === void 0 ? void 0 : responseJson.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content;
    if (!content) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to receive criteria from Interior Specialist analysis.');
    }
    const criteria = JSON.parse(content);
    // Query catalog from DB
    const allCurtains = yield curtain_model_1.Curtain.find({ isActive: true, isDeleted: false });
    // Weighted scoring
    const scoredCurtains = allCurtains.map((curtain) => {
        let score = 20; // baseline score
        const matchReasons = [];
        // 1. Color Match (up to 35 pts)
        const curColors = (curtain.colors || []).map((c) => c.toLowerCase());
        const matchedColors = curColors.filter((c) => criteria.recommendedColors.map((rc) => rc.toLowerCase()).includes(c));
        if (matchedColors.length > 0) {
            score += Math.min(35, 25 + matchedColors.length * 5);
            matchReasons.push(`Harmonizes with room palette (${matchedColors.join(', ')})`);
        }
        // 2. Room Suitability (up to 25 pts)
        const curRooms = (curtain.suitableRooms || []).map((r) => r.toLowerCase());
        if (curRooms.includes(criteria.detectedRoom.toLowerCase())) {
            score += 25;
            matchReasons.push(`Tailored for ${criteria.detectedRoom.replace('-', ' ')} spaces`);
        }
        // 3. Style match (up to 20 pts)
        const curStyles = (curtain.style || []).map((s) => s.toLowerCase());
        if (curStyles.includes(criteria.primaryStyle.toLowerCase())) {
            score += 20;
            matchReasons.push(`Complements ${criteria.primaryStyle} aesthetic`);
        }
        else if (curStyles.length > 0) {
            score += 10;
        }
        // 4. Opacity match (up to 15 pts)
        if (curtain.opacity &&
            criteria.recommendedOpacities
                .map((o) => o.toLowerCase())
                .includes(curtain.opacity.toLowerCase())) {
            score += 15;
            matchReasons.push(`Optimal daylight control (${curtain.opacity})`);
        }
        // 5. Category match (up to 5 pts)
        if (curtain.category && criteria.recommendedCategories.includes(curtain.category)) {
            score += 5;
        }
        // Calibrate percentage score
        const matchPercentage = Math.min(99, Math.max(68, Math.round(score)));
        return Object.assign(Object.assign({}, curtain.toObject()), { matchScore: score, matchPercentage, specialistNote: matchReasons.slice(0, 2).join(' • ') || 'Curated by Interior Specialist' });
    });
    // Sort descending by score
    scoredCurtains.sort((a, b) => b.matchScore - a.matchScore);
    // Return top 8 curated curtains
    const recommendedCurtains = scoredCurtains.slice(0, 8);
    return {
        roomSummary: criteria.roomSummary,
        specialistAdvice: criteria.specialistAdvice,
        primaryStyle: criteria.primaryStyle,
        detectedRoom: criteria.detectedRoom,
        recommendedCategories: criteria.recommendedCategories,
        recommendedColors: criteria.recommendedColors,
        recommendedCurtains,
        allCurtainsCount: allCurtains.length,
    };
});
exports.CurtainService = {
    getAllCurtainsFromDB,
    getCurtainByIdFromDB,
    createCurtainIntoDB,
    updateCurtainInDB,
    deleteCurtainFromDB,
    seedCurtainsIntoDB,
    getCurtainRecommendationsFromDB,
};
