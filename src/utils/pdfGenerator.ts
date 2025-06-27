
import jsPDF from 'jspdf';

interface ImageFile {
  id: string;
  file: File;
  url: string;
  adjustedUrl?: string;
  processedUrl?: string;
  quantity: number;
}

export const generatePDF = async (images: ImageFile[], photoWidth: number, photoHeight: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Margins and spacing
      const margin = 15;
      const spacing = 5;
      
      // Calculate how many photos can fit per row and column
      const photosPerRow = Math.floor((pageWidth - 2 * margin + spacing) / (photoWidth + spacing));
      const photosPerCol = Math.floor((pageHeight - 2 * margin + spacing) / (photoHeight + spacing));
      const photosPerPage = photosPerRow * photosPerCol;
      
      let photoCount = 0;
      let currentPage = 1;
      let totalPhotos = 0;
      
      // Count total photos
      images.forEach(img => {
        totalPhotos += img.quantity;
      });
      
      console.log(`Generating PDF with ${totalPhotos} photos from ${images.length} different images`);
      
      // Load all images first (including the logo)
      const logoPromise = new Promise<HTMLImageElement>((resolveImg, rejectImg) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolveImg(img);
        img.onerror = () => rejectImg(new Error('Failed to load logo image'));
        img.src = '/lovable-uploads/b8ab5e4d-8d4e-4b52-90c8-efde1b1a2621.png';
      });
      
      const loadPromises = images.map(image => {
        return new Promise<{ img: HTMLImageElement, quantity: number }>((resolveImg, rejectImg) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolveImg({ img, quantity: image.quantity });
          img.onerror = () => rejectImg(new Error(`Failed to load image: ${image.id}`));
          img.src = image.processedUrl || image.url;
        });
      });
      
      Promise.all([logoPromise, ...loadPromises]).then(([logoImg, ...loadedImages]) => {
        // Add photos to PDF
        loadedImages.forEach(({ img, quantity }) => {
          for (let i = 0; i < quantity; i++) {
            // Calculate position
            const row = Math.floor((photoCount % photosPerPage) / photosPerRow);
            const col = (photoCount % photosPerPage) % photosPerRow;
            
            const x = margin + col * (photoWidth + spacing);
            const y = margin + row * (photoHeight + spacing);
            
            // Add new page if needed
            if (photoCount > 0 && photoCount % photosPerPage === 0) {
              pdf.addPage();
              currentPage++;
            }
            
            // Add image first
            pdf.addImage(img, 'PNG', x, y, photoWidth, photoHeight);
            
            // Add border inside the image boundaries (inset by 0.1mm to stay within limits)
            const borderInset = 0.1;
            pdf.setDrawColor(0, 0, 0); // Black color
            pdf.setLineWidth(0.3); // Thinner line to stay within bounds
            pdf.rect(x + borderInset, y + borderInset, photoWidth - (2 * borderInset), photoHeight - (2 * borderInset));
            
            // Add cutting guides outside the image area (not overlapping)
            const guideLength = 2;
            const guideOffset = 0.5; // Distance from image edge
            pdf.setLineWidth(0.2);
            
            // Top-left corner guides (outside the image)
            pdf.line(x - guideOffset - guideLength, y, x - guideOffset, y);
            pdf.line(x, y - guideOffset - guideLength, x, y - guideOffset);
            
            // Top-right corner guides (outside the image)
            pdf.line(x + photoWidth + guideOffset, y - guideOffset - guideLength, x + photoWidth + guideOffset, y);
            pdf.line(x + photoWidth + guideOffset, y, x + photoWidth + guideOffset + guideLength, y);
            
            // Bottom-left corner guides (outside the image)
            pdf.line(x - guideOffset - guideLength, y + photoHeight, x - guideOffset, y + photoHeight);
            pdf.line(x, y + photoHeight + guideOffset, x, y + photoHeight + guideOffset + guideLength);
            
            // Bottom-right corner guides (outside the image)
            pdf.line(x + photoWidth + guideOffset, y + photoHeight, x + photoWidth + guideOffset + guideLength, y + photoHeight);
            pdf.line(x + photoWidth + guideOffset, y + photoHeight + guideOffset, x + photoWidth + guideOffset, y + photoHeight + guideOffset + guideLength);
            
            photoCount++;
          }
        });
        
        // Add header and footer with custom messages
        const totalPages = Math.ceil(totalPhotos / photosPerPage);
        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);
          
          // Add header
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            "Dica ~ Imprima em Papel Fotográfico para preservar suas fotos:",
            pageWidth / 2,
            8,
            { align: 'center' }
          );
          
          // Add footer with logo and text
          const footerY = pageHeight - 5;
          const logoSize = 4; // Size of the logo in mm
          
          // Add logo on the left side of footer
          pdf.addImage(logoImg, 'PNG', margin, footerY - logoSize, logoSize, logoSize);
          
          // Add footer text
          pdf.text(
            "Foto feita com amor por Bazar do Izaias! | PhotoSpace - Cada rosto merece um bom enquadramento.",
            pageWidth / 2,
            footerY,
            { align: 'center' }
          );
        }
        
        // Convert to blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      }).catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
