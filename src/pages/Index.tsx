
import React, { useState } from 'react';
import PhotoTypeSelector from '@/components/PhotoTypeSelector';
import MultiImageEditor from '@/components/MultiImageEditor';
import QuantitySelector from '@/components/QuantitySelector';
import ThankYouScreen from '@/components/ThankYouScreen';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

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

type Step = 'photo-type' | 'image-editor' | 'quantity-selector' | 'thank-you';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('photo-type');
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePhotoTypeSelect = (photoType: PhotoType) => {
    setSelectedPhotoType(photoType);
    setCurrentStep('image-editor');
  };

  const handleImagesProcessed = (processedImages: ImageFile[]) => {
    setImages(processedImages);
    setCurrentStep('quantity-selector');
  };

  const handleQuantityUpdate = (imageId: string, quantity: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, quantity } : img
    ));
  };

  const handleGeneratePDF = async () => {
    if (!selectedPhotoType) return;
    
    setIsProcessing(true);
    try {
      const pdfBlob = await generatePDF(images, selectedPhotoType.width, selectedPhotoType.height);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fotos-${selectedPhotoType.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O download começou automaticamente.",
      });
      
      setCurrentStep('thank-you');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAgain = async () => {
    if (!selectedPhotoType) return;
    
    setIsProcessing(true);
    try {
      const pdfBlob = await generatePDF(images, selectedPhotoType.width, selectedPhotoType.height);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fotos-${selectedPhotoType.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado novamente!",
        description: "O PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Error downloading PDF again:', error);
      toast({
        title: "Erro ao baixar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('photo-type');
    setSelectedPhotoType(null);
    setImages([]);
    setIsProcessing(false);
  };

  const handleBackToPhotoType = () => {
    setCurrentStep('photo-type');
    setSelectedPhotoType(null);
    setImages([]);
  };

  const handleBackToImageEditor = () => {
    setCurrentStep('image-editor');
  };

  const totalPhotos = images.reduce((sum, img) => sum + img.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {currentStep === 'photo-type' && (
          <PhotoTypeSelector onPhotoTypeSelect={handlePhotoTypeSelect} />
        )}
        
        {currentStep === 'image-editor' && selectedPhotoType && (
          <MultiImageEditor
            photoType={selectedPhotoType}
            onImagesProcessed={handleImagesProcessed}
            onBack={handleBackToPhotoType}
          />
        )}
        
        {currentStep === 'quantity-selector' && selectedPhotoType && (
          <QuantitySelector
            images={images}
            photoType={selectedPhotoType}
            onQuantityUpdate={handleQuantityUpdate}
            onBack={handleBackToImageEditor}
            onGeneratePDF={handleGeneratePDF}
            isProcessing={isProcessing}
          />
        )}
        
        {currentStep === 'thank-you' && selectedPhotoType && (
          <ThankYouScreen
            onDownloadAgain={handleDownloadAgain}
            onStartOver={handleStartOver}
            totalPhotos={totalPhotos}
            photoTypeName={selectedPhotoType.name}
            isDownloading={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
