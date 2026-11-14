import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// Vite bundles this as a .js worker file, so any static host serves it correctly.
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

GlobalWorkerOptions.workerPort = new PdfWorker();

/** Rasterise a PDF blob into canvases (one per page, up to `maxPages`). */
export async function renderPages(
  blob: Blob,
  width: number,
  maxPages = Infinity,
): Promise<{ canvases: HTMLCanvasElement[]; numPages: number }> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const doc = await getDocument({ data }).promise;
  try {
    const canvases: HTMLCanvasElement[] = [];
    const count = Math.min(doc.numPages, maxPages);
    for (let n = 1; n <= count; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      canvases.push(canvas);
    }
    return { canvases, numPages: doc.numPages };
  } finally {
    await doc.destroy();
  }
}
