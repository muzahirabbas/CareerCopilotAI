
import { pdfjs } from 'react-pdf';
import Tesseract from 'tesseract.js';
import { ProfilePhoto } from './types';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


export async function processPdfToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += (textContent.items as any[]).map(item => item.str).join(' ') + '\n\n';
    }
    return fullText;
}

export async function processImageToText(file: File): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    return text;
}

export async function processFiles(files: File[], onProgress: (percentage: number, text: string) => void): Promise<string> {
    const textPromises = files.map(async (file, index) => {
        onProgress((index / files.length) * 100, `Processing ${file.name}...`);
        if (file.type === 'application/pdf') {
            return processPdfToText(file);
        } else if (file.type.startsWith('image/')) {
            return processImageToText(file);
        }
        return '';
    });
    const texts = await Promise.all(textPromises);
    onProgress(100, 'All files processed.');
    return texts.join('\n\n---\n\n');
}

export function fileToBase64(file: File): Promise<ProfilePhoto> {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("File is null or undefined."));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error("Failed to read file as base64 string."));
            }
            const base64Data = reader.result.split(',')[1];
            resolve({ mimeType: file.type, data: base64Data });
        };
        
        reader.onerror = error => reject(error);
    });
}

export function cleanText(text: string): string {
    // Removes non-printable characters except for standard whitespace
    return text.replace(/[^\x20-\x7E\n\r\t]/g, '');
}
