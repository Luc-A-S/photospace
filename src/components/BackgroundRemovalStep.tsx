
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, ExternalLink, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageFile {
  id: string;
  file: File;
  url: string;
  adjustedUrl?: string;
  processedUrl?: string;
  quantity: number;
}

interface BackgroundRemovalStepProps {
  images: ImageFile[];
  onProcessedImageUpload: (imageId: string, processedUrl: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const BackgroundRemovalStep: React.FC<BackgroundRemovalStepProps> = ({
  images,
  onProcessedImageUpload,
  onBack,
  onContinue
}) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const openPhotoRoom = () => {
    const photoRoomUrl = 'https://www.photoroom.com/pt-br/ferramentas/remover-fundo-de-imagem';
    window.open(photoRoomUrl, '_blank');
    
    toast({
      title: "PhotoRoom aberto!",
      description: "Use o PhotoRoom para remover o fundo das suas imagens."
    });
  };

  const openRemoveBg = () => {
    const removeBgUrl = 'https://www.remove.bg/pt-br';
    window.open(removeBgUrl, '_blank');
    
    toast({
      title: "Remove.bg aberto!",
      description: "Use o Remove.bg para remover o fundo das suas imagens."
    });
  };

  const handleFileUpload = (imageId: string, file: File) => {
    const processedUrl = URL.createObjectURL(file);
    onProcessedImageUpload(imageId, processedUrl);
    
    toast({
      title: "Imagem sem fundo carregada!",
      description: "Imagem processada com sucesso."
    });
  };

  const processedCount = images.filter(img => img.processedUrl).length;
  const allProcessed = processedCount === images.length;

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <Button
            onClick={onBack}
            className="neon-button flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="text-center flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
              Remover Fundo das Imagens
            </h2>
            <p className="text-sm text-purple-300 mt-2">
              Progresso: {processedCount}/{images.length} imagens processadas
            </p>
          </div>
          <Button
            onClick={onContinue}
            disabled={!allProcessed}
            className="neon-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            Definir Quantidade
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(processedCount / images.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-gray-300 mb-6 text-sm sm:text-base px-2">
          Use uma das ferramentas abaixo para remover o fundo das suas imagens ajustadas, depois faça upload de cada uma.
        </p>
      </div>

      {/* Tools Section - Botões com visual padronizado */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button
          onClick={openPhotoRoom}
          className="neon-button bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 border border-purple-400/30"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir PhotoRoom
        </Button>
        
        <Button
          onClick={openRemoveBg}
          className="neon-button bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 border border-purple-400/30"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir Remove.bg
        </Button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={image.id} className="bg-slate-700/50 rounded-2xl p-4 space-y-4">
            <div className="text-center">
              <h3 className="text-white font-medium mb-2">Imagem {index + 1}</h3>
              
              {/* Original adjusted image */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Imagem ajustada:</p>
                <img
                  src={image.adjustedUrl}
                  alt={`Ajustada ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {image.processedUrl ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-400">Processada</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-400">Pendente</span>
                  </>
                )}
              </div>

              {/* Processed image preview */}
              {image.processedUrl && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Sem fundo:</p>
                  <img
                    src={image.processedUrl}
                    alt={`Processada ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl bg-gray-200"
                  />
                </div>
              )}

              {/* Upload button */}
              <Button
                onClick={() => fileInputRefs.current[image.id]?.click()}
                className={`w-full ${
                  image.processedUrl 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } text-white py-2 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {image.processedUrl ? 'Trocar Imagem' : 'Upload Sem Fundo'}
              </Button>

              <input
                ref={(el) => (fileInputRefs.current[image.id] = el)}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(image.id, file);
                }}
                className="hidden"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BackgroundRemovalStep;
