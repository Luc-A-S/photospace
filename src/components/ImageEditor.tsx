import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCw, Move, Sun, Palette, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PhotoType {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  width: number;
  height: number;
}

interface ImageEditorProps {
  imageUrl: string;
  onDownload: (adjustedImageUrl: string) => void;
  onBack: () => void;
  photoType: PhotoType;
  showBackButton?: boolean;
  downloadButtonText?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageUrl, 
  onDownload, 
  onBack, 
  photoType,
  showBackButton = true,
  downloadButtonText
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState([2.0]); // Aumentado de 1.5 para 2.0
  
  const [brightness, setBrightness] = useState([115]); // Aumentado de 100 para 115
  const [contrast, setContrast] = useState([100]);
  const [highlights, setHighlights] = useState([0]);
  const [shadows, setShadows] = useState([0]);
  const [whites, setWhites] = useState([0]);
  const [blacks, setBlacks] = useState([0]);
  
  const [invertColors, setInvertColors] = useState(false);
  const [vibrance, setVibrance] = useState([0]);
  const [saturation, setSaturation] = useState([100]);
  
  const [sharpness, setSharpness] = useState([0]);
  const [clarity, setClarity] = useState([0]);
  const [vignette, setVignette] = useState([0]);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [positionX, setPositionX] = useState([0]);
  const [positionY, setPositionY] = useState([0]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [autoPositioned, setAutoPositioned] = useState(false);

  const aspectRatio = photoType.width / photoType.height;
  const displayHeight = 266;
  const displayWidth = displayHeight * aspectRatio;
  
  const canvasMultiplier = Math.max(1, Math.min(2, 400 / Math.max(displayWidth, displayHeight)));
  const canvasWidth = displayWidth * canvasMultiplier;
  const canvasHeight = displayHeight * canvasMultiplier;

  // Função para detectar rosto e posicionar automaticamente
  const detectFaceAndPosition = async (img: HTMLImageElement) => {
    try {
      console.log('Iniciando detecção automática de rosto...');
      
      // Criar canvas temporário para análise
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Redimensionar para análise mais rápida
      const maxSize = 512;
      const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
      tempCanvas.width = img.naturalWidth * scale;
      tempCanvas.height = img.naturalHeight * scale;
      
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

      // Tentar usar a API de detecção de rosto do navegador se disponível
      if ('FaceDetector' in window) {
        try {
          const faceDetector = new (window as any).FaceDetector();
          const faces = await faceDetector.detect(tempCanvas);
          
          if (faces && faces.length > 0) {
            const face = faces[0];
            const faceCenter = {
              x: face.boundingBox.x + face.boundingBox.width / 2,
              y: face.boundingBox.y + face.boundingBox.height / 2
            };
            
            // Converter coordenadas para o canvas principal
            const scaleBack = 1 / scale;
            const adjustedCenter = {
              x: faceCenter.x * scaleBack,
              y: faceCenter.y * scaleBack
            };
            
            // Calcular posicionamento ideal para foto 3x4
            const idealX = adjustedCenter.x - img.naturalWidth / 2;
            const idealY = adjustedCenter.y - img.naturalHeight * 0.35; // Rosto no terço superior
            
            // Normalizar para as coordenadas do canvas
            const normalizedX = (idealX / img.naturalWidth) * 200;
            const normalizedY = (idealY / img.naturalHeight) * 200;
            
            setPosition({ x: -normalizedX, y: -normalizedY });
            setPositionX([-normalizedX]);
            setPositionY([-normalizedY]);
            
            console.log('Rosto detectado e posicionado automaticamente!');
            return true;
          }
        } catch (error) {
          console.log('API de detecção de rosto não disponível:', error);
        }
      }
      
      // Fallback: usar análise de luminosidade para encontrar área do rosto
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      let maxBrightness = 0;
      let brightestX = 0;
      let brightestY = 0;
      
      // Analisar terço superior da imagem (onde normalmente está o rosto)
      const startY = 0;
      const endY = Math.floor(tempCanvas.height * 0.6);
      
      for (let y = startY; y < endY; y += 4) {
        for (let x = 0; x < tempCanvas.width; x += 4) {
          const i = (y * tempCanvas.width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (brightness > maxBrightness) {
            maxBrightness = brightness;
            brightestX = x;
            brightestY = y;
          }
        }
      }
      
      // Posicionar baseado na área mais brilhante (provavelmente o rosto)
      const scaleBack = 1 / scale;
      const adjustedCenter = {
        x: brightestX * scaleBack,
        y: brightestY * scaleBack
      };
      
      const idealX = adjustedCenter.x - img.naturalWidth / 2;
      const idealY = adjustedCenter.y - img.naturalHeight * 0.3;
      
      const normalizedX = (idealX / img.naturalWidth) * 100;
      const normalizedY = (idealY / img.naturalHeight) * 100;
      
      setPosition({ x: -normalizedX, y: -normalizedY });
      setPositionX([-normalizedX]);
      setPositionY([-normalizedY]);
      
      console.log('Posicionamento automático baseado em luminosidade aplicado!');
      return true;
      
    } catch (error) {
      console.log('Erro na detecção automática:', error);
      return false;
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = async () => {
      setImage(img);
      const scale = Math.min(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight) * 2.5; // Aumentado de 2 para 2.5
      setZoom([Math.min(scale, 4)]); // Aumentado limite máximo de 3 para 4
      
      // Aplicar posicionamento automático apenas uma vez
      if (!autoPositioned) {
        await detectFaceAndPosition(img);
        setAutoPositioned(true);
        
        // Aplicar ajustes automáticos de qualidade
        setBrightness([115]); // Aumentado de 105 para 115
        setContrast([115]); // Aumentado de 110 para 115
        setSaturation([110]); // Aumentado de 105 para 110
      }
    };
    img.src = imageUrl;
  }, [imageUrl, canvasWidth, canvasHeight, autoPositioned]);

  useEffect(() => {
    setPosition({ x: positionX[0], y: positionY[0] });
  }, [positionX, positionY]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, zoom, brightness, contrast, highlights, shadows, whites, blacks, invertColors, vibrance, saturation, sharpness, clarity, vignette, position, rotation]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom[0], zoom[0]);
    ctx.translate(position.x, position.y);

    let filters = [];
    filters.push(`brightness(${brightness[0]}%)`);
    filters.push(`contrast(${contrast[0]}%)`);
    filters.push(`saturate(${saturation[0]}%)`);
    
    if (invertColors) {
      filters.push('invert(1)');
    }
    
    ctx.filter = filters.join(' ');

    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    setPosition(newPosition);
    setPositionX([newPosition.x]);
    setPositionY([newPosition.y]);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onDownload(url);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${photoType.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 'image/png', 1.0);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setPositionX([0]);
    setPositionY([0]);
    setRotation(0);
    setBrightness([115]); // Alterado de 100 para 115
    setContrast([100]);
    setHighlights([0]);
    setShadows([0]);
    setWhites([0]);
    setBlacks([0]);
    setInvertColors(false);
    setVibrance([0]);
    setSaturation([100]);
    setSharpness([0]);
    setClarity([0]);
    setVignette([0]);
    setAutoPositioned(false);
    
    if (image) {
      const scale = Math.min(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight) * 2.5; // Aumentado de 2 para 2.5
      setZoom([Math.min(scale, 4)]); // Aumentado limite máximo de 3 para 4
    }
  };

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
      <div className="text-center mb-4 sm:mb-6">
        {showBackButton && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <Button
              onClick={onBack}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="text-center flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
                Ajustar {photoType.name}
              </h2>
              <div className="text-sm text-purple-300 bg-purple-500/20 rounded-lg px-3 py-1 inline-block mt-2">
                {photoType.dimensions}
              </div>
            </div>
            <div className="hidden sm:block w-[100px]"></div>
          </div>
        )}
        <p className="text-gray-300 mb-4 text-sm sm:text-base px-2">
          {autoPositioned ? 
            '✨ Posicionamento automático aplicado! Ajuste conforme necessário.' : 
            'Use os controles para posicionar e ajustar sua foto na proporção ' + photoType.dimensions
          }
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
        {/* Canvas Preview */}
        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center">
          <div className="bg-slate-700/50 rounded-2xl p-3 sm:p-4 shadow-xl mb-4">
            <canvas
              ref={canvasRef}
              className="border-2 border-purple-400/30 rounded-xl cursor-move"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                imageRendering: 'auto'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Download button below the photo */}
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {downloadButtonText || `Baixar ${photoType.name} Ajustada`}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4 sm:space-y-6 max-w-md max-h-[500px] sm:max-h-[600px] overflow-y-auto w-full">
          <p className="text-xs text-gray-400 text-center lg:hidden">
            Clique e arraste para mover a imagem
          </p>
          
          <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4">
            <label className="block text-sm font-medium text-white mb-2">
              Zoom
            </label>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              {zoom[0].toFixed(1)}x
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Posição X
                </label>
                <Slider
                  value={positionX}
                  onValueChange={setPositionX}
                  min={-200}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {positionX[0]}px
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Posição Y
                </label>
                <Slider
                  value={positionY}
                  onValueChange={setPositionY}
                  min={-200}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {positionY[0]}px
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-4 w-4 text-yellow-400" />
              <h3 className="text-base sm:text-lg font-medium text-white">Iluminação</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brilho
                </label>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {brightness[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraste
                </label>
                <Slider
                  value={contrast}
                  onValueChange={setContrast}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {contrast[0]}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-purple-400" />
              <h3 className="text-base sm:text-lg font-medium text-white">Cor</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="invert-colors" className="text-sm font-medium text-gray-300">
                  Inverter Cor
                </Label>
                <Switch
                  id="invert-colors"
                  checked={invertColors}
                  onCheckedChange={setInvertColors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Saturação
                </label>
                <Slider
                  value={saturation}
                  onValueChange={setSaturation}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {saturation[0]}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={rotateImage}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <RotateCw className="h-4 w-4 mr-1 sm:mr-2" />
                Girar 90°
              </Button>
              
              <Button
                onClick={resetPosition}
                className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Move className="h-4 w-4 mr-1 sm:mr-2" />
                Resetar
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 text-center px-2">
              Após baixar, use o PhotoRoom para remover o fundo e depois faça upload da imagem processada
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImageEditor;
