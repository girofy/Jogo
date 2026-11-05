/**
 * High-Resolution Textured Canvas & Sprite Engine for Boi de Fuga — Sobradinho
 * Ultra-detailed 60 FPS graphics, realistic textures, authentic Sobradinho geography,
 * multi-layer animated Nelore bull, and Quarto de Milha horse with vaqueiro.
 */

/*
[LAYOUT ARCHETYPE]: Mobile Arcade 2.5D Fullscreen Console
[RADIUS & BORDERS]: rounded-none to rounded (max 4px), high-contrast borders
[ACCENT LOGIC]: Bahia Golden Ochre (#F59E0B) & Rio São Francisco Deep Aqua (#0284C7)
*/

// Cache of pre-rendered high-res canvas textures for maximum 60 FPS mobile performance
const textureCache = new Map<string, HTMLCanvasElement>();

function getOrCreateCanvas(key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext('2d');
  if (ctx) {
    drawFn(ctx);
  }
  textureCache.set(key, cvs);
  return cvs;
}

// 1. BOI NELORE BARRENTO EM ALTA DEFINIÇÃO
// Frame 0-3: ciclo de galope com musculatura, cupim móvel, chifres pontiagudos e patas animadas
export function drawHighResBull(
  ctx: CanvasRenderingContext2D,
  frame: number,
  steerTilt: number,
  scale: number
) {
  const f = Math.floor(frame) % 4;

  ctx.save();
  ctx.scale(scale, scale);
  // Inclinação dinâmica ao desviar
  ctx.rotate((steerTilt * 14 * Math.PI) / 180);

  // Parâmetros de animação do galope
  const legCycle = [
    { hlY: 0, hlRot: 14, hrY: -12, hrRot: -10, flY: -8, frY: 10, cupimY: 0, tailRot: -18 },
    { hlY: 16, hlRot: -16, hrY: -6, hrRot: 8, flY: 12, frY: -14, cupimY: 5, tailRot: 12 },
    { hlY: -10, hlRot: -8, hrY: 18, hrRot: -14, flY: 16, frY: -8, cupimY: -2, tailRot: 24 },
    { hlY: -16, hlRot: 20, hrY: 10, hrRot: 12, flY: -4, frY: 8, cupimY: -5, tailRot: -8 },
  ][f];

  // 1. Sombra de contato no chão
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(0, 130, 10, 0, 130, 80);
  shadowGrad.addColorStop(0, 'rgba(11, 15, 23, 0.75)');
  shadowGrad.addColorStop(0.6, 'rgba(11, 15, 23, 0.4)');
  shadowGrad.addColorStop(1, 'rgba(11, 15, 23, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 130, 75, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Patas Traseiras
  // Pata Traseira Esquerda
  ctx.save();
  ctx.translate(-38, 50 + legCycle.hlY);
  ctx.rotate((legCycle.hlRot * Math.PI) / 180);
  ctx.fillStyle = '#6b2d0c';
  ctx.strokeStyle = '#351603';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, 30, -18, 65);
  ctx.lineTo(-12, 75);
  ctx.lineTo(8, 75);
  ctx.quadraticCurveTo(14, 40, 12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Casco
  ctx.fillStyle = '#1c1511';
  ctx.fillRect(-12, 70, 20, 8);
  ctx.restore();

  // Pata Traseira Direita
  ctx.save();
  ctx.translate(38, 50 + legCycle.hrY);
  ctx.rotate((legCycle.hrRot * Math.PI) / 180);
  ctx.fillStyle = '#6b2d0c';
  ctx.strokeStyle = '#351603';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, 30, 18, 65);
  ctx.lineTo(12, 75);
  ctx.lineTo(-8, 75);
  ctx.quadraticCurveTo(-14, 40, -12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Casco
  ctx.fillStyle = '#1c1511';
  ctx.fillRect(-8, 70, 20, 8);
  ctx.restore();

  // 3. Patas Dianteiras
  // Dianteira Esquerda
  ctx.save();
  ctx.translate(-24, 42 + legCycle.flY);
  ctx.fillStyle = '#542207';
  ctx.strokeStyle = '#2b1002';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, 65);
  ctx.lineTo(8, 65);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#18110c';
  ctx.fillRect(-8, 60, 16, 7);
  ctx.restore();

  // Dianteira Direita
  ctx.save();
  ctx.translate(24, 42 + legCycle.frY);
  ctx.fillStyle = '#542207';
  ctx.strokeStyle = '#2b1002';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(8, 65);
  ctx.lineTo(-8, 65);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#18110c';
  ctx.fillRect(-8, 60, 16, 7);
  ctx.restore();

  // 4. Dorso & Tronco Musculoso do Nelore
  const bodyGrad = ctx.createLinearGradient(-50, -40, 50, 80);
  bodyGrad.addColorStop(0, '#d97706'); // Ocre dourado barrento
  bodyGrad.addColorStop(0.3, '#b45309');
  bodyGrad.addColorStop(0.7, '#78350f');
  bodyGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#2d1102';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-35, 45);
  ctx.bezierCurveTo(-65, 25, -60, -35, -40, -60);
  ctx.bezierCurveTo(-20, -80, 20, -80, 40, -60);
  ctx.bezierCurveTo(60, -35, 65, 25, 35, 45);
  ctx.bezierCurveTo(45, 80, 30, 110, 0, 112);
  ctx.bezierCurveTo(-30, 110, -45, 80, -35, 45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Destaque muscular das costelas e ancas
  ctx.save();
  const muscleGrad = ctx.createRadialGradient(0, -10, 5, 0, -10, 45);
  muscleGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
  muscleGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = muscleGrad;
  ctx.beginPath();
  ctx.ellipse(0, -10, 36, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Cupim Gigante de Zebu / Nelore (Balança com a corrida)
  ctx.save();
  ctx.translate(0, -68 + legCycle.cupimY);
  const cupimGrad = ctx.createRadialGradient(0, -8, 6, 0, 0, 38);
  cupimGrad.addColorStop(0, '#f59e0b');
  cupimGrad.addColorStop(0.4, '#b45309');
  cupimGrad.addColorStop(1, '#5a2306');
  ctx.fillStyle = cupimGrad;
  ctx.strokeStyle = '#351603';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Brilho solar no cupim
  ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, -10, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Rabo Animado com Vassoura de Pelos
  ctx.save();
  ctx.translate(0, 95);
  ctx.rotate((legCycle.tailRot * Math.PI) / 180);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 25, 14, 45);
  ctx.stroke();
  // Vassoura preta do rabo
  ctx.fillStyle = '#1c0b02';
  ctx.beginPath();
  ctx.ellipse(14, 45, 12, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 7. Orelhas e Chifres em Arco da Raça Nelore
  // Orelha esquerda
  ctx.fillStyle = '#b45309';
  ctx.strokeStyle = '#3b1502';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(-48, -48, 18, 9, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Orelha direita
  ctx.beginPath();
  ctx.ellipse(48, -48, 18, 9, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Chifre Esquerdo
  const hornGrad = ctx.createLinearGradient(-60, -90, -20, -50);
  hornGrad.addColorStop(0, '#fffbeb');
  hornGrad.addColorStop(0.35, '#d4b483');
  hornGrad.addColorStop(0.8, '#583113');
  hornGrad.addColorStop(1, '#1c0b02');
  ctx.fillStyle = hornGrad;
  ctx.strokeStyle = '#2b1404';
  ctx.lineWidth = 2.8;

  ctx.beginPath();
  ctx.moveTo(-28, -60);
  ctx.quadraticCurveTo(-55, -85, -68, -112);
  ctx.quadraticCurveTo(-50, -100, -38, -80);
  ctx.lineTo(-20, -55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Chifre Direito
  ctx.beginPath();
  ctx.moveTo(28, -60);
  ctx.quadraticCurveTo(55, -85, 68, -112);
  ctx.quadraticCurveTo(50, -100, 38, -80);
  ctx.lineTo(20, -55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 8. Focinho e Cabeça do Boi Nelore
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#3b1502';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -32, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Narinas soltando vapor
  ctx.fillStyle = '#1c0b02';
  ctx.beginPath();
  ctx.ellipse(-9, -32, 5, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(9, -32, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2. CAVALO QUARTO DE MILHA COM VAQUEIRO SERTANEJO EM ALTA DEFINIÇÃO
export function drawHighResHorseRider(
  ctx: CanvasRenderingContext2D,
  frame: number,
  steerTilt: number,
  isLassoSpinning: boolean,
  scale: number
) {
  const f = Math.floor(frame) % 4;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.rotate((steerTilt * 12 * Math.PI) / 180);

  const bob = [-4, 6, 2, -5][f];
  const legL = [16, -14, -4, 8][f];
  const legR = [-14, 16, 8, -10][f];
  const tailRot = Math.cos(frame * 2.2) * 16;
  const lassoSpin = (frame * 45) % 360;

  // 1. Sombra no chão
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(0, 145, 10, 0, 145, 85);
  shadowGrad.addColorStop(0, 'rgba(11, 15, 23, 0.7)');
  shadowGrad.addColorStop(0.6, 'rgba(11, 15, 23, 0.35)');
  shadowGrad.addColorStop(1, 'rgba(11, 15, 23, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 145, 80, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.translate(0, bob);

  // 2. Patas Traseiras do Quarto de Milha
  // Pata Esquerda
  ctx.save();
  ctx.translate(-42, 60 + legL);
  ctx.fillStyle = '#3a1805';
  ctx.strokeStyle = '#1a0b02';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, 45);
  ctx.lineTo(-10, 75);
  ctx.lineTo(8, 75);
  ctx.lineTo(12, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Ferradura metálica
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-10, 70, 18, 6);
  ctx.restore();

  // Pata Direita
  ctx.save();
  ctx.translate(42, 60 + legR);
  ctx.fillStyle = '#3a1805';
  ctx.strokeStyle = '#1a0b02';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, 45);
  ctx.lineTo(10, 75);
  ctx.lineTo(-8, 75);
  ctx.lineTo(-12, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-8, 70, 18, 6);
  ctx.restore();

  // 3. Garupa Musculosa do Cavalo Alazão
  const horseGrad = ctx.createLinearGradient(-55, -20, 55, 90);
  horseGrad.addColorStop(0, '#78350f');
  horseGrad.addColorStop(0.4, '#451a03');
  horseGrad.addColorStop(1, '#1f0a01');
  ctx.fillStyle = horseGrad;
  ctx.strokeStyle = '#170801';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 65, 56, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rabo do Cavalo
  ctx.save();
  ctx.translate(0, 85);
  ctx.rotate((tailRot * Math.PI) / 180);
  ctx.fillStyle = '#0d0401';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(16, 40, 24, 75);
  ctx.quadraticCurveTo(0, 78, -12, 65);
  ctx.quadraticCurveTo(4, 35, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4. Sela Sertaneja de Vaquejada
  ctx.fillStyle = '#b45309';
  ctx.strokeStyle = '#2d1002';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-42, 22, 84, 32, 4);
  ctx.fill();
  ctx.stroke();

  // Estribos de Aço
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-45, 88, 12, 8);
  ctx.fillRect(33, 88, 12, 8);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(-45, 88, 12, 8);
  ctx.strokeRect(33, 88, 12, 8);

  // 5. O Vaqueiro Sertanejo (Gibão e Perneiras de Couro)
  // Perneiras
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = '#3b1502';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-36, 15);
  ctx.lineTo(-44, 60);
  ctx.lineTo(-30, 68);
  ctx.lineTo(-24, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(36, 15);
  ctx.lineTo(44, 60);
  ctx.lineTo(30, 68);
  ctx.lineTo(24, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gibão de Couro de Bode Tradicional
  const gibaoGrad = ctx.createLinearGradient(-35, -50, 35, 15);
  gibaoGrad.addColorStop(0, '#d97706');
  gibaoGrad.addColorStop(0.5, '#92400e');
  gibaoGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = gibaoGrad;
  ctx.strokeStyle = '#381602';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-36, -55, 72, 70, 4);
  ctx.fill();
  ctx.stroke();

  // Pesponto bordado artesanal do gibão
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(0, -55);
  ctx.lineTo(0, 15);
  ctx.moveTo(-34, -20);
  ctx.lineTo(34, -20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Braço Esquerdo (Segurando as rédeas)
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = '#381602';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, -45);
  ctx.lineTo(-52, -15);
  ctx.lineTo(-46, 5);
  ctx.lineTo(-28, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Braço Direito (Comanda o laço)
  ctx.beginPath();
  ctx.moveTo(34, -45);
  ctx.lineTo(54, -18);
  ctx.lineTo(48, 5);
  ctx.lineTo(28, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Chapéu de Couro Sertanejo (Aba Meia-Lua)
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = '#381602';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, -78, 38, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Copa do chapéu
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(0, -86, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Barbicacho no queixo
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -70, 18, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 6. Laço em Rotação 3D Overhead
  if (isLassoSpinning) {
    ctx.save();
    ctx.translate(56, -45);
    ctx.rotate((lassoSpin * Math.PI) / 180);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4.5;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Chumbada / ponta do laço
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(34, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Laço enrolado na sela
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(45, 10, 18, 12, 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// 3. CENÁRIO DE SOBRADINHO — PANORAMA REALISTA EM ALTA RESOLUÇÃO
// - Céu sertanejo radiante
// - Morro do Cruzeiro de Sobradinho com antena e sinalizador
// - Paredão de concreto da Usina Hidrelétrica CHESF
// - Pórtico Rolante Amarelo da CHESF
// - Espuma do Vertedouro caindo nas águas do São Francisco
// - Reservatório azul-turquesa infinito com boia amarela
// - Enrocamento de pedras e torres de alta tensão
export function drawSobradinhoDamHorizonHD(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  scrollDistance: number
) {
  const horizonY = H * 0.38;

  // Céu Sertanejo Radiante
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#0284c7');
  skyGrad.addColorStop(0.4, '#38bdf8');
  skyGrad.addColorStop(0.8, '#fde68a');
  skyGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, horizonY);

  // Sol Gigante da Caatinga
  const sunX = W * 0.82;
  const sunY = H * 0.13;
  const sunRadius = Math.min(W, H) * 0.08;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, sunRadius * 2.5);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.25, '#fef08a');
  sunGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.4)');
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Nuvens cirrus no horizonte
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(W * 0.25, H * 0.16, W * 0.14, H * 0.02, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.58, H * 0.11, W * 0.18, H * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. O MORRO DO CRUZEIRO (Serra do Cruzeiro de Sobradinho)
  // Conforme fotos reais: platô no cume, escarpa vulcânica escura e antena de transmissão
  const cruzeiroBaseX = W * 0.28;
  const cruzeiroW = Math.max(160, W * 0.24);
  const cruzeiroH = Math.max(70, H * 0.18);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cruzeiroBaseX - cruzeiroW * 0.55, horizonY);
  ctx.lineTo(cruzeiroBaseX - cruzeiroW * 0.38, horizonY - cruzeiroH * 0.35);
  ctx.lineTo(cruzeiroBaseX - cruzeiroW * 0.22, horizonY - cruzeiroH * 0.85);
  // Platô de topo reto
  ctx.lineTo(cruzeiroBaseX - cruzeiroW * 0.12, horizonY - cruzeiroH);
  ctx.lineTo(cruzeiroBaseX + cruzeiroW * 0.18, horizonY - cruzeiroH * 0.98);
  ctx.lineTo(cruzeiroBaseX + cruzeiroW * 0.36, horizonY - cruzeiroH * 0.45);
  ctx.lineTo(cruzeiroBaseX + cruzeiroW * 0.58, horizonY);
  ctx.closePath();

  const morroGrad = ctx.createLinearGradient(0, horizonY - cruzeiroH, 0, horizonY);
  morroGrad.addColorStop(0, '#0f172a');
  morroGrad.addColorStop(0.5, '#1e293b');
  morroGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = morroGrad;
  ctx.fill();

  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Textura rochosa no morro
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const rx = cruzeiroBaseX - cruzeiroW * 0.3 + i * (cruzeiroW * 0.07);
    const ry = horizonY - cruzeiroH * 0.7 + (i % 3) * 12;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 15, ry + 25);
    ctx.stroke();
  }

  // Antena de Rádio / Cruzeiro no topo da serra
  const mastX = cruzeiroBaseX + cruzeiroW * 0.02;
  const mastY = horizonY - cruzeiroH;
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(mastX, mastY);
  ctx.lineTo(mastX, mastY - 30);
  ctx.moveTo(mastX - 8, mastY - 20);
  ctx.lineTo(mastX + 8, mastY - 20);
  ctx.moveTo(mastX - 5, mastY - 12);
  ctx.lineTo(mastX + 5, mastY - 12);
  ctx.stroke();

  // Luz vermelha intermitente de segurança aeronáutica
  const beaconOn = Math.sin(Date.now() * 0.007) > 0;
  ctx.fillStyle = beaconOn ? '#ef4444' : '#7f1d1d';
  ctx.beginPath();
  ctx.arc(mastX, mastY - 31, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. O LAGO ARTIFICIAL DE SOBRADINHO (Águas cristalinas do Rio São Francisco)
  const waterGrad = ctx.createLinearGradient(0, horizonY - 12, 0, H * 0.75);
  waterGrad.addColorStop(0, '#0284c7');
  waterGrad.addColorStop(0.45, '#0ea5e9');
  waterGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = waterGrad;

  ctx.beginPath();
  ctx.moveTo(0, horizonY - 10);
  ctx.lineTo(W * 0.44, horizonY - 10);
  ctx.lineTo(W * 0.38, H * 0.85);
  ctx.lineTo(0, H * 0.85);
  ctx.closePath();
  ctx.fill();

  // Reflexos e ondas na água do lago
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 18; i++) {
    const lineY = horizonY + i * 14;
    const lineX = (i * 36 + scrollDistance * 0.28) % (W * 0.34);
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + 32 + (i % 3) * 14, lineY);
    ctx.stroke();
  }

  // Boia Náutica de Sinalização Amarela
  const buoyX = W * 0.22;
  const buoyY = horizonY + 30 + Math.sin(Date.now() * 0.0035) * 3;
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(buoyX, buoyY - 16);
  ctx.lineTo(buoyX + 9, buoyY);
  ctx.lineTo(buoyX - 9, buoyY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. ESTRUTURA MONUMENTAL DA BARRAGEM DE SOBRADINHO (CHESF)
  const damStartX = W * 0.42;
  const damWidth = W * 0.58;
  const damTopY = horizonY - 48;

  // Corpo de concreto armado
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(damStartX, damTopY, damWidth, 48);

  // Pilares do Vertedouro e Comportas
  const pilarCount = 12;
  const pilarWidth = damWidth / (pilarCount * 1.3);
  for (let i = 0; i < pilarCount; i++) {
    const px = damStartX + 12 + i * (damWidth / pilarCount);
    // Face ensolarada dourada
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px, damTopY + 6, pilarWidth * 0.6, 42);
    // Face sombreada
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + pilarWidth * 0.6, damTopY + 6, pilarWidth * 0.4, 42);
    // Comporta aberta com água revolta
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px + pilarWidth, damTopY + 20, damWidth / pilarCount - pilarWidth, 28);
    // Espuma branca volumétrica caindo do vertedouro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + pilarWidth + 1, damTopY + 36, damWidth / pilarCount - pilarWidth - 2, 12);
  }

  // 4. PÓRTICO ROLANTE AMARELO DA CHESF (Guindaste Monumental)
  const craneX = damStartX + damWidth * 0.26;
  const craneY = damTopY;
  const craneW = Math.max(54, W * 0.085);
  const craneH = 42;

  ctx.save();
  ctx.fillStyle = '#eab308'; // Amarelo industrial
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 2.5;

  // Pernas em A do pórtico
  ctx.fillRect(craneX, craneY - craneH, 8, craneH);
  ctx.fillRect(craneX + craneW - 8, craneY - craneH, 8, craneH);
  // Viga superior
  ctx.fillRect(craneX - 4, craneY - craneH - 6, craneW + 8, 9);
  // Cabine vermelha de içamento
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(craneX + craneW * 0.42, craneY - craneH - 16, 18, 10);
  // Cabos de içamento
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(craneX + craneW * 0.51, craneY - craneH - 6);
  ctx.lineTo(craneX + craneW * 0.51, craneY - craneH + 18);
  ctx.stroke();
  ctx.restore();

  // 5. ENROCAMENTO DE PEDRAS (Talude de blocos de granito)
  for (let i = 0; i < 35; i++) {
    const rx = damStartX - 25 + i * (W * 0.018);
    const ry = horizonY - 4 + (i % 3) * 3;
    const rSize = 6 + (i % 4) * 3;
    ctx.fillStyle = i % 2 === 0 ? '#64748b' : '#475569';
    ctx.fillRect(rx, ry, rSize, rSize * 0.7);
  }

  // 6. TORRES DE TRANSMISSÃO DE ALTA TENSÃO DA CHESF
  drawHighVoltageTower(ctx, W * 0.16, horizonY - 86, 1.0);
  drawHighVoltageTower(ctx, W * 0.88, horizonY - 78, 0.88);
}

function drawHighVoltageTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.2;

  // Treliça em pirâmide
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-24, 86);
  ctx.moveTo(0, 0);
  ctx.lineTo(24, 86);

  // Cruzetas
  ctx.moveTo(-34, 24);
  ctx.lineTo(34, 24);
  ctx.moveTo(-44, 46);
  ctx.lineTo(44, 46);
  ctx.moveTo(-22, 68);
  ctx.lineTo(22, 68);

  // X de travamento
  ctx.moveTo(-16, 24);
  ctx.lineTo(16, 46);
  ctx.moveTo(16, 24);
  ctx.lineTo(-16, 46);
  ctx.stroke();

  // Cabos de alta tensão
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-44, 46);
  ctx.quadraticCurveTo(-120, 70, -240, 32);
  ctx.moveTo(44, 46);
  ctx.quadraticCurveTo(120, 70, 240, 32);
  ctx.stroke();

  ctx.restore();
}

// 4. OBSTÁCULOS ILUSTRADOS EM ALTA DEFINIÇÃO
export function drawMandacaruHD(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);

  ctx.fillStyle = '#15803d';
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 3;

  // Tronco
  ctx.beginPath();
  ctx.roundRect(-12, -58, 24, 64, 4);
  ctx.fill();
  ctx.stroke();

  // Braço Esquerdo
  ctx.beginPath();
  ctx.moveTo(-12, -30);
  ctx.lineTo(-30, -30);
  ctx.lineTo(-30, -54);
  ctx.lineTo(-19, -54);
  ctx.lineTo(-19, -20);
  ctx.lineTo(-12, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Braço Direito
  ctx.beginPath();
  ctx.moveTo(12, -36);
  ctx.lineTo(30, -36);
  ctx.lineTo(30, -64);
  ctx.lineTo(19, -64);
  ctx.lineTo(19, -26);
  ctx.lineTo(12, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Espinhos dourados
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.2;
  for (let y = -52; y < 0; y += 10) {
    ctx.beginPath();
    ctx.moveTo(-15, y);
    ctx.lineTo(-22, y - 2);
    ctx.moveTo(15, y);
    ctx.lineTo(22, y - 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGraniteBoulderHD(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);

  // Sombra
  ctx.beginPath();
  ctx.ellipse(0, 6, 32, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();

  // Rocha
  ctx.beginPath();
  ctx.moveTo(-28, 2);
  ctx.lineTo(-24, -18);
  ctx.lineTo(-12, -32);
  ctx.lineTo(16, -30);
  ctx.lineTo(30, -14);
  ctx.lineTo(28, 4);
  ctx.lineTo(10, 14);
  ctx.lineTo(-22, 12);
  ctx.closePath();

  const rockGrad = ctx.createLinearGradient(-24, -32, 24, 14);
  rockGrad.addColorStop(0, '#94a3b8');
  rockGrad.addColorStop(0.45, '#64748b');
  rockGrad.addColorStop(1, '#334155');
  ctx.fillStyle = rockGrad;
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.2;
  ctx.stroke();

  // Fissuras de sol
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -24);
  ctx.lineTo(-4, -10);
  ctx.lineTo(8, -8);
  ctx.stroke();
  ctx.restore();
}

export function drawRoadBlockadeHD(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);

  // Cavalete CHESF
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.roundRect(-32, -28, 64, 32, 2);
  ctx.fill();
  ctx.stroke();

  // Listras Laranja Segurança
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#ea580c';
  for (let i = -48; i < 48; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, -34);
    ctx.lineTo(i + 14, -34);
    ctx.lineTo(i + 4, 14);
    ctx.lineTo(i - 10, 14);
    ctx.fill();
  }
  ctx.restore();

  // Pés pretos
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-28, 4, 9, 12);
  ctx.fillRect(19, 4, 9, 12);
  ctx.restore();
}
