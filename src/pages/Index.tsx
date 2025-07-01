
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Loader2, ExternalLink, ArrowLeft, Clipboard, Edit3, Trash2, CircleDollarSign, Play, Pause, Heart } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'photoType' | 'upload' | 'multiEditor' | 'backgroundRemoval' | 'quantity' | 'final' | 'thanks'>('photoType');
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Adsterra script when component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//craptroopstammer.com/2bef587e1910539b0471f8cc71d76425/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const toggleAnimation = () => {
    setIsAnimationEnabled(prev => !prev);
    toast({
      title: isAnimationEnabled ? "Animações desativadas" : "Animações ativadas",
      description: isAnimationEnabled ? "As animações do fundo foram pausadas." : "As animações do fundo foram reativadas."
    });
  };

  const handleSupportClick = () => {
    window.open('https://craptroopstammer.com/y7mf0ipu?key=14c7bd000f8223e76c05c6ec461fc175', '_blank');
  };

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Filter only image files
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const fileList = new DataTransfer();
        imageFiles.forEach(file => fileList.items.add(file));
        handleFileSelect(fileList.files);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, arraste apenas arquivos de imagem.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            
            // Criar um File a partir do blob
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });
            
            const imageId = `image-${Date.now()}`;
            const imageUrl = URL.createObjectURL(file);
            
            const newImage: ImageFile = {
              id: imageId,
              file,
              url: imageUrl,
              quantity: 2
            };
            
            setImages(prev => [...prev, newImage]);
            
            toast({
              title: "Imagem colada!",
              description: "Imagem da área de transferência adicionada com sucesso."
            });
            
            return; // Só cola a primeira imagem encontrada
          }
        }
      }
      
      // Se chegou aqui, não encontrou nenhuma imagem
      toast({
        title: "Nenhuma imagem encontrada",
        description: "Não há nenhuma imagem na área de transferência.",
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('Erro ao colar imagem:', error);
      toast({
        title: "Erro ao colar",
        description: "Não foi possível acessar a área de transferência. Verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
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

  const downloadPDFAndGoToThanks = () => {
    downloadPDF();
    setCurrentStep('thanks');
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
      
      {/* Animated Spotlights - conditionally rendered */}
      {isAnimationEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent blur-2xl animate-spotlight shadow-2xl"></div>
          <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent blur-2xl animate-spotlight-reverse shadow-xl"></div>
          <div className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-gradient-to-r from-transparent via-pink-400/30 to-transparent blur-xl animate-spotlight shadow-lg" style={{animationDelay: '6s', animationDuration: '18s'}}></div>
          <div className="absolute w-[180px] md:w-[300px] h-[180px] md:h-[300px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-2xl animate-spotlight-reverse shadow-lg" style={{animationDelay: '9s', animationDuration: '20s'}}></div>
        </div>
      )}
      
      {/* Galaxy Particles - conditionally rendered */}
      {isAnimationEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Partículas flutuantes */}
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          <div className="galaxy-particle"></div>
          
          {/* Partículas que atravessam a tela */}
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
          <div className="drift-particle"></div>
        </div>
      )}
      
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 relative">
          {/* Animation Toggle Button */}
          <div className="absolute top-0 right-0">
            <Button
              onClick={toggleAnimation}
              size="sm"
              className="bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/70 text-white border border-purple-500/30 shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              {isAnimationEnabled ? (
                <>
                  <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Pausar Animações</span>
                  <span className="sm:hidden">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Ativar Animações</span>
                  <span className="sm:hidden">Ativar</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
            <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-2xl">
              <img 
                src="/lovable-uploads/a9286ee7-5793-4963-9b72-95cfb16e6374.png" 
                alt="PhotoSpace Logo"
                className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 via-white to-blue-200 bg-clip-text text-transparent mb-2 sm:mb-4 px-2 sm:px-4 leading-tight">
            PhotoSpace
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mb-2 sm:mb-3 font-medium">
            Criado com ❤️ por Bazar do Izaias
          </p>
          <p className="text-xs sm:text-sm md:text-lg text-gray-300 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed mb-4">
            {selectedPhotoType ? 
              `Criando ${selectedPhotoType.name} (${selectedPhotoType.dimensions}) - Prepare, Ajuste, Imprima, e Pronto!` :
              'Prepare, Ajuste, Imprima, e Pronto!'
            }
          </p>
          
          {/* Support Button with Neon Pulse */}
          <div className="flex flex-col justify-center items-center gap-2">
            <Button
              onClick={handleSupportClick}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105 border-0 animate-pulse relative overflow-hidden"
              style={{
                boxShadow: '0 0 20px rgba(234, 179, 8, 0.6), 0 0 40px rgba(234, 179, 8, 0.4), 0 0 60px rgba(234, 179, 8, 0.2)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <CircleDollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Apoie
            </Button>
            <p className="text-xs text-gray-400 font-medium">
              Sem gastar nada
            </p>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === 'photoType' && (
          <PhotoTypeSelector onSelectType={handlePhotoTypeSelect} />
        )}

        {currentStep === 'upload' && (
          <Card className="bg-slate-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-purple-500/20">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
                <Button
                  onClick={goBack}
                  className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto text-sm px-3 py-2"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  Voltar
                </Button>
                <div className="text-center flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center">
                    Upload de Imagens
                  </h2>
                  {selectedPhotoType && (
                    <div className="text-xs sm:text-sm text-purple-300 bg-purple-500/20 rounded-lg px-2 sm:px-3 py-1 inline-block mt-2">
                      {selectedPhotoType.name} ({selectedPhotoType.dimensions})
                    </div>
                  )}
                </div>
                <div className="hidden sm:block w-[80px] md:w-[100px]"></div>
              </div>
              <p className="text-gray-300 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base px-2">
                Selecione múltiplas imagens para criar fotos {selectedPhotoType?.dimensions || ''}.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 cursor-pointer ${
                  isDragOver 
                    ? 'border-purple-400 bg-purple-500/20 scale-105' 
                    : 'border-purple-500/50 bg-slate-700/30 hover:border-purple-400 hover:bg-purple-500/10'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {isDragOver ? 'Solte suas imagens aqui!' : 'Arrastar e Soltar Imagens'}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                    Arraste suas imagens aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400">
                    Suporta: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>

              {/* Alternative buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105 border-0"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Selecionar Arquivos
                </Button>

                <Button
                  onClick={handlePasteImage}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105 border-0"
                >
                  <Clipboard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Colar Imagem
                </Button>
              </div>

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
                <div className="w-full space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-white text-center">
                    Imagens Anexadas ({images.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="bg-slate-700/50 rounded-lg sm:rounded-xl p-2 sm:p-3 relative">
                        <img
                          src={image.url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-md sm:rounded-lg mb-2"
                        />
                        <p className="text-xs text-gray-300 text-center mb-2">
                          Imagem {index + 1}
                        </p>
                        <Button
                          onClick={() => removeImage(image.id)}
                          size="sm"
                          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
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
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
          <Card className="bg-slate-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-purple-500/20 text-center">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-xl">
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
                PDF Pronto!
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base px-2">
                {images.reduce((sum, img) => sum + img.quantity, 0)} {selectedPhotoType?.name || 'fotos'} ({selectedPhotoType?.dimensions || ''}) com contornos pretos para fácil recorte
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={downloadPDFAndGoToThanks}
                className="neon-button w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </Card>
        )}

        {/* Nova tela de agradecimento */}
        {currentStep === 'thanks' && (
          <Card className="bg-slate-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-purple-500/20 text-center">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-3 sm:p-4 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">
                Obrigado por usar o PhotoSpace!
              </h2>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-2 px-2">
                Seu PDF foi gerado com sucesso! 🎉
              </p>
              <p className="text-xs sm:text-sm text-purple-300">
                Esperamos que suas fotos fiquem perfeitas!
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Baixar Novamente
                </Button>
                
                <Button
                  onClick={resetApp}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Criar Outro PDF
                </Button>
              </div>
              
              <div className="text-xs text-gray-400 mt-4 sm:mt-6">
                Criado com ❤️ por Bazar do Izaias
              </div>
            </div>
          </Card>
        )}

        {/* Adsterra Banner - Now integrated in the normal flow */}
        <div className="mt-8 sm:mt-12 mb-6 sm:mb-8">
          <div className="flex justify-center items-center py-4 sm:py-6">
            <div className="text-center w-full max-w-screen-lg mx-auto">
              <script async data-cfasync="false" src="//craptroopstammer.com/2bef587e1910539b0471f8cc71d76425/invoke.js"></script>
              <div 
                id="container-2bef587e1910539b0471f8cc71d76425" 
                className="
                  scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-90 xl:scale-100
                  transform origin-center
                  max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[728px]
                  mx-auto
                  overflow-hidden
                "
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
