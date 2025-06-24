
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCw, Move, Sun, Palette, Waves } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ImageEditorProps {
  imageUrl: string;
  onDownload: (adjustedImageUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState([50]); // Start at 50%
  const [brightness, setBrightness] = useState([100]); // Start at 100% (normal)
  
  // Iluminação
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

  // Dimensões para 3x4 cm a 300 DPI
  const canvasWidth = 354; // 3cm at 300 DPI
  const canvasHeight = 472; // 4cm at 300 DPI

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Centralizar a imagem inicialmente
      const scale = Math.min(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight) * 100;
      setZoom([Math.min(scale, 100)]);
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

    // Preencher com fundo branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Salvar o contexto
    ctx.save();

    // Aplicar transformações
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom[0] / 100, zoom[0] / 100);
    ctx.translate(position.x, position.y);

    // Construir filtros CSS
    let filters = [];
    filters.push(`brightness(${brightness[0]}%)`);
    filters.push(`contrast(${contrast[0]}%)`);
    filters.push(`saturate(${saturation[0]}%)`);
    
    if (invertColors) {
      filters.push('invert(1)');
    }
    
    // Aplicar filtros
    ctx.filter = filters.join(' ');

    // Desenhar a imagem centralizada
    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );

    // Restaurar o contexto
    ctx.restore();

    // Removido o contorno - será adicionado apenas no PDF final
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
        
        // Download automático com nome específico
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
    
    // Reset iluminação
    setContrast([100]);
    setHighlights([0]);
    setShadows([0]);
    setWhites([0]);
    setBlacks([0]);
    
    // Reset cor
    setInvertColors(false);
    setVibrance([0]);
    setSaturation([100]);
    
    // Reset textura
    setSharpness([0]);
    setClarity([0]);
    setVignette([0]);
    
    if (image) {
      const scale = Math.min(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight) * 100;
      setZoom([Math.min(scale, 100)]);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Ajustar Imagem 3x4
        </h2>
        <p className="text-gray-600 mb-4">
          Use os controles para posicionar e ajustar sua foto na proporção 3x4
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Canvas Preview */}
        <div className="flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-200 rounded-xl cursor-move"
              style={{
                width: '250px',
                height: '333px',
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
          <p className="text-xs text-gray-500 text-center mt-2">
            Clique e arraste para mover a imagem
          </p>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-6 max-w-md max-h-[600px] overflow-y-auto">
          {/* Controles básicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {zoom[0]}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="text-xs text-gray-500 mt-1">
              {brightness[0]}%
            </div>
          </div>

          {/* Seção Iluminação */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-4 w-4 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-800">Iluminação</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="text-xs text-gray-500 mt-1">
                  {contrast[0]}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destaques
                </label>
                <Slider
                  value={highlights}
                  onValueChange={setHighlights}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {highlights[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sombras
                </label>
                <Slider
                  value={shadows}
                  onValueChange={setShadows}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {shadows[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brancos
                </label>
                <Slider
                  value={whites}
                  onValueChange={setWhites}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {whites[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pretos
                </label>
                <Slider
                  value={blacks}
                  onValueChange={setBlacks}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {blacks[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Cor */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-800">Cor</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="invert-colors" className="text-sm font-medium text-gray-700">
                  Inverter Cor
                </Label>
                <Switch
                  id="invert-colors"
                  checked={invertColors}
                  onCheckedChange={setInvertColors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vibração
                </label>
                <Slider
                  value={vibrance}
                  onValueChange={setVibrance}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {vibrance[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="text-xs text-gray-500 mt-1">
                  {saturation[0]}%
                </div>
              </div>
            </div>
          </div>

          {/* Seção Textura */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="h-4 w-4 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-800">Textura</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nitidez
                </label>
                <Slider
                  value={sharpness}
                  onValueChange={setSharpness}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {sharpness[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claridade
                </label>
                <Slider
                  value={clarity}
                  onValueChange={setClarity}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {clarity[0]}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vinheta
                </label>
                <Slider
                  value={vignette}
                  onValueChange={setVignette}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {vignette[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={rotateImage}
                variant="outline"
                className="flex-1"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Girar 90°
              </Button>
              
              <Button
                onClick={resetPosition}
                variant="outline"
                className="flex-1"
              >
                <Move className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Baixar Imagem Ajustada
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Após baixar, use o PhotoRoom para remover o fundo e depois faça upload da imagem processada
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImageEditor;
