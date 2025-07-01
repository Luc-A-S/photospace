
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';

interface PhotoType {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  width: number;
  height: number;
}

const photoTypes: PhotoType[] = [
  { id: '3x4', name: 'Foto 3x4', dimensions: '3cm x 4cm', description: 'Padrão para documentos', width: 30, height: 40 },
  { id: '5x7', name: 'Foto 5x7', dimensions: '5cm x 7cm', description: 'Formato alongado', width: 50, height: 70 },
  { id: '2x2', name: 'Foto 2x2', dimensions: '2cm x 2cm', description: 'Formato quadrado pequeno', width: 20, height: 20 },
  { id: '3.5x4.5', name: 'Foto 3,5x4,5', dimensions: '3,5cm x 4,5cm', description: 'Formato intermediário', width: 35, height: 45 },
  { id: '4x5', name: 'Foto 4x5', dimensions: '4cm x 5cm', description: 'Formato médio', width: 40, height: 50 },
  { id: '2.5x3', name: 'Foto 2,5x3', dimensions: '2,5cm x 3cm', description: 'Formato compacto', width: 25, height: 30 }
];

interface PhotoTypeSelectorProps {
  onPhotoTypeSelect: (photoType: PhotoType) => void;
}

const PhotoTypeSelector: React.FC<PhotoTypeSelectorProps> = ({ onPhotoTypeSelect }) => {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-3 shadow-2xl shadow-purple-500/20">
            <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
          Escolha o Tipo de Foto
        </h2>
        <p className="text-gray-300 text-sm sm:text-base px-2">
          Selecione o formato de foto que você deseja criar
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {photoTypes.map((type) => (
          <Button
            key={type.id}
            onClick={() => onPhotoTypeSelect(type)}
            className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-purple-600/30 hover:to-blue-600/30 text-white border border-purple-400/20 hover:border-purple-400/40 rounded-2xl p-4 h-auto flex flex-col items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <div className="text-base sm:text-lg font-semibold">
              {type.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              {type.dimensions}
            </div>
            <div className="text-xs text-gray-400 text-center">
              {type.description}
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default PhotoTypeSelector;
