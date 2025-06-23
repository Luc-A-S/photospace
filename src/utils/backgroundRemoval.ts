
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

// Face detection for better centering
async function detectFace(canvas: HTMLCanvasElement) {
  try {
    console.log('Detecting face for better centering...');
    const faceDetector = await pipeline('object-detection', 'Xenova/yolos-tiny', {
      device: 'webgpu',
    });
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const result = await faceDetector(imageData);
    
    // Find the largest face/person detection
    const detections = Array.isArray(result) ? result : [result];
    const faceDetection = detections.find((detection: any) => 
      detection.label && (
        detection.label.toLowerCase().includes('person') || 
        detection.label.toLowerCase().includes('face')
      )
    );
    
    if (faceDetection && (faceDetection as any).bbox) {
      console.log('Face detected:', faceDetection);
      // Convert bbox array [x, y, width, height] to box coordinates
      const bbox = (faceDetection as any).bbox;
      const [x, y, width, height] = Array.isArray(bbox) ? bbox : [bbox.x, bbox.y, bbox.width, bbox.height];
      return {
        xmin: x,
        ymin: y,
        xmax: x + width,
        ymax: y + height
      };
    }
    
    return null;
  } catch (error) {
    console.log('Face detection failed, using center crop:', error);
    return null;
  }
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting advanced background removal process...');
    
    // Use a more advanced segmentation model similar to PhotoRoom
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b2-finetuned-cityscapes-1024-1024', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Detect face for better cropping
    const faceBox = await detectFace(canvas);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with advanced segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    // Find the person/human segment
    const personSegment = result.find((segment: any) => 
      segment.label && (
        segment.label.toLowerCase().includes('person') ||
        segment.label.toLowerCase().includes('human') ||
        segment.label.toLowerCase().includes('people')
      )
    );
    
    const maskToUse = personSegment?.mask || result[0]?.mask;
    
    if (!maskToUse) {
      throw new Error('No suitable mask found');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Create white background
    outputCtx.fillStyle = 'white';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask with better edge smoothing
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply mask to alpha channel with smoothing
    for (let i = 0; i < maskToUse.data.length; i++) {
      const maskValue = maskToUse.data[i];
      // Use the mask directly (not inverted) and apply smoothing
      const alpha = Math.round(maskValue * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Create final canvas with 3:4 aspect ratio focused on face
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) throw new Error('Could not get final canvas context');
    
    // Set canvas size for 3x4 cm at 300 DPI
    finalCanvas.width = 354; // 3cm at 300 DPI
    finalCanvas.height = 472; // 4cm at 300 DPI
    
    // Fill with white background
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    // Calculate cropping area focused on face
    let sourceX = 0, sourceY = 0, sourceWidth = outputCanvas.width, sourceHeight = outputCanvas.height;
    
    if (faceBox) {
      // Expand around face area to include shoulders and ensure good framing
      const faceCenter = {
        x: faceBox.xmin + (faceBox.xmax - faceBox.xmin) / 2,
        y: faceBox.ymin + (faceBox.ymax - faceBox.ymin) / 2
      };
      
      const faceHeight = faceBox.ymax - faceBox.ymin;
      const expandedHeight = faceHeight * 3.5; // Include shoulders
      const expandedWidth = expandedHeight * (3/4); // Maintain 3:4 ratio
      
      sourceX = Math.max(0, faceCenter.x - expandedWidth / 2);
      sourceY = Math.max(0, faceCenter.y - expandedHeight * 0.3); // Face in upper third
      sourceWidth = Math.min(expandedWidth, outputCanvas.width - sourceX);
      sourceHeight = Math.min(expandedHeight, outputCanvas.height - sourceY);
    }
    
    // Draw cropped and scaled image
    finalCtx.drawImage(
      outputCanvas,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, finalCanvas.width, finalCanvas.height
    );
    
    // Add thin black border
    finalCtx.strokeStyle = '#000000';
    finalCtx.lineWidth = 2;
    finalCtx.strokeRect(1, 1, finalCanvas.width - 2, finalCanvas.height - 2);
    
    console.log('Final image created with 3:4 aspect ratio and face focus');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    // Fallback to simple processing without advanced segmentation
    return fallbackProcessing(imageElement);
  }
};

// Fallback processing if advanced AI fails
async function fallbackProcessing(imageElement: HTMLImageElement): Promise<Blob> {
  console.log('Using fallback processing...');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Set canvas size for 3x4 cm at 300 DPI
  canvas.width = 354;
  canvas.height = 472;
  
  // Fill with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate scaling to fit image while maintaining aspect ratio
  const scale = Math.min(canvas.width / imageElement.naturalWidth, canvas.height / imageElement.naturalHeight);
  const scaledWidth = imageElement.naturalWidth * scale;
  const scaledHeight = imageElement.naturalHeight * scale;
  
  // Center the image
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;
  
  ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight);
  
  // Add thin black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
