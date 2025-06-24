
import React, { useState, useRef } from 'react';
import { Upload, Download, Loader2, ExternalLink, ArrowLeft, Clipboard, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import ImageEditor from '@/components/ImageEditor';
import PhotoTypeSelector from '@/components/PhotoTypeSelector';
import MultiImageEditor from '@/components/MultiImageEditor';
import BackgroundRemovalStep from '@/components/BackgroundRemovalStep';
import QuantitySelector from '@/components/QuantitySelector';

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

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'photoType' | 'upload' | 'multiEditor' | 'backgroundRemoval' | 'quantity' | 'final'>('photoType');
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoTypeSelect = (photoType: PhotoType) => {
    console.log('Photo type selected:', photoType);
    
    const photoTypeWithDimensions = {
      ...photoType,
      width: photoType.id === '3x4' ? 30 : 
             photoType.id === '5x7' ? 50 :
             photoType.id === '2x2' ? 20 :
             photoType.id === '3.5x4.5' ? 35 :
             photoType.id === '4x5' ? 40 :
             photoType.id === '2.5x3' ? 25 : 30,
      height: photoType.id === '3x4' ? 40 : 
              photoType.id === '5x7' ? 70 :
              photoType.id === '2x2' ? 20 :
              photoType.id === '3.5x4.5' ? 45 :
              photoType.id === '4x5' ? 50 :
              photoType.id === '2.5x3' ? 30 : 40
    };
    
    setSelectedPhotoType(photoTypeWithDimensions);
    setCurrentStep('upload');
    
    toast({
      title: `${photoType.name} selecionada!`,
      description: `Agora faça upload das imagens para criar fotos ${photoType.dimensions}.`
    });
  };

  const handleFileSelect = (files: FileList) => {
    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach((file, index) => {
      const imageId = `image-${Date.now()}-${index}`;
      const imageUrl = URL.createObjectURL(file);
      
      newImages.push({
        id: imageId,
        file,
        url: imageUrl,
        quantity: 2
      });
    });
    
    setImages(prev => [...prev, ...newImages]);
    
    toast({
      title: "Imagens carregadas!",
      description: `${newImages.length} imagem(ns) adicionada(s). Adicione mais ou clique em Editar.`
    });
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
        if (imageToRemove.adjustedUrl) URL.revokeObjectURL(imageToRemove.adjustedUrl);
        if (imageToRemove.processedUrl) URL.revokeObjectURL(imageToRemove.processedUrl);
      }
      return updated;
    });
    
    toast({
      title: "Imagem removida",
      description: "A imagem foi removida da lista."
    });
  };

  const proceedToEdit = () => {
    if (images.length === 0) {
      toast({
        title: "Nenhuma imagem",
        description: "Adicione pelo menos uma imagem antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('multiEditor');
  };

  const handleImageAdjusted = (imageId: string, adjustedUrl: string) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, adjustedUrl } : img
      )
    );
  };

  const proceedToBackgroundRemoval = () => {
    const allAdjusted = images.every(img => img.adjustedUrl);
    if (!allAdjusted) {
      toast({
        title: "Imagens não ajustadas",
        description: "Ajuste todas as imagens antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('backgroundRemoval');
  };

  const handleProcessedImageUpload = (imageId: string, processedUrl: string) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, processedUrl } : img
      )
    );
  };

  const proceedToQuantity = () => {
    const allProcessed = images.every(img => img.processedUrl);
    if (!allProcessed) {
      toast({
        title: "Imagens não processadas",
        description: "Faça upload de todas as imagens sem fundo antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('quantity');
  };

  const handleQuantityUpdate = (imageId: string, quantity: number) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, quantity } : img
      )
    );
  };

  const generateDocument = async () => {
    if (!selectedPhotoType || images.length === 0) return;
    
    setIsProcessing(true);
    try {
      console.log('Generating PDF...');
      const pdf = await generatePDF(images, selectedPhotoType.width, selectedPhotoType.height);
      setPdfBlob(pdf);
      setCurrentStep('final');
      
      const totalPhotos = images.reduce((sum, img) => sum + img.quantity, 0);
      toast({
        title: "PDF gerado!",
        description: `${totalPhotos} fotos ${selectedPhotoType.name} organizadas com contornos para recorte.`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (pdfBlob && selectedPhotoType) {
      console.log('Downloading PDF...');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPhotoType.name.toUpperCase()} [PDF].pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado!",
        description: "O PDF foi baixado com sucesso."
      });
    }
  };

  const resetApp = () => {
    console.log('Resetting app...');
    images.forEach(img => {
      URL.revokeObjectURL(img.url);
      if (img.adjustedUrl) URL.revokeObjectURL(img.adjustedUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    
    setCurrentStep('photoType');
    setSelectedPhotoType(null);
    setImages([]);
    setPdfBlob(null);
  };

  const goBack = () => {
    if (currentStep === 'upload') setCurrentStep('photoType');
    else if (currentStep === 'multiEditor') setCurrentStep('upload');
    else if (currentStep === 'backgroundRemoval') setCurrentStep('multiEditor');
    else if (currentStep === 'quantity') setCurrentStep('backgroundRemoval');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
      
      {/* Animated Spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent blur-2xl animate-spotlight shadow-2xl"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent blur-2xl animate-spotlight-reverse shadow-xl"></div>
        <div className="absolute w-[350px] h-[350px] bg-gradient-to-r from-transparent via-pink-400/30 to-transparent blur-xl animate-spotlight shadow-lg" style={{animationDelay: '6s', animationDuration: '18s'}}></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-2xl animate-spotlight-reverse shadow-lg" style={{animationDelay: '9s', animationDuration: '20s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <img 
                src="/lovable-uploads/a9286ee7-5793-4963-9b72-95cfb16e6374.png" 
                alt="PhotoSpace Logo"
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 sm:mb-4 px-4">
            PhotoSpace
          </h1>
          <p className="text-sm text-purple-300/80 mb-3 font-medium">
            Criado por Bazar do Izaias
          </p>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-4 leading-relaxed">
            {selectedPhotoType ? 
              `Criando ${selectedPhotoType.name} (${selectedPhotoType.dimensions}) - Prepare, Ajuste, Imprima, e Pronto!` :
              'Prepare, Ajuste, Imprima, e Pronto!'
            }
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          {currentStep === 'photoType' && (
            <PhotoTypeSelector onSelectType={handlePhotoTypeSelect} />
          )}

          {currentStep === 'upload' && (
            <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    onClick={goBack}
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <div className="text-center flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
                      Upload de Imagens
                    </h2>
                    {selectedPhotoType && (
                      <div className="text-sm text-purple-300 bg-purple-500/20 rounded-lg px-3 py-1 inline-block mt-2">
                        {selectedPhotoType.name} ({selectedPhotoType.dimensions})
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block w-[100px]"></div>
                </div>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Selecione múltiplas imagens para criar fotos {selectedPhotoType?.dimensions || ''}.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 border-0"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Selecionar Imagens
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleFileSelect(e.target.files);
                  }}
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="w-full space-y-4">
                    <h3 className="text-lg font-medium text-white text-center">
                      Imagens Anexadas ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={image.id} className="bg-slate-700/50 rounded-xl p-3 relative">
                          <img
                            src={image.url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs text-gray-300 text-center mb-2">
                            Imagem {index + 1}
                          </p>
                          <Button
                            onClick={() => removeImage(image.id)}
                            size="sm"
                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={proceedToEdit}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar Imagens
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {currentStep === 'multiEditor' && selectedPhotoType && (
            <MultiImageEditor
              images={images}
              photoType={selectedPhotoType}
              onImageAdjusted={handleImageAdjusted}
              onBack={goBack}
              onContinue={proceedToBackgroundRemoval}
            />
          )}

          {currentStep === 'backgroundRemoval' && (
            <BackgroundRemovalStep
              images={images}
              onProcessedImageUpload={handleProcessedImageUpload}
              onBack={goBack}
              onContinue={proceedToQuantity}
            />
          )}

          {currentStep === 'quantity' && selectedPhotoType && (
            <QuantitySelector
              images={images}
              photoType={selectedPhotoType}
              onQuantityUpdate={handleQuantityUpdate}
              onBack={goBack}
              onGeneratePDF={generateDocument}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'final' && pdfBlob && (
            <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20 text-center">
              <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <Download className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  PDF Pronto!
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  {images.reduce((sum, img) => sum + img.quantity, 0)} {selectedPhotoType?.name || 'fotos'} ({selectedPhotoType?.dimensions || ''}) com contornos pretos para fácil recorte
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <Button
                  onClick={downloadPDF}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Baixar PDF
                </Button>
              </div>

              <Button
                onClick={resetApp}
                variant="ghost"
                className="text-gray-400 hover:text-white rounded-xl"
              >
                Criar Novo PDF
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
