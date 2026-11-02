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
exports.VisualizerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const cloudinary_1 = require("../../utlis/cloudinary");
const visualizer_model_1 = require("./visualizer.model");
function toDataUrl(input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!input) {
            throw new Error('Image source is missing.');
        }
        if (input.startsWith('data:image/')) {
            // If it's non-standard (e.g. AVIF, HEIC, BMP), transcode to standard JPEG via Cloudinary
            if (input.startsWith('data:image/avif') ||
                input.startsWith('data:image/heic') ||
                input.startsWith('data:image/heif') ||
                input.startsWith('data:image/bmp')) {
                try {
                    if (config_1.default.cloudinary_cloud_name && config_1.default.cloudinary_api_key) {
                        const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(input, 'visualizer_transcode');
                        const jpgUrl = uploadRes.secure_url.replace(/\/upload\//, '/upload/f_jpg,q_90/');
                        const res = yield fetch(jpgUrl);
                        const buffer = yield res.arrayBuffer();
                        return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
                    }
                }
                catch (err) {
                    console.error('Failed to transcode non-standard image format via Cloudinary:', err);
                }
            }
            return input;
        }
        if (input.startsWith('http://') || input.startsWith('https://')) {
            const res = yield fetch(input);
            if (!res.ok) {
                throw new Error(`Failed to fetch image from URL: ${input} (${res.status})`);
            }
            const buffer = yield res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            let contentType = res.headers.get('content-type') || 'image/jpeg';
            if (contentType.includes('webp')) {
                contentType = 'image/webp';
            }
            else if (contentType.includes('png')) {
                contentType = 'image/png';
            }
            else {
                contentType = 'image/jpeg';
            }
            return `data:${contentType};base64,${base64}`;
        }
        // Handle local path in frontend public directory (e.g. /before_image.png)
        const candidatePaths = [
            path_1.default.join(process.cwd(), '../curtain-ai-frontend/public', input.replace(/^\//, '')),
            path_1.default.join(process.cwd(), 'public', input.replace(/^\//, '')),
        ];
        for (const candidate of candidatePaths) {
            if (fs_1.default.existsSync(candidate)) {
                const buffer = fs_1.default.readFileSync(candidate);
                const ext = path_1.default.extname(candidate).toLowerCase();
                const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                return `data:${mime};base64,${buffer.toString('base64')}`;
            }
        }
        throw new Error('Unsupported image format. Provide a valid URL or base64 dataUrl.');
    });
}
// Architectural styling prompt translation
function mapDrapeLength(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('puddle') || lower.includes('floor-length')) {
        return 'Floor-length with an elegant puddle break pooling slightly onto the floor';
    }
    if (lower.includes('sill-length') || lower.includes('sill')) {
        return 'Sill-length finishing precisely at the window sill trim without touching the radiator or wall beneath';
    }
    if (lower.includes('apron-length') || lower.includes('apron')) {
        return 'Apron-length extending 3 to 4 inches below the window sill apron';
    }
    // Default: Floor-skimming
    return 'Floor-skimming finishing precisely where the fabric gently touches the floor surface without break';
}
function mapDrapePosition(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('fully closed') || lower.includes('closed')) {
        return 'Fully closed and drawn together across the entire window expanse providing complete window coverage';
    }
    if (lower.includes('half open') || lower.includes('half')) {
        return 'Half open partially drawn across the sides while keeping the center opening clear to diffuse soft daylight';
    }
    if (lower.includes('fully open') || lower.includes('full open')) {
        return 'Fully open and pulled completely back to the window edges with neat vertical drape folds, exposing the entire window and natural daylight';
    }
    // Default: Framing sides
    return 'Framing sides symmetrically pulled to both sides of the window framing the glass cleanly while letting natural daylight stream through';
}
function mapCurtainRod(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('brass') || lower.includes('gold')) {
        return 'Luxurious warm brushed gold brass curtain rod with refined spherical finials and matching gold rings';
    }
    if (lower.includes('silver') || lower.includes('nickel') || lower.includes('chrome')) {
        return 'Sleek brushed nickel and polished silver metal curtain rod with contemporary minimalist end-caps';
    }
    if (lower.includes('hidden') || lower.includes('recessed')) {
        return 'Hidden ceiling track recessed seamlessly into a ceiling pelmet/pocket with the drapes floating effortlessly from the ceiling';
    }
    if (lower.includes('ceiling track') || lower.includes('track')) {
        return 'Slim flush ceiling-mounted architectural curtain track cleanly integrated along the ceiling plane';
    }
    // Default: Matte Black
    return 'Matte black architectural minimalist curtain rod with matching black rings and low-profile brackets mounted just below the ceiling';
}
function mapHeaderStyle(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('pinch') || lower.includes('tailored pleat')) {
        return 'Tailored triple pinch pleat header with crisp stitched top pleats fanning into graceful vertical drapery folds';
    }
    if (lower.includes('eyelet') || lower.includes('grommet')) {
        return 'Contemporary metallic eyelet grommet rings punched through the top header and threaded over the rod, creating deep uniform cylindrical S-curves';
    }
    if (lower.includes('pencil')) {
        return 'Traditional pencil pleat header featuring a neat row of tightly gathered uniform vertical folds';
    }
    if (lower.includes('tab')) {
        return 'Casual tab top header with fabric loops sewn to the upper hem sliding directly onto the rod';
    }
    // Default: Wave Header
    return 'Contemporary wave header (S-Fold ripple drape) creating smooth, uninterrupted rolling waves from top to bottom';
}
function mapFabricOpacity(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('blackout')) {
        return '100% total room-darkening blackout opacity with solid weave blocking direct light transmission through the fabric';
    }
    if (lower.includes('semi-sheer') || lower.includes('semi sheer')) {
        return 'Semi-sheer weave providing gentle light diffusion while preserving daytime privacy with a soft interior glow';
    }
    if (lower.includes('sheer')) {
        return 'Airy translucent sheer voile weave allowing outdoor daylight and soft ambient illumination to illuminate the room naturally';
    }
    if (lower.includes('light-filtering') || lower.includes('light filtering')) {
        return 'Light-filtering weave that softens harsh direct sun glare while keeping the room naturally bright';
    }
    // Default: Auto / match fabric swatch
    return 'Preserve the natural light-filtering characteristics and native opacity of the catalog fabric swatch (IMAGE 2)';
}
function mapPleatDensity(val) {
    const lower = (val || '').toLowerCase();
    if (lower.includes('full') || lower.includes('heavy') || lower.includes('luxury')) {
        return 'Full 2.5x to 3.0x luxury fullness with deep, generous cascading 3D vertical fabric ripples';
    }
    if (lower.includes('standard') || lower.includes('light')) {
        return 'Standard 1.5x fullness with tailored, clean, and spaced vertical fabric folds';
    }
    // Default: Medium
    return 'Balanced 2.0x designer fullness creating classic graceful drapery ripples with natural depth and weight';
}
const generateCurtainVisualization = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { roomImage, curtainImage, curtainId, curtainName = 'Selected Fabric', drapeLength = 'Floor-skimming', drapePosition = 'Framing sides', curtainRod = 'Matte Black', headerStyle = 'Wave Header', fabricOpacity = 'Auto', pleatDensity = 'Medium', userIp, userId, } = payload;
    const apiKey = (_a = config_1.default.openai_api_key) === null || _a === void 0 ? void 0 : _a.trim();
    const modelName = ((_b = config_1.default.image_model) === null || _b === void 0 ? void 0 : _b.trim()) || 'gpt-image-2.5-sunburst';
    if (!apiKey) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OpenAI API Key is missing. Please verify OPENAI_API_KEY in the backend .env file.');
    }
    // 1. Convert input images to Data URLs
    const [roomDataUrl, curtainDataUrl] = yield Promise.all([
        toDataUrl(roomImage),
        toDataUrl(curtainImage),
    ]);
    // Translate options into rich architectural rendering directives
    const mappedLength = mapDrapeLength(drapeLength);
    const mappedPosition = mapDrapePosition(drapePosition);
    const mappedRod = mapCurtainRod(curtainRod);
    const mappedHeader = mapHeaderStyle(headerStyle);
    const mappedOpacity = mapFabricOpacity(fabricOpacity);
    const mappedPleats = mapPleatDensity(pleatDensity);
    // 2. Construct precision prompt with strict room preservation invariance
    const promptInstruction = `
You are an expert architectural visualizer and photorealistic interior designer specialized in precision virtual curtain installations.

TASK:
You are provided with two images:
1. IMAGE 1: The user's target room photo containing one or more windows.
2. IMAGE 2: The catalog image showing the specific curtain, fabric, textile weave, pattern, and color.

EXECUTE THE FOLLOWING PRECISE EDIT:
1. WINDOW IDENTIFICATION: Identify the window(s), window glass, and window frame architecture in IMAGE 1.
2. CURTAIN FITTING & TEXTILE TRANSFER: Install the exact curtain fabric, color, texture, and pattern from IMAGE 2 over the window(s) of IMAGE 1.
3. ARCHITECTURAL STYLING & FIT SPECIFICATIONS:
   - Curtain Length: ${mappedLength}.
   - Drape Arrangement: ${mappedPosition}.
   - Mounting Hardware: ${mappedRod}.
   - Header Tailoring Style: ${mappedHeader}.
   - Fabric Light Opacity: ${mappedOpacity}.
   - Pleat Fullness & Density: ${mappedPleats}.
   - Physics & Realism: Render realistic fabric folds, vertical ripples, realistic textile weight, natural gravity drop, and accurate light pass-through according to the lighting angle in the original room.

CRITICAL INVARIANCE RULES (STRICT PRESERVATION):
- DO NOT change, alter, or re-render any other element of the room in IMAGE 1.
- DO NOT modify the walls, wall color, wallpapers, mouldings, or baseboards.
- DO NOT move, modify, replace, or alter any furniture (sofas, tables, chairs, beds), decorative items, lamps, ceiling lights, rugs, or plants.
- DO NOT change the flooring (hardwood, carpet, tiles).
- DO NOT change the room's camera perspective, depth of field, or architectural dimensions.
- The ONLY modification allowed is installing the curtain, hardware, and tailored drapery at the window opening, keeping the rest of the room 100% identical.

Output ONLY the modified room photograph with the newly fitted curtains.
`.trim();
    const apiPayload = {
        model: modelName,
        images: [{ image_url: roomDataUrl }, { image_url: curtainDataUrl }],
        prompt: promptInstruction,
        quality: 'high',
        size: 'auto',
        output_format: 'jpeg',
        output_compression: 90,
        n: 1,
    };
    const apiUrl = 'https://api.openai.com/v1/images/edits';
    const openAiResponse = yield fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(apiPayload),
    });
    if (!openAiResponse.ok) {
        const errData = (yield openAiResponse.json().catch(() => ({})));
        console.error('OpenAI visualizer generation error:', JSON.stringify(errData, null, 2));
        let errMsg = ((_c = errData === null || errData === void 0 ? void 0 : errData.error) === null || _c === void 0 ? void 0 : _c.message) ||
            `OpenAI error (${openAiResponse.status}): ${openAiResponse.statusText}`;
        if (openAiResponse.status === 401) {
            errMsg = 'OpenAI rejected the API key. Please check billing and key validity.';
        }
        else if (openAiResponse.status === 429) {
            errMsg = 'OpenAI rate limit or usage quota reached. Please check balance.';
        }
        else if (errMsg.includes('Invalid image data')) {
            const param = (_d = errData === null || errData === void 0 ? void 0 : errData.error) === null || _d === void 0 ? void 0 : _d.param;
            errMsg = `OpenAI could not process image${param ? ` (${param})` : ''}. Please ensure your room photo is in standard JPG or PNG format.`;
        }
        throw new AppError_1.default(openAiResponse.status || http_status_1.default.INTERNAL_SERVER_ERROR, errMsg);
    }
    const data = (yield openAiResponse.json());
    const b64Json = (_f = (_e = data === null || data === void 0 ? void 0 : data.data) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.b64_json;
    const directUrl = (_h = (_g = data === null || data === void 0 ? void 0 : data.data) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.url;
    if (!b64Json && !directUrl) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'OpenAI returned no fitted image result. Please check image inputs.');
    }
    const rawResult = b64Json ? `data:image/jpeg;base64,${b64Json}` : directUrl;
    // 3. Upload result to Cloudinary for permanent hosting
    let finalImageUrl = rawResult;
    let roomHostedUrl = roomImage;
    try {
        if (config_1.default.cloudinary_cloud_name && config_1.default.cloudinary_api_key) {
            const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(rawResult, 'visualizations');
            finalImageUrl = uploadRes.secure_url;
            if (roomImage.startsWith('data:image/')) {
                const roomUpload = yield (0, cloudinary_1.uploadToCloudinary)(roomImage, 'rooms');
                roomHostedUrl = roomUpload.secure_url;
            }
        }
    }
    catch (cloudErr) {
        console.warn('Cloudinary upload fallback to direct dataUrl:', cloudErr);
    }
    // 4. Save history record into MongoDB
    const record = yield visualizer_model_1.Visualization.create({
        roomImageUrl: roomHostedUrl,
        curtainImageUrl: curtainImage,
        generatedImageUrl: finalImageUrl,
        curtainName,
        curtainId,
        drapeLength,
        drapePosition,
        curtainRod,
        headerStyle,
        fabricOpacity,
        pleatDensity,
        userIp,
        userId,
    });
    return {
        id: record._id,
        imageUrl: finalImageUrl,
        originalRoomUrl: roomHostedUrl,
        curtainName,
        drapeLength,
        drapePosition,
        curtainRod,
        headerStyle,
        fabricOpacity,
        pleatDensity,
        createdAt: record.createdAt,
    };
});
const getRecentVisualizationsFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 8) {
    const result = yield visualizer_model_1.Visualization.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'name email');
    return result;
});
exports.VisualizerService = {
    generateCurtainVisualization,
    getRecentVisualizationsFromDB,
};
