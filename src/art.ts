// SVG and Vector asset generators for authentic high-DPI rendering
import { ObstacleType } from './types';

export function createSvgImage(svgString: string): HTMLImageElement {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  return img;
}

// 1. High-Detail Realistic Barrento / Nelore Bull
export const bullArt = createSvgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200">
<defs>
  <radialGradient id="bullHorns" cx="50%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#fff5dc"/>
    <stop offset="70%" stop-color="#9a8160"/>
    <stop offset="100%" stop-color="#3e2a1b"/>
  </radialGradient>
  <linearGradient id="bullBody" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#d98947"/>
    <stop offset="35%" stop-color="#aa5f2f"/>
    <stop offset="80%" stop-color="#693717"/>
    <stop offset="100%" stop-color="#411f0a"/>
  </linearGradient>
  <linearGradient id="bullHump" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#eb9f58"/>
    <stop offset="100%" stop-color="#83461e"/>
  </linearGradient>
</defs>
<ellipse cx="80" cy="188" rx="46" ry="9" fill="#09121a" opacity="0.38"/>
<!-- Back Hind Legs (Left and Right) -->
<path d="M52 118 C38 132 36 156 34 176 L30 190 Q38 195 46 190 L56 152 L66 136 Z" fill="#582f14" stroke="#371c0b" stroke-width="2.5"/>
<path d="M108 118 C122 132 124 156 126 176 L130 190 Q122 195 114 190 L104 152 L94 136 Z" fill="#582f14" stroke="#371c0b" stroke-width="2.5"/>
<!-- Hooves -->
<path d="M30 186 L45 186 L44 195 Q37 198 29 193 Z" fill="#1b1d1f"/>
<path d="M115 186 L130 186 L131 193 Q123 198 116 195 Z" fill="#1b1d1f"/>
<!-- Massive Bull Torso with Dorsal Crest (Cupim de Nelore) -->
<path d="M60 110 C40 96 36 78 42 60 C48 42 62 30 80 26 C98 30 112 42 118 60 C124 78 120 96 100 110 L114 148 C108 168 96 174 80 175 C64 174 52 168 46 148 Z" fill="url(#bullBody)" stroke="#3f1e0a" stroke-width="3"/>
<!-- Cupim (Prominent Zebu hump) -->
<ellipse cx="80" cy="54" rx="22" ry="24" fill="url(#bullHump)"/>
<!-- Muscle highlights -->
<path d="M58 84 C64 68 72 62 80 62 C88 62 96 68 102 84 C94 92 88 95 80 96 C72 95 66 92 58 84 Z" fill="#eaad72" opacity="0.6"/>
<!-- Tail swinging -->
<path d="M80 155 Q83 172 88 185 Q92 192 88 198" fill="none" stroke="#48250f" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="88" cy="199" rx="5" ry="4" fill="#2c1507"/>
<!-- Ears -->
<path d="M48 74 C34 68 28 54 32 46 C40 43 50 48 56 58 Z" fill="#8d4b24" stroke="#4a240e" stroke-width="2"/>
<path d="M112 74 C126 68 132 54 128 46 C120 43 110 48 104 58 Z" fill="#8d4b24" stroke="#4a240e" stroke-width="2"/>
<!-- Formidable Sweeping Horns -->
<path d="M36 50 Q24 38 18 24 Q16 16 22 13 Q28 12 34 22 L46 42 Z" fill="url(#bullHorns)" stroke="#3e2a1b" stroke-width="2"/>
<path d="M124 50 Q136 38 142 24 Q144 16 138 13 Q132 12 126 22 L114 42 Z" fill="url(#bullHorns)" stroke="#3e2a1b" stroke-width="2"/>
<!-- Snout and Muzzle -->
<path d="M68 84 Q80 78 92 84 L96 99 Q80 110 64 99 Z" fill="#d29663"/>
<ellipse cx="73" cy="94" rx="3.5" ry="4" fill="#31190c"/>
<ellipse cx="87" cy="94" rx="3.5" ry="4" fill="#31190c"/>
<path d="M74 102 Q80 106 86 102" fill="none" stroke="#48250f" stroke-width="2.5" stroke-linecap="round"/>
</svg>`);

// 2. High-Detail Vaqueiro on Horse (Rear perspective, leather gibão, hat, spurs, tail of horse)
export const cowboyHorseArt = createSvgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 210">
<defs>
  <linearGradient id="horseCoat" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#4a2d1d"/>
    <stop offset="50%" stop-color="#2c170c"/>
    <stop offset="100%" stop-color="#140904"/>
  </linearGradient>
  <linearGradient id="gibaoCouro" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#c48a47"/>
    <stop offset="60%" stop-color="#8a5322"/>
    <stop offset="100%" stop-color="#552f10"/>
  </linearGradient>
</defs>
<ellipse cx="70" cy="198" rx="38" ry="8" fill="#081017" opacity="0.45"/>
<!-- Horse Hindquarters & Legs -->
<path d="M48 136 L38 178 L34 196 Q42 202 50 196 L62 158 L68 140 Z" fill="#201108" stroke="#120904" stroke-width="2.5"/>
<path d="M92 136 L102 178 L106 196 Q98 202 90 196 L78 158 L72 140 Z" fill="#201108" stroke="#120904" stroke-width="2.5"/>
<ellipse cx="42" cy="196" rx="6" ry="4" fill="#444"/>
<ellipse cx="98" cy="196" rx="6" ry="4" fill="#444"/>
<ellipse cx="70" cy="142" rx="34" ry="32" fill="url(#horseCoat)" stroke="#120904" stroke-width="3"/>
<!-- Horse Mane & Swishing Tail -->
<path d="M70 148 Q74 176 80 192 Q72 198 64 194 Q67 172 70 148" fill="#0a0502"/>
<!-- Saddle & Stirrups -->
<rect x="46" y="112" width="48" height="20" rx="3" fill="#693b1b" stroke="#361a09" stroke-width="2"/>
<!-- Vaqueiro Legs & Leather Guardapeitos -->
<path d="M42 98 L34 136 L44 142 L52 108 Z" fill="#75471e" stroke="#3a200a" stroke-width="2"/>
<path d="M98 98 L106 136 L96 142 L88 108 Z" fill="#75471e" stroke="#3a200a" stroke-width="2"/>
<!-- Vaqueiro Back: Gibão de Couro Tradicional -->
<path d="M46 54 L94 54 L102 104 Q70 114 38 104 Z" fill="url(#gibaoCouro)" stroke="#3e2009" stroke-width="2.5"/>
<!-- Stitched seams on gibão -->
<path d="M70 54 L70 106" fill="none" stroke="#e0be84" stroke-width="1.8" stroke-dasharray="3,3"/>
<path d="M48 76 Q70 82 92 76" fill="none" stroke="#e0be84" stroke-width="1.8" stroke-dasharray="3,3"/>
<!-- Arms: Right arm holding coiled rope and reins -->
<path d="M38 58 L24 78 L28 98 L44 88 Z" fill="url(#gibaoCouro)"/>
<path d="M102 58 L116 78 L112 98 L96 88 Z" fill="url(#gibaoCouro)"/>
<!-- Chapéu de Couro Tradicional (Half-moon brim, chin cord) -->
<ellipse cx="70" cy="38" rx="22" ry="12" fill="#7c4a1e" stroke="#3e2009" stroke-width="2.5"/>
<ellipse cx="70" cy="34" rx="14" ry="10" fill="#a46931"/>
<path d="M54 44 Q70 52 86 44" fill="none" stroke="#f0d5a4" stroke-width="2.5"/>
<!-- Coiled Lariat on Saddle -->
<ellipse cx="106" cy="100" rx="11" ry="8" fill="none" stroke="#f6d38b" stroke-width="3.5"/>
<path d="M104 106 Q112 114 118 120" fill="none" stroke="#f6d38b" stroke-width="2.5"/>
</svg>`);

// 3. Obstacle Drawing Functions
export function drawRockObstacle(ctx: CanvasRenderingContext2D, s: number) {
  ctx.save();
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-16, 8);
  ctx.lineTo(-14, -4);
  ctx.lineTo(-6, -14);
  ctx.lineTo(8, -12);
  ctx.lineTo(18, -2);
  ctx.lineTo(20, 8);
  ctx.lineTo(8, 14);
  ctx.lineTo(-10, 14);
  ctx.closePath();
  ctx.fillStyle = '#675c4c';
  ctx.fill();
  ctx.strokeStyle = '#473e31';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Granite highlight
  ctx.beginPath();
  ctx.moveTo(-10, -3);
  ctx.lineTo(-4, -11);
  ctx.lineTo(6, -10);
  ctx.lineTo(12, -2);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fillStyle = '#8f816b';
  ctx.fill();
  ctx.restore();
}

export function drawCaatingaBush(ctx: CanvasRenderingContext2D, s: number) {
  ctx.save();
  ctx.scale(s, s);
  // Mandacaru / xerophytic brush
  ctx.fillStyle = '#394e35';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#577145';
  ctx.beginPath();
  ctx.ellipse(-8, -4, 10, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#6b8953';
  ctx.beginPath();
  ctx.ellipse(4, -8, 12, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4c643e';
  ctx.beginPath();
  ctx.ellipse(12, -2, 8, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Thorns / sticks
  ctx.strokeStyle = '#32251a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-4, -16);
  ctx.moveTo(3, 2);
  ctx.lineTo(7, -18);
  ctx.stroke();
  ctx.restore();
}

export function drawConstructionBarrier(ctx: CanvasRenderingContext2D, s: number) {
  ctx.save();
  ctx.scale(s, s);
  // Heavy concrete and striped safety barrier
  ctx.fillStyle = '#ded3bc';
  ctx.strokeStyle = '#5a5448';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-22, -18, 44, 26, 3);
  ctx.fill();
  ctx.stroke();

  // Red/Orange reflective diagonal stripes
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#d34825';
  for (let i = -30; i < 30; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, -20);
    ctx.lineTo(i + 7, -20);
    ctx.lineTo(i + 1, 10);
    ctx.lineTo(i - 6, 10);
    ctx.fill();
  }
  ctx.restore();

  // Base stand feet
  ctx.fillStyle = '#383c3e';
  ctx.fillRect(-24, 6, 10, 6);
  ctx.fillRect(14, 6, 10, 6);
  ctx.restore();
}

export function drawMaintenanceTractor(ctx: CanvasRenderingContext2D, s: number) {
  ctx.save();
  ctx.scale(s, s);
  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(0, 10, 36, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 24, 38, 0.4)';
  ctx.fill();

  // CHESF service maintenance vehicle
  ctx.fillStyle = '#e5a52d'; // Yellow work vehicle
  ctx.fillRect(-28, -20, 56, 26);
  ctx.fillStyle = '#1c2e3d'; // Cabin windows
  ctx.fillRect(-12, -32, 28, 14);

  // Large industrial wheels
  ctx.fillStyle = '#222629';
  ctx.beginPath();
  ctx.ellipse(-18, 6, 8, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(18, 6, 11, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
