import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { TCurtain } from './curtain.interface';
import { Curtain } from './curtain.model';
import { initialCurtainsSeedData } from './curtain.seed';
import { uploadToCloudinary } from '../../utlis/cloudinary';

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

const getAllCurtainsFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true' || query.isActive === true;
  }

  if (query.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm as string, 'i');
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

  const curtains = await Curtain.find(filter).sort({ id: -1, createdAt: -1 });
  return curtains;
};

const getCurtainByIdFromDB = async (id: string | number) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };

  const curtain = await Curtain.findOne(query);
  if (!curtain) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found!');
  }
  return curtain;
};

const createCurtainIntoDB = async (payload: TCurtain) => {
  if (!payload.id) {
    const lastItem = await Curtain.findOne().sort({ id: -1 });
    payload.id = lastItem?.id ? lastItem.id + 1 : Date.now();
  }

  // Auto-upload to Cloudinary if image is provided as base64 DataURL
  if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
    try {
      const uploadRes = await uploadToCloudinary(payload.display_image_url, 'curtains');
      payload.display_image_url = uploadRes.secure_url;
      if (!payload.image_url || payload.image_url.startsWith('data:image')) {
        payload.image_url = uploadRes.secure_url;
      }
    } catch (uploadErr) {
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
  } else if (payload.display_image_url) {
    payload.images = [payload.display_image_url];
  }

  // Cross-sync fabric and material
  if (!payload.fabric && payload.material) {
    payload.fabric = payload.material;
  }
  if (!payload.material && payload.fabric) {
    payload.material = payload.fabric;
  }

  const result = await Curtain.create(payload);
  return result;
};

const updateCurtainInDB = async (id: string | number, payload: Partial<TCurtain>) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };

  // Auto-upload to Cloudinary if image is updated as base64 DataURL
  if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
    try {
      const uploadRes = await uploadToCloudinary(payload.display_image_url, 'curtains');
      payload.display_image_url = uploadRes.secure_url;
      if (payload.image_url && payload.image_url.startsWith('data:image')) {
        payload.image_url = uploadRes.secure_url;
      }
    } catch (uploadErr) {
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
  } else if (payload.display_image_url) {
    payload.images = [payload.display_image_url];
  }

  if (payload.fabric && !payload.material) {
    payload.material = payload.fabric;
  } else if (payload.material && !payload.fabric) {
    payload.fabric = payload.material;
  }

  const result = await Curtain.findOneAndUpdate(query, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found to update!');
  }

  return result;
};

const deleteCurtainFromDB = async (id: string | number) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id) } : { _id: id };

  const result = await Curtain.findOneAndUpdate(query, { isDeleted: true }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found to delete!');
  }

  return result;
};

const seedCurtainsIntoDB = async () => {
  const count = await Curtain.countDocuments({ isDeleted: false });
  if (count === 0) {
    await Curtain.insertMany(initialCurtainsSeedData);
    return { seeded: true, count: initialCurtainsSeedData.length };
  }
  return { seeded: false, count };
};

const getCurtainRecommendationsFromDB = async (roomImage: string) => {
  if (!roomImage) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room image is required for recommendation analysis.');
  }

  const apiKey = config.openai_api_key?.trim();
  if (!apiKey) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OpenAI API key is missing. Please configure OPENAI_API_KEY in the environment.',
    );
  }

  let formattedImageUrl = roomImage.trim();

  // If local public image path, read and encode
  if (formattedImageUrl.startsWith('/')) {
    const fs = await import('fs');
    const path = await import('path');
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

  const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(apiPayload),
  });

  if (!openAiResponse.ok) {
    const errData = (await openAiResponse.json().catch(() => ({}))) as any;
    console.error('OpenAI Specialist recommendation error:', errData);
    const errMsg =
      errData?.error?.message ||
      `OpenAI error (${openAiResponse.status}): ${openAiResponse.statusText}`;
    throw new AppError(openAiResponse.status || httpStatus.INTERNAL_SERVER_ERROR, errMsg);
  }

  const responseJson = (await openAiResponse.json()) as any;
  const content = responseJson?.choices?.[0]?.message?.content;
  if (!content) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to receive criteria from Interior Specialist analysis.',
    );
  }

  const criteria = JSON.parse(content);

  // Query catalog from DB
  const allCurtains = await Curtain.find({ isActive: true, isDeleted: false });

  // Weighted scoring
  const scoredCurtains = allCurtains.map((curtain) => {
    let score = 20; // baseline score
    const matchReasons: string[] = [];

    // 1. Color Match (up to 35 pts)
    const curColors = (curtain.colors || []).map((c) => c.toLowerCase());
    const matchedColors = curColors.filter((c) =>
      criteria.recommendedColors.map((rc: string) => rc.toLowerCase()).includes(c),
    );
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
    } else if (curStyles.length > 0) {
      score += 10;
    }

    // 4. Opacity match (up to 15 pts)
    if (
      curtain.opacity &&
      criteria.recommendedOpacities
        .map((o: string) => o.toLowerCase())
        .includes(curtain.opacity.toLowerCase())
    ) {
      score += 15;
      matchReasons.push(`Optimal daylight control (${curtain.opacity})`);
    }

    // 5. Category match (up to 5 pts)
    if (curtain.category && criteria.recommendedCategories.includes(curtain.category)) {
      score += 5;
    }

    // Calibrate percentage score
    const matchPercentage = Math.min(99, Math.max(68, Math.round(score)));

    return {
      ...curtain.toObject(),
      matchScore: score,
      matchPercentage,
      specialistNote: matchReasons.slice(0, 2).join(' • ') || 'Curated by Interior Specialist',
    };
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
};

const autoFillCurtainSpecsFromImage = async (image: string) => {
  if (!image) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Curtain image is required for auto-filling specifications.');
  }

  const apiKey = config.openai_api_key?.trim();
  if (!apiKey) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OpenAI API key is missing. Please configure OPENAI_API_KEY in the environment.',
    );
  }

  let formattedImageUrl = image.trim();

  // If local public image path, read and encode
  if (formattedImageUrl.startsWith('/')) {
    const fs = await import('fs');
    const path = await import('path');
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
You are a senior textile engineer and luxury interior drapery specialist for Curtain AI Studio.
Your task is to examine the provided curtain photograph with visual precision and extract commercial specifications to auto-fill the product catalog entry:
1. Product Name: An elegant, commercially attractive product name reflecting the fabric tone and texture (e.g. 'Oatmeal Belgian Slub Linen', 'Midnight Navy Blackout Drape', 'Opal Whisper Sheer Voile', 'Sand Dunes Pleated Drapes').
2. Category: Exactly one of ['curtains', 'sheers', 'rollers'].
3. Colors: 1 to 4 dominant or accent colors visible in the fabric. Use ONLY from: ${JSON.stringify(ALLOWED_COLORS)}.
4. Fabric: The primary textile material (e.g. 'linen', 'velvet', 'voile', 'cotton', 'polyester', 'silk', 'chenille').
5. Pattern: Design pattern of the fabric (e.g. 'plain', 'striped', 'geometric', 'textured').
6. Opacity: Light filtration level, exactly one of: ${JSON.stringify(ALLOWED_OPACITIES)}.
7. Texture: The tactile weave description (e.g. 'natural slub weave', 'soft matte velvet', 'fine open gauze', 'smooth thermal blackout').
8. Style: 1 to 3 interior styles this curtain best fits. Use ONLY from: ${JSON.stringify(ALLOWED_STYLES)}.
9. Suitable Rooms: 1 to 3 rooms suited for this curtain. Use ONLY from: ${JSON.stringify(ALLOWED_ROOMS)}.

CRITICAL: Return strictly valid JSON adhering to the specified schema.
`.trim();

  const apiPayload = {
    model: 'gpt-4o',
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
            text: 'Analyze this curtain photo and generate full product specifications for catalog entry.',
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
        name: 'curtain_product_specifications',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Commercial, elegant product title for the curtain.',
            },
            category: {
              type: 'string',
              enum: ALLOWED_CATEGORIES,
            },
            colors: {
              type: 'array',
              items: {
                type: 'string',
                enum: ALLOWED_COLORS,
              },
            },
            fabric: {
              type: 'string',
              description: 'Primary fabric textile (e.g. linen, velvet, voile, cotton, polyester).',
            },
            pattern: {
              type: 'string',
              description: 'Fabric design pattern (e.g. plain, striped, geometric, textured).',
            },
            opacity: {
              type: 'string',
              enum: ALLOWED_OPACITIES,
            },
            texture: {
              type: 'string',
              description: 'Tactile weave texture description (e.g. natural slub weave, soft matte).',
            },
            style: {
              type: 'array',
              items: {
                type: 'string',
                enum: ALLOWED_STYLES,
              },
            },
            suitableRooms: {
              type: 'array',
              items: {
                type: 'string',
                enum: ALLOWED_ROOMS,
              },
            },
          },
          required: [
            'name',
            'category',
            'colors',
            'fabric',
            'pattern',
            'opacity',
            'texture',
            'style',
            'suitableRooms',
          ],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.2,
  };

  const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(apiPayload),
  });

  if (!openAiResponse.ok) {
    const errData = (await openAiResponse.json().catch(() => ({}))) as any;
    console.error('OpenAI autoFill specs error:', errData);
    const errMsg =
      errData?.error?.message ||
      `OpenAI error (${openAiResponse.status}): ${openAiResponse.statusText}`;
    throw new AppError(openAiResponse.status || httpStatus.INTERNAL_SERVER_ERROR, errMsg);
  }

  const responseJson = (await openAiResponse.json()) as any;
  const content = responseJson?.choices?.[0]?.message?.content;
  if (!content) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to receive specifications from AI analysis.',
    );
  }

  const specs = JSON.parse(content);
  return specs;
};

export const CurtainService = {
  getAllCurtainsFromDB,
  getCurtainByIdFromDB,
  createCurtainIntoDB,
  updateCurtainInDB,
  deleteCurtainFromDB,
  seedCurtainsIntoDB,
  getCurtainRecommendationsFromDB,
  autoFillCurtainSpecsFromImage,
};
