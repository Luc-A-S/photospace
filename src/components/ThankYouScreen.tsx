
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, CheckCircle, ArrowLeft } from 'lucide-react';

interface ThankYouScreenProps {
  onDownloadAgain: () => void;
  onStartOver: () => void;
  totalPhotos: number;
  photoTypeName: string;
  isDownloading?: boolean;
}

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  onDownloadAgain,
  onStartOver,
  totalPhotos,
  photoTypeName,
  isDownloading = false
}) => {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/20 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>

        {/* Thank You Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Obrigado!
          </h2>
          <p className="text-lg text-gray-300">
            Seu PDF foi gerado com sucesso
          </p>
          <div className="bg-purple-500/20 rounded-lg p-4 inline-block">
            <p className="text-purple-200">
              <span className="font-bold">{totalPhotos}</span> fotos {photoTypeName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button
            onClick={onDownloadAgain}
            disabled={isDownloading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Download className="h-5 w-5 mr-2" />
            {isDownloading ? 'Baixando...' : 'Baixar Novamente'}
          </Button>

          <Button
            onClick={onStartOver}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-400 pt-4">
          <p>Dica: Salve o arquivo em um local seguro para não perder suas fotos</p>
        </div>
      </div>
    </Card>
  );
};

export default ThankYouScreen;
