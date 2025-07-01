
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ArrowLeft, ArrowRight } from 'lucide-react';
import ImageEditor from '@/components/ImageEditor';

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

interface MultiImageEditorProps {
  images: ImageFile[];
  photoType: PhotoType;
  onImageAdjusted: (imageId: string, adjustedUrl: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const MultiImageEditor: React.FC<MultiImageEditorProps> = ({
  images,
  photoType,
  onImageAdjusted,
  onBack,
  onContinue
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = images[currentImageIndex];

  const handleImageAdjusted = (adjustedImageUrl: string) => {
    onImageAdjusted(currentImage.id, adjustedImageUrl);
  };

  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const adjustedCount = images.filter(img => img.adjustedUrl).length;
  const allAdjusted = adjustedCount === images.length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-purple-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            onClick={onBack}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Editar Imagens ({currentImageIndex + 1}/{images.length})
            </h2>
            <div className="text-sm text-purple-300 bg-purple-500/20 rounded-lg px-3 py-1 inline-block mt-2">
              {photoType.name} ({photoType.dimensions})
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Progresso: {adjustedCount}/{images.length} imagens ajustadas
            </p>
          </div>
          
          <Button
            onClick={onContinue}
            disabled={!allAdjusted}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            Remover Fundo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(adjustedCount / images.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Navigation between images */}
      {images.length > 1 && (
        <Card className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-purple-500/20">
          <div className="flex items-center justify-between">
            <Button
              onClick={goToPreviousImage}
              disabled={currentImageIndex === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-blue-500 scale-125' 
                      : images[index].adjustedUrl 
                        ? 'bg-green-500' 
                        : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={goToNextImage}
              disabled={currentImageIndex === images.length - 1}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white"
            >
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Image Editor */}
      <ImageEditor
        imageUrl={currentImage.url}
        onDownload={handleImageAdjusted}
        onBack={() => {}} // Empty function since navigation is handled above
        photoType={photoType}
        showBackButton={false}
        downloadButtonText={`Baixar ${photoType.name} (${currentImageIndex + 1})`}
      />
    </div>
  );
};

export default MultiImageEditor;
