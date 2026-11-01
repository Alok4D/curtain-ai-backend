import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';
import config from '../../config';
import AppError from '../../errors/AppError';
import { uploadToCloudinary } from '../../utlis/cloudinary';
import { TVisualizationInput } from './visualizer.interface';
import { Visualization } from './visualizer.model';

async function toDataUrl(input: string): Promise<string> {
  if (!input) {
    throw new Error('Image source is missing.');
  }

  if (input.startsWith('data:image/')) {
    // If it's non-standard (e.g. AVIF, HEIC, BMP), transcode to standard JPEG via Cloudinary
    if (
      input.startsWith('data:image/avif') ||
      input.startsWith('data:image/heic') ||
      input.startsWith('data:image/heif') ||
      input.startsWith('data:image/bmp')
    ) {
      try {
        if (config.cloudinary_cloud_name && config.cloudinary_api_key) {
          const uploadRes = await uploadToCloudinary(input, 'visualizer_transcode');
          const jpgUrl = uploadRes.secure_url.replace(/\/upload\//, '/upload/f_jpg,q_90/');
          const res = await fetch(jpgUrl);
          const buffer = await res.arrayBuffer();
          return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
        }
      } catch (err) {
        console.error('Failed to transcode non-standard image format via Cloudinary:', err);
      }
    }
    return input;
  }

  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetch(input);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${input} (${res.status})`);
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    let contentType = res.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('webp')) {
      contentType = 'image/webp';
    } else if (contentType.includes('png')) {
      contentType = 'image/png';
    } else {
      contentType = 'image/jpeg';
    }
    return `data:${contentType};base64,${base64}`;
  }

  // Handle local path in frontend public directory (e.g. /before_image.png)
  const candidatePaths = [
    path.join(process.cwd(), '../curtain-ai-frontend/public', input.replace(/^\//, '')),
    path.join(process.cwd(), 'public', input.replace(/^\//, '')),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      const buffer = fs.readFileSync(candidate);
      const ext = path.extname(candidate).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }
  }

  throw new Error('Unsupported image format. Provide a valid URL or base64 dataUrl.');
}

const generateCurtainVisualization = async (payload: TVisualizationInput) => {
  const {
    roomImage,
    curtainImage,
    curtainId,
    curtainName = 'Selected Fabric',
    drapeLength = 'just touching the floor',
    drapePosition = 'pulled open to the sides framing the window with natural daylight coming through',
    curtainRod = 'matte black minimalist curtain rod mounted just below the ceiling',
    userIp,
    userId,
  } = payload;

  const apiKey = config.openai_api_key?.trim();
  const modelName = config.image_model?.trim() || 'gpt-image-2.5-sunburst';

  if (!apiKey) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OpenAI API Key is missing. Please verify OPENAI_API_KEY in the backend .env file.',
    );
  }

  // 1. Convert input images to Data URLs
  const [roomDataUrl, curtainDataUrl] = await Promise.all([
    toDataUrl(roomImage),
    toDataUrl(curtainImage),
  ]);

  // 2. Construct precision prompt with strict room preservation invariance
  const promptInstruction = `
You are an expert architectural visualizer and photorealistic interior designer specialized in precision virtual curtain installations.

TASK:
You are provided with two images:
1. IMAGE 1: The user's target room photo containing one or more windows.
2. IMAGE 2: The catalog image showing the specific curtain, fabric, textile weave, pattern, and color.

EXECUTE THE FOLLOWING PRECISE EDIT:
1. WINDOW IDENTIFICATION: Identify the window(s) and window frames in IMAGE 1.
2. CURTAIN FITTING: Install the exact curtain fabric, color, texture, and pattern from IMAGE 2 over the window(s) of IMAGE 1.
3. STYLING SPECIFICATIONS:
   - Draping length: ${drapeLength}.
   - Draping arrangement: ${drapePosition}.
   - Mounting hardware: ${curtainRod}.
   - Real-world physics: Render realistic fabric folds, vertical ripples, realistic weight, natural drop, and accurate light pass-through according to the lighting angle in the original room.

CRITICAL INVARIANCE RULES (STRICT PRESERVATION):
- DO NOT change, alter, or re-render any other element of the room in IMAGE 1.
- DO NOT modify the walls, wall color, wallpapers, mouldings, or baseboards.
- DO NOT move, modify, replace, or alter any furniture (sofas, tables, chairs, beds), decorative items, lamps, ceiling lights, rugs, or plants.
- DO NOT change the flooring (hardwood, carpet, tiles).
- DO NOT change the room's camera perspective, depth of field, or architectural dimensions.
- The ONLY modification allowed is installing the curtain and curtain rod at the window opening, keeping the rest of the room 100% identical.

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
  const openAiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(apiPayload),
  });

  if (!openAiResponse.ok) {
    const errData = (await openAiResponse.json().catch(() => ({}))) as any;
    console.error('OpenAI visualizer generation error:', JSON.stringify(errData, null, 2));

    let errMsg =
      errData?.error?.message ||
      `OpenAI error (${openAiResponse.status}): ${openAiResponse.statusText}`;

    if (openAiResponse.status === 401) {
      errMsg = 'OpenAI rejected the API key. Please check billing and key validity.';
    } else if (openAiResponse.status === 429) {
      errMsg = 'OpenAI rate limit or usage quota reached. Please check balance.';
    } else if (errMsg.includes('Invalid image data')) {
      const param = errData?.error?.param;
      errMsg = `OpenAI could not process image${param ? ` (${param})` : ''}. Please ensure your room photo is in standard JPG or PNG format.`;
    }

    throw new AppError(openAiResponse.status || httpStatus.INTERNAL_SERVER_ERROR, errMsg);
  }

  const data = (await openAiResponse.json()) as any;
  const b64Json = data?.data?.[0]?.b64_json;
  const directUrl = data?.data?.[0]?.url;

  if (!b64Json && !directUrl) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'OpenAI returned no fitted image result. Please check image inputs.',
    );
  }

  const rawResult = b64Json ? `data:image/jpeg;base64,${b64Json}` : directUrl;

  // 3. Upload result to Cloudinary for permanent hosting
  let finalImageUrl = rawResult;
  let roomHostedUrl = roomImage;

  try {
    if (config.cloudinary_cloud_name && config.cloudinary_api_key) {
      const uploadRes = await uploadToCloudinary(rawResult, 'visualizations');
      finalImageUrl = uploadRes.secure_url;

      if (roomImage.startsWith('data:image/')) {
        const roomUpload = await uploadToCloudinary(roomImage, 'rooms');
        roomHostedUrl = roomUpload.secure_url;
      }
    }
  } catch (cloudErr) {
    console.warn('Cloudinary upload fallback to direct dataUrl:', cloudErr);
  }

  // 4. Save history record into MongoDB
  const record = await Visualization.create({
    roomImageUrl: roomHostedUrl,
    curtainImageUrl: curtainImage,
    generatedImageUrl: finalImageUrl,
    curtainName,
    curtainId,
    drapeLength,
    drapePosition,
    curtainRod,
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
    createdAt: record.createdAt,
  };
};

const getRecentVisualizationsFromDB = async (limit: number = 8) => {
  const result = await Visualization.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
  return result;
};

export const VisualizerService = {
  generateCurtainVisualization,
  getRecentVisualizationsFromDB,
};

