
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, ArrowLeft, Loader2, Minus, Plus } from 'lucide-react';

interface PhotoType {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  width: number;
  height: number;
}

interface ImageFile {
  id: string;
  file: File;
  url: string;
  adjustedUrl?: string;
  processedUrl?: string;
  quantity: number;
}

interface QuantitySelectorProps {
  images: ImageFile[];
  photoType: PhotoType;
  onQuantityUpdate: (imageId: string, quantity: number) => void;
  onBack: () => void;
  onGeneratePDF: () => void;
  isProcessing: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  images,
  photoType,
  onQuantityUpdate,
  onBack,
  onGeneratePDF,
  isProcessing
}) => {
  const updateQuantity = (imageId: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 50) {
      onQuantityUpdate(imageId, newQuantity);
    }
  };

  const totalPhotos = images.reduce((sum, img) => sum + img.quantity, 0);

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
      <div className="text-center mb-6 sm:mb-8">
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
              Definir Quantidades
            </h2>
            <div className="text-sm text-purple-300 bg-purple-500/20 rounded-lg px-3 py-1 inline-block mt-2">
              {photoType.name} ({photoType.dimensions})
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Total: {totalPhotos} fotos serão geradas
            </p>
          </div>
          <div className="hidden sm:block w-[100px]"></div>
        </div>
        <p className="text-gray-300 mb-6 text-sm sm:text-base px-2">
          Defina quantas cópias de cada imagem você deseja no PDF final.
        </p>
      </div>

      {/* Images with quantity controls */}
      <div className="space-y-6 mb-8">
        {images.map((image, index) => (
          <div key={image.id} className="bg-slate-700/50 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Image preview */}
              <div className="flex-shrink-0">
                <div className="text-center mb-2">
                  <h3 className="text-white font-medium">Imagem {index + 1}</h3>
                </div>
                <div className="bg-gray-200 rounded-xl p-2">
                  <img
                    src={image.processedUrl}
                    alt={`Processada ${index + 1}`}
                    className="w-24 h-32 sm:w-32 sm:h-42 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-base font-medium text-white mb-3 block text-center sm:text-left">
                  Quantidade de cópias
                </Label>
                
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Button
                    onClick={() => updateQuantity(image.id, image.quantity - 1)}
                    disabled={image.quantity <= 1}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white w-10 h-10 rounded-full p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="mx-4">
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={image.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        updateQuantity(image.id, value);
                      }}
                      className="w-20 text-center text-lg font-medium rounded-xl border-2 border-purple-400/30 bg-slate-600 text-white focus:border-purple-500"
                    />
                  </div>
                  
                  <Button
                    onClick={() => updateQuantity(image.id, image.quantity + 1)}
                    disabled={image.quantity >= 50}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white w-10 h-10 rounded-full p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left mt-2">
                  Esta imagem será repetida {image.quantity} vez{image.quantity !== 1 ? 'es' : ''} no PDF
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-4 sm:p-6 mb-8 border border-purple-400/30">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Resumo Final</h3>
          <p className="text-lg text-purple-200">
            <span className="font-bold">{totalPhotos}</span> fotos {photoType.name} ({photoType.dimensions})
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {images.length} imagem{images.length !== 1 ? 'ns' : ''} diferente{images.length !== 1 ? 's' : ''} com quantidades personalizadas
          </p>
        </div>
      </div>

      {/* Generate PDF button */}
      <div className="flex justify-center">
        <Button
          onClick={onGeneratePDF}
          disabled={isProcessing || totalPhotos === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Gerar PDF ({totalPhotos} fotos)
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default QuantitySelector;
