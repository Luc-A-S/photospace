import React, { useState, useRef } from 'react';
import { Upload, Download, Loader2, ExternalLink, ArrowLeft, Link, Image } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  
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

  const handleUrlLoad = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingUrl(true);
    try {
      // Verificar se a URL é uma imagem válida
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      setProcessedImage(imageUrl);
      setCurrentStep('editor');
      
      toast({
        title: "Imagem carregada por URL!",
        description: "Agora ajuste a posição da imagem na proporção 3x4."
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar URL",
        description: "Não foi possível carregar a imagem da URL fornecida.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelect(file);
          return;
        }
      }
    }

    // Check for URLs in clipboard text
    const text = e.clipboardData?.getData('text');
    if (text && (text.startsWith('http') || text.startsWith('data:image'))) {
      setImageUrl(text);
      await handleUrlLoad();
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
    
    // Calcular posição centralizada - janela menor
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
    setImageUrl('');
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-3 shadow-lg">
              <Upload className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            📸 Foto 3x4 Sem Fundo
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            PDF Pronto para Imprimir - Faça upload da sua foto, ajuste manualmente, use o PhotoRoom para remover o fundo e gere múltiplas cópias
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-2 md:px-0">
          {currentStep === 'upload' && (
            <Card className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
                  Faça Upload da sua Imagem
                </h2>
                <p className="text-gray-300 text-sm md:text-base">
                  Escolha uma foto para começar o processo
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <Button
                  onClick={handleUploadClick}
                  className="h-24 md:h-32 w-full max-w-xs md:w-64 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Upload className="h-6 w-6 md:h-8 md:w-8" />
                  <span className="text-base md:text-lg font-medium">Fazer Upload</span>
                </Button>

                <div className="text-gray-400 font-medium text-sm md:text-base">OU</div>

                <div className="w-full max-w-md space-y-4">
                  <Label htmlFor="image-url" className="text-base md:text-lg font-medium text-white">
                    Carregar por URL ou Colar Imagem
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="Cole uma URL ou Ctrl+V para colar imagem"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onPaste={handlePaste}
                      className="flex-1 rounded-xl border-2 border-purple-500/30 bg-slate-700/50 text-white placeholder-gray-400 focus:border-purple-400"
                    />
                    <Button
                      onClick={handleUrlLoad}
                      disabled={isLoadingUrl || !imageUrl.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-4 md:px-6"
                    >
                      {isLoadingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 text-center">
                    💡 Dica: Você pode copiar uma imagem (Ctrl+C) e colar aqui (Ctrl+V)
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
            <Card className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    onClick={goBackToEditor}
                    variant="outline"
                    className="flex items-center gap-2 border-purple-500/30 text-white hover:bg-purple-500/20 order-2 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <h2 className="text-xl md:text-2xl font-semibold text-white order-1 sm:order-2">
                    Remover Fundo no PhotoRoom
                  </h2>
                  <div className="order-3 hidden sm:block"></div>
                </div>
                <p className="text-gray-300 mb-6 text-sm md:text-base px-2">
                  Sua imagem 3x4 já foi baixada. Agora use o PhotoRoom para remover o fundo e depois faça upload da imagem processada.
                </p>
              </div>

              <div className="flex flex-col gap-4 items-center">
                <Button
                  onClick={openPhotoRoom}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 md:px-8 py-3 rounded-xl text-base md:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 w-full max-w-xs"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Abrir PhotoRoom
                </Button>
                
                <Button
                  onClick={handlePhotoRoomUpload}
                  variant="outline"
                  className="border-2 border-purple-400/50 hover:border-purple-400 text-white hover:bg-purple-500/20 px-6 md:px-8 py-3 rounded-xl text-base md:text-lg font-medium transition-all duration-300 hover:scale-105 w-full max-w-xs"
                >
                  <Upload className="h-5 w-5 mr-2" />
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
            <Card className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl border border-purple-500/20">
              <div className="text-center mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    onClick={goBackToPhotoRoom}
                    variant="outline"
                    className="flex items-center gap-2 border-purple-500/30 text-white hover:bg-purple-500/20 order-2 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <h2 className="text-xl md:text-2xl font-semibold text-white order-1 sm:order-2">
                    Imagem Final (3x4 sem fundo)
                  </h2>
                  <div className="order-3 hidden sm:block"></div>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-24 h-32 md:w-32 md:h-42 object-cover rounded-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Foto 3x4 sem fundo, pronta para gerar o PDF
                </p>
              </div>

              <div className="max-w-md mx-auto mb-6 md:mb-8">
                <Label htmlFor="quantity" className="text-base md:text-lg font-medium text-white mb-3 block">
                  Quantas fotos deseja gerar?
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-center text-lg rounded-xl py-3 border-2 border-purple-500/30 bg-slate-700/50 text-white focus:border-purple-400"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={generateDocument}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 md:px-8 py-3 rounded-xl text-base md:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 w-full max-w-xs"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 'final' && pdfBlob && (
            <Card className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl border border-purple-500/20 text-center">
              <div className="mb-6 md:mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 flex items-center justify-center">
                  <Download className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  PDF Pronto!
                </h2>
                <p className="text-gray-300 text-sm md:text-base">
                  {quantity} fotos 3x4 com contornos pretos para fácil recorte
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <Button
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 w-full max-w-xs"
                >
                  <Download className="h-5 w-5 mr-2" />
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
