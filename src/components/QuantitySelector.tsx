import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';

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
          </div>
          <div className="hidden sm:block w-[100px]"></div>
        </div>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base px-2">
          Defina quantas cópias de cada foto você deseja no documento final.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {images.map((image) => (
          <div key={image.id} className="bg-slate-700/50 rounded-xl p-3">
            <img
              src={image.processedUrl || image.adjustedUrl || image.url}
              alt="Foto processada"
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Quantidade:
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onQuantityUpdate(image.id, Math.max(1, image.quantity - 1))}
                  size="sm"
                  variant="outline"
                  className="text-white hover:bg-slate-600"
                >
                  -
                </Button>
                <span className="text-lg text-white">{image.quantity}</span>
                <Button
                  onClick={() => onQuantityUpdate(image.id, image.quantity + 1)}
                  size="sm"
                  variant="outline"
                  className="text-white hover:bg-slate-600"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button
          data-tutorial="generate-button"
          onClick={onGeneratePDF}
          disabled={isProcessing}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Gerar PDF ({totalPhotos} fotos)
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default QuantitySelector;
