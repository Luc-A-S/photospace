
import jsPDF from 'jspdf';

export const generatePDF = async (imageUrl: string, quantity: number): Promise<Blob> => {
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
      
      // Photo dimensions in mm (3x4 cm)
      const photoWidth = 30;
      const photoHeight = 40;
      
      // Margins and spacing
      const margin = 10;
      const spacing = 5;
      
      // Calculate how many photos can fit per row and column
      const photosPerRow = Math.floor((pageWidth - 2 * margin + spacing) / (photoWidth + spacing));
      const photosPerCol = Math.floor((pageHeight - 2 * margin + spacing) / (photoHeight + spacing));
      const photosPerPage = photosPerRow * photosPerCol;
      
      let photoCount = 0;
      let currentPage = 1;
      
      // Load the image first
      const img = new Image();
      img.onload = () => {
        // Add photos to PDF
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
          
          // Add photo with border
          pdf.setDrawColor(200, 200, 200); // Light gray border
          pdf.setLineWidth(0.2);
          pdf.rect(x, y, photoWidth, photoHeight);
          
          // Add image
          pdf.addImage(img, 'PNG', x, y, photoWidth, photoHeight);
          
          photoCount++;
        }
        
        // Add footer with info
        const totalPages = Math.ceil(quantity / photosPerPage);
        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(
            `Página ${page}/${totalPages} - ${quantity} fotos 3x4 - gerado por Foto 3x4 Sem Fundo`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
        
        // Convert to blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for PDF generation'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
};
