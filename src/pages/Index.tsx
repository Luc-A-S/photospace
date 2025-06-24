import React, { useState, useRef } from 'react';
import { Upload, Download, Loader2, ExternalLink } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
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
    
    // Calcular posição centralizada
    const width = 1000;
    const height = 700;
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
    setQuantity(4);
    
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    if (adjustedImage) {
      URL.revokeObjectURL(adjustedImage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
              <Upload className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📸 Foto 3x4 Sem Fundo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PDF Pronto para Imprimir - Faça upload da sua foto, ajuste manualmente, use o PhotoRoom para remover o fundo e gere múltiplas cópias
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Faça Upload da sua Imagem
                </h2>
                <p className="text-gray-600">
                  Escolha uma foto para começar o processo
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleUploadClick}
                  className="h-32 w-64 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-lg font-medium">Fazer Upload</span>
                </Button>
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
            />
          )}

          {currentStep === 'photoroom' && adjustedImage && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Remover Fundo no PhotoRoom
                </h2>
                <p className="text-gray-600 mb-6">
                  Sua imagem 3x4 já foi baixada. Agora use o PhotoRoom para remover o fundo e depois faça upload da imagem processada.
                </p>
              </div>

              <div className="flex flex-col gap-4 items-center">
                <Button
                  onClick={openPhotoRoom}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Abrir PhotoRoom
                </Button>
                
                <Button
                  onClick={handlePhotoRoomUpload}
                  variant="outline"
                  className="border-2 border-blue-300 hover:border-blue-500 px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105"
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
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Imagem Final (3x4 sem fundo)
                </h2>
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-32 h-42 object-cover rounded-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Foto 3x4 sem fundo, pronta para gerar o PDF
                </p>
              </div>

              <div className="max-w-md mx-auto mb-8">
                <Label htmlFor="quantity" className="text-lg font-medium text-gray-700 mb-3 block">
                  Quantas fotos deseja gerar?
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-center text-lg rounded-xl py-3 border-2 border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={generateDocument}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
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
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0 text-center">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  PDF Pronto!
                </h2>
                <p className="text-gray-600">
                  {quantity} fotos 3x4 com contornos pretos para fácil recorte
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <Button
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Baixar PDF
                </Button>
              </div>

              <Button
                onClick={resetApp}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 rounded-xl"
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
