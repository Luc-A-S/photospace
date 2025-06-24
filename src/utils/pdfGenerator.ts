
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
      
      // Load all images first
      const loadPromises = images.map(image => {
        return new Promise<{ img: HTMLImageElement, quantity: number }>((resolveImg, rejectImg) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolveImg({ img, quantity: image.quantity });
          img.onerror = () => rejectImg(new Error(`Failed to load image: ${image.id}`));
          img.src = image.processedUrl || image.url;
        });
      });
      
      Promise.all(loadPromises).then(loadedImages => {
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
            
            // Add thick black border for easy cutting
            pdf.setDrawColor(0, 0, 0); // Black color
            pdf.setLineWidth(0.5); // Thicker line for visibility
            pdf.rect(x, y, photoWidth, photoHeight);
            
            // Add cutting guides (small marks at corners)
            const guideLength = 3;
            pdf.setLineWidth(0.3);
            
            // Top-left corner guides
            pdf.line(x - guideLength, y, x, y);
            pdf.line(x, y - guideLength, x, y);
            
            // Top-right corner guides
            pdf.line(x + photoWidth, y - guideLength, x + photoWidth, y);
            pdf.line(x + photoWidth, y, x + photoWidth + guideLength, y);
            
            // Bottom-left corner guides
            pdf.line(x - guideLength, y + photoHeight, x, y + photoHeight);
            pdf.line(x, y + photoHeight, x, y + photoHeight + guideLength);
            
            // Bottom-right corner guides
            pdf.line(x + photoWidth, y + photoHeight, x + photoWidth + guideLength, y + photoHeight);
            pdf.line(x + photoWidth, y + photoHeight + guideLength, x + photoWidth, y + photoHeight);
            
            photoCount++;
          }
        });
        
        // Add footer with info
        const totalPages = Math.ceil(totalPhotos / photosPerPage);
        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `Página ${page}/${totalPages} - ${totalPhotos} fotos ${photoWidth}x${photoHeight}mm - Recorte nas linhas pretas`,
            pageWidth / 2,
            pageHeight - 5,
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
