import type { Puzzle } from '../types';

const SIZE = 1080;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface ShareCardLabels {
  headline: string;
  piecesSuffix: string;
  watermark: string;
}

export async function generateShareCardBlob(puzzle: Puzzle, photoUrl: string | null, labels: ShareCardLabels): Promise<Blob> {
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, '#ec6cad');
  gradient.addColorStop(1, '#8a51ae');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const photoSize = 560;
  const photoX = (SIZE - photoSize) / 2;
  const photoY = 90;

  ctx.save();
  roundedRectPath(ctx, photoX, photoY, photoSize, photoSize, 36);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(photoX, photoY, photoSize, photoSize);
  let photoDrawn = false;
  if (photoUrl) {
    try {
      const img = await loadImage(photoUrl);
      drawCover(ctx, img, photoX, photoY, photoSize, photoSize);
      photoDrawn = true;
    } catch {
      // keep the placeholder fill drawn above
    }
  }
  if (!photoDrawn) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '220px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧩', SIZE / 2, photoY + photoSize / 2);
  }
  ctx.restore();

  // Everything below the photo is laid out with a running cursor rather
  // than fixed offsets, so a 2-line puzzle name pushes the rest down
  // instead of letting the stats line overflow past the canvas edge.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let cursor = photoY + photoSize + 64;

  ctx.fillStyle = 'white';
  ctx.font = "700 38px 'Baloo 2', sans-serif";
  ctx.fillText(labels.headline, SIZE / 2, cursor);
  cursor += 58;

  ctx.font = "800 50px 'Baloo 2', sans-serif";
  const nameLines = wrapText(ctx, puzzle.name, SIZE - 160).slice(0, 2);
  for (const line of nameLines) {
    ctx.fillText(line, SIZE / 2, cursor);
    cursor += 58;
  }
  cursor += 8;

  if (puzzle.brand) {
    ctx.font = "600 30px 'Nunito', sans-serif";
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(puzzle.brand, SIZE / 2, cursor);
    cursor += 50;
  }
  cursor += 16;

  const stars = '★★★★★'.slice(0, puzzle.rating) + '☆☆☆☆☆'.slice(0, 5 - puzzle.rating);
  const statsLine = `🧩 ${puzzle.pieces} ${labels.piecesSuffix}   ⏱ ${puzzle.time}   ${stars}`;
  ctx.font = "700 34px 'Nunito', sans-serif";
  ctx.fillStyle = 'white';
  ctx.fillText(statsLine, SIZE / 2, cursor);

  ctx.font = "700 26px 'Nunito', sans-serif";
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(labels.watermark, SIZE / 2, SIZE - 48);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
