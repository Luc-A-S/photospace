import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCw, Move, Sun, Palette, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ImageEditorProps {
  imageUrl: string;
  onDownload: (adjustedImageUrl: string) => void;
  onBack: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onDownload, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState([1.5]); // Removido a porcentagem, agora é multiplicador
  
  // Iluminação
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [highlights, setHighlights] = useState([0]);
  const [shadows, setShadows] = useState([0]);
  const [whites, setWhites] = useState([0]);
  const [blacks, setBlacks] = useState([0]);
  
  // Cor
  const [invertColors, setInvertColors] = useState(false);
  const [vibrance, setVibrance] = useState([0]);
  const [saturation, setSaturation] = useState([100]);
  
  // Textura
  const [sharpness, setSharpness] = useState([0]);
  const [clarity, setClarity] = useState([0]);
  const [vignette, setVignette] = useState([0]);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const canvasWidth = 354;
  const canvasHeight = 472;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      const scale = Math.min(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight) * 2;
      setZoom([Math.min(scale, 3)]);
    };
    img.src = imageUrl;
  }, [imageUrl]);

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
    ctx.scale(zoom[0], zoom[0]); // Usando multiplicador direto
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
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
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
        a.download = 'FOTO 3x4.png';
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
    setRotation(0);
    setBrightness([100]);
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
    
    if (image) {
      const scale = Math.min(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight) * 2;
      setZoom([Math.min(scale, 3)]);
    }
  };

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <Button
            onClick={onBack}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center sm:text-left">
            Ajustar Imagem 3x4
          </h2>
          <div className="hidden sm:block"></div>
        </div>
        <p className="text-gray-300 mb-4 text-sm sm:text-base px-2">
          Use os controles para posicionar e ajustar sua foto na proporção 3x4
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
        {/* Canvas Preview */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
          <div className="bg-slate-700/50 rounded-2xl p-3 sm:p-4 shadow-xl">
            <canvas
              ref={canvasRef}
              className="border-2 border-purple-400/30 rounded-xl cursor-move"
              style={{
                width: '200px',
                height: '266px',
                imageRendering: 'auto'
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({
                  x: e.clientX - position.x,
                  y: e.clientY - position.y
                });
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                setPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4 sm:space-y-6 max-w-md max-h-[500px] sm:max-h-[600px] overflow-y-auto w-full">
          <p className="text-xs text-gray-400 text-center lg:hidden">
            Clique e arraste para mover a imagem
          </p>
          
          {/* Controles básicos */}
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

          {/* Seção Iluminação */}
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

          {/* Seção Cor */}
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

          {/* Botões de ação */}
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

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Baixar Imagem Ajustada
            </Button>

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
