// Game Types & Interfaces for Boi de Fuga — Sobradinho

export type GameState = 'menu' | 'playing' | 'struggle' | 'paused' | 'result';

export type ZoneType = 'descida' | 'aproximacao' | 'crista';

export type ObstacleType = 'pedra' | 'arbusto' | 'barreira' | 'trator' | 'poça';

export interface Obstacle {
  id: number;
  at: number; // distance meter position
  x: number;  // normalized lane (-0.8 to +0.8)
  type: ObstacleType;
  width: number;
  hit: boolean;
  near: boolean;
}

export interface PlayerState {
  x: number;
  vx: number;
  speed: number;
  targetSpeed: number;
  stagger: number;
  stamina: number;
  boostCooldown: number;
  isBoosting: boolean;
  hoofStep: number;
}

export interface BullState {
  x: number;
  vx: number;
  lead: number; // meters ahead of player
  mode: 'corrida' | 'disparada' | 'zigue-zague' | 'freada' | 'coice';
  modeTime: number;
  anim: number;
  feint: number;
  stamina: number;
  targetX: number;
  hoofStep: number;
}

export interface StruggleState {
  t: number;
  pull: number;       // 0 to 1 (1 = bull downed)
  tension: number;    // 0 to 1 (1 = rope snaps)
  needle: number;     // 0 to 1
  cooldown: number;
  zoneStart: number;  // sweet spot start (e.g. 0.72)
  zoneWidth: number;  // sweet spot width (e.g. 0.18)
  wobble: number;
}

export interface Particle {
  kind: 'dust' | 'spark' | 'sweat' | 'water';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface SceneryObject {
  z: number;
  side: -1 | 1;
  offset: number;
  size: number;
  type: 'bush' | 'rock' | 'mandacaru' | 'post';
}

export interface ScoreData {
  timeFormatted: string;
  distance: number;
  ropesLeft: number;
  finalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}
