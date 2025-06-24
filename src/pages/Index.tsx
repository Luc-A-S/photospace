import React, { useState, useRef } from 'react';
import { Upload, Download, Loader2, ExternalLink, ArrowLeft, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import ImageEditor from '@/components/ImageEditor';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'editor' | 'photoroom' | 'quantity' | 'final'>('upload');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [adjustedImage, setAdjustedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(2); // Mudado para 2
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoadingPaste, setIsLoadingPaste] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoRoomUploadRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    setOriginalImage(file);
    
    const imageUrl = URL.createObjectURL(file);
    setProcessedImage(imageUrl);
    setCurrentStep('editor');
    
    toast({
      title: "Imagem carregada!",
      description: "Agora ajuste a posição da imagem na proporção 3x4."
    });
  };

  const handlePasteImage = async () => {
    setIsLoadingPaste(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], 'pasted-image.png', { type });
            handleFileSelect(file);
            return;
          }
        }
      }
      
      toast({
        title: "Nenhuma imagem encontrada",
        description: "Copie uma imagem e tente novamente.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro ao colar imagem",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPaste(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageAdjusted = (adjustedImageUrl: string) => {
    setAdjustedImage(adjustedImageUrl);
    setCurrentStep('photoroom');
    
    toast({
      title: "Imagem ajustada!",
      description: "Baixe a imagem, use o PhotoRoom para remover o fundo e depois faça upload aqui."
    });
  };

  const openPhotoRoom = () => {
    console.log('Opening PhotoRoom...');
    const photoRoomUrl = 'https://www.photoroom.com/pt-br/ferramentas/remover-fundo-de-imagem';
    
    const width = 800;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    const popup = window.open(
      photoRoomUrl,
      'photoroom',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
    
    if (popup) {
      toast({
        title: "PhotoRoom aberto!",
        description: "Use o PhotoRoom para remover o fundo da imagem baixada."
      });
    } else {
      window.open(photoRoomUrl, '_blank');
      toast({
        title: "PhotoRoom aberto em nova aba!",
        description: "Use o PhotoRoom para remover o fundo da imagem baixada."
      });
    }
  };

  const handlePhotoRoomUpload = () => {
    photoRoomUploadRef.current?.click();
  };

  const handlePhotoRoomFileSelect = (file: File) => {
    console.log('PhotoRoom processed file selected:', file.name);
    
    const imageUrl = URL.createObjectURL(file);
    setProcessedImage(imageUrl);
    setCurrentStep('quantity');
    
    toast({
      title: "Imagem sem fundo carregada!",
      description: "Agora escolha quantas cópias deseja gerar."
    });
  };

  const generateDocument = async () => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    try {
      console.log('Generating PDF...');
      const pdf = await generatePDF(processedImage, quantity);
      setPdfBlob(pdf);
      setCurrentStep('final');
      
      toast({
        title: "PDF gerado!",
        description: `${quantity} fotos 3x4 organizadas com contornos para recorte.`
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
    if (pdfBlob) {
      console.log('Downloading PDF...');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FOTO 3X4 [PDF].pdf';
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
    setCurrentStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setAdjustedImage(null);
    setPdfBlob(null);
    setQuantity(2);
    
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    if (adjustedImage) {
      URL.revokeObjectURL(adjustedImage);
    }
  };

  const goBackToUpload = () => {
    setCurrentStep('upload');
    setProcessedImage(null);
    setAdjustedImage(null);
  };

  const goBackToEditor = () => {
    setCurrentStep('editor');
  };

  const goBackToPhotoRoom = () => {
    setCurrentStep('photoroom');
  };

  const goBackToQuantity = () => {
    setCurrentStep('quantity');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-3 shadow-2xl shadow-purple-500/20">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 sm:mb-4 px-4">
            📸 Foto 3x4 Sem Fundo
          </h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-4 leading-relaxed">
            PDF Pronto para Imprimir - Faça upload da sua foto, ajuste manualmente, use o PhotoRoom para remover o fundo e gere múltiplas cópias
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          {currentStep === 'upload' && (
            <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  Faça Upload da sua Imagem
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  Escolha uma foto para começar o processo
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <Button
                  onClick={handleUploadClick}
                  className="h-24 sm:h-32 w-full sm:w-64 bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-lg transition-all duration-300 hover:scale-105 border border-purple-400/30"
                >
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="text-base sm:text-lg font-medium">Fazer Upload</span>
                </Button>

                <div className="text-gray-400 font-medium text-sm sm:text-base">OU</div>

                <div className="w-full max-w-md">
                  <Button
                    onClick={handlePasteImage}
                    disabled={isLoadingPaste}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 border border-emerald-400/30"
                  >
                    {isLoadingPaste ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    ) : (
                      <Clipboard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    )}
                    Colar Imagem Copiada
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-400 text-center mt-2">
                    Copie uma imagem e clique aqui
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </Card>
          )}

          {currentStep === 'editor' && processedImage && (
            <ImageEditor
              imageUrl={processedImage}
              onDownload={handleImageAdjusted}
              onBack={goBackToUpload}
            />
          )}

          {currentStep === 'photoroom' && adjustedImage && (
            <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    onClick={goBackToEditor}
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white text-center sm:text-left">
                    Remover Fundo no PhotoRoom
                  </h2>
                  <div className="hidden sm:block"></div>
                </div>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Sua imagem 3x4 já foi baixada. Agora use o PhotoRoom para remover o fundo e depois faça upload da imagem processada.
                </p>
              </div>

              <div className="flex flex-col gap-4 items-center">
                <Button
                  onClick={openPhotoRoom}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Abrir PhotoRoom
                </Button>
                
                <Button
                  onClick={handlePhotoRoomUpload}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 border-0"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Upload da Imagem Sem Fundo
                </Button>
              </div>

              <input
                ref={photoRoomUploadRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoRoomFileSelect(file);
                }}
                className="hidden"
              />
            </Card>
          )}

          {currentStep === 'quantity' && processedImage && (
            <Card className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    onClick={goBackToPhotoRoom}
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white text-center sm:text-left">
                    Imagem Final (3x4 sem fundo)
                  </h2>
                  <div className="hidden sm:block"></div>
                </div>
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="bg-slate-700/50 rounded-2xl p-4 shadow-xl">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-24 h-32 sm:w-32 sm:h-42 object-cover rounded-xl"
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">
                  Foto 3x4 sem fundo, pronta para gerar o PDF
                </p>
              </div>

              <div className="max-w-md mx-auto mb-6 sm:mb-8">
                <Label htmlFor="quantity" className="text-base sm:text-lg font-medium text-white mb-3 block">
                  Quantas fotos deseja gerar?
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-center text-lg rounded-xl py-3 border-2 border-purple-400/30 bg-slate-700/50 text-white focus:border-purple-500 backdrop-blur-sm"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={generateDocument}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>
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
                  {quantity} fotos 3x4 com contornos pretos para fácil recorte
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
