
import React, { useState, useRef } from 'react';
import { Camera, Upload, Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'quantity' | 'final'>('upload');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (file: File) => {
    setOriginalImage(file);
    processImage(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Erro ao acessar câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            handleFileSelect(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    try {
      console.log('Starting image processing...');
      const imageElement = await loadImage(file);
      console.log('Image loaded successfully');
      
      const processedBlob = await removeBackground(imageElement);
      console.log('Background removed successfully');
      
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      setCurrentStep('quantity');
      
      toast({
        title: "Imagem processada!",
        description: "Fundo removido e rosto centralizado com sucesso."
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive"
      });
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDocument = async () => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    try {
      const pdf = await generatePDF(processedImage, quantity);
      setPdfBlob(pdf);
      setCurrentStep('final');
      
      toast({
        title: "PDF gerado!",
        description: `${quantity} fotos 3x4 organizadas para impressão.`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o documento.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fotos-3x4-${quantity}-copias.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const printPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);
      };
    }
  };

  const resetApp = () => {
    setCurrentStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setPdfBlob(null);
    setQuantity(4);
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📸 Foto 3x4 Sem Fundo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PDF Pronto para Imprimir - Remova o fundo, centralize o rosto e gere múltiplas cópias organizadas
          </p>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold mb-2">Tirar Foto</h3>
                <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl py-3"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 rounded-xl py-3"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Escolha sua Imagem
                </h2>
                <p className="text-gray-600">
                  Tire uma foto ou faça upload de uma imagem existente
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Button
                  onClick={startCamera}
                  className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-lg font-medium">Tirar Foto Agora</span>
                </Button>
                
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:bg-blue-50"
                >
                  <Upload className="h-8 w-8 text-blue-500" />
                  <span className="text-lg font-medium text-blue-600">Fazer Upload</span>
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

          {currentStep === 'processing' && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Processando sua Imagem
                  </h2>
                  <p className="text-gray-600">
                    Removendo fundo e centralizando o rosto com IA...
                  </p>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 'quantity' && processedImage && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-0">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Imagem Processada
                </h2>
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-32 h-42 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                </div>
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
                  {quantity} fotos 3x4 organizadas para impressão em A4
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Baixar PDF
                </Button>
                
                <Button
                  onClick={printPDF}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Imprimir Agora
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
