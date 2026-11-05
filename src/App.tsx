/**
 * Boi de Fuga — Sobradinho (Produção 3D Real com Three.js)
 * Real-time 3D chase game along the CHESF dam crest in Sobradinho, Bahia.
 * Third-person chase camera, forward-running Nelore bull, animated horse rider,
 * floating touch joystick, slow-motion lasso bullet time, and authentic Gemini 3.8 Flash TTS.
 */

/*
[LAYOUT ARCHETYPE]: Mobile Arcade 2.5D Fullscreen Console
[RADIUS & BORDERS]: rounded-none to rounded (max 4px), high-contrast borders
[ACCENT LOGIC]: Bahia Golden Ochre (#F59E0B) & Rio São Francisco Deep Aqua (#0284C7)
*/

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from './soundEngine';
import { speakNarrator } from './narrator';
import {
  createGameMaterials,
  createBullModel3D,
  createHorseRiderModel3D,
  createDamEnvironment3D,
  createObstacle3D,
  animateBullModel,
  animateHorseRiderModel,
  BullModelRef,
  HorseRiderModelRef,
  DamEnvironmentRef,
} from './models3d';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Target,
  Trophy,
  HelpCircle,
  X,
  Compass,
  Flame,
} from 'lucide-react';

interface ObstacleEntity {
  id: number;
  z: number;
  laneX: number;
  type: 'mandacaru' | 'pedra' | 'cavalete';
  mesh: THREE.Group;
  hit: boolean;
  near: boolean;
}

interface FloatingScore {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

const TOTAL_COURSE_METERS = 1500;
const ROAD_HALF_WIDTH = 4.8;

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // High-level Game States
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'struggle' | 'result'>('menu');
  const [meters, setMeters] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [ropes, setRopes] = useState(3);
  const [speedKmh, setSpeedKmh] = useState(55);
  const [stamina, setStamina] = useState(1.0);
  const [currentZone, setCurrentZone] = useState<'descida' | 'subestacao' | 'crista'>('descida');
  const [bullDistanceMeters, setBullDistanceMeters] = useState(48);
  const [isLassoLockOn, setIsLassoLockOn] = useState(false);
  const [isBulletTime, setIsBulletTime] = useState(false);

  // Struggle Minigame State
  const [strugglePull, setStrugglePull] = useState(0);
  const [struggleTension, setStruggleTension] = useState(0.2);
  const [struggleNeedle, setStruggleNeedle] = useState(0.5);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('bdf_recorde_3d_sobradinho') || 0);
    } catch {
      return 0;
    }
  });

  // Floating Virtual Touch Joystick state
  const [touchStickActive, setTouchStickActive] = useState(false);
  const [touchStickPos, setTouchStickPos] = useState<{ x: number; y: number } | null>(null);
  const [touchStickKnob, setTouchStickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Result dialog data
  const [resultData, setResultData] = useState<{
    victory: boolean;
    score: number;
    time: string;
    distance: number;
    ropesLeft: number;
    maxCombo: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
  } | null>(null);

  // Engine state preserved in ref for high-frequency 60 FPS Three.js loop
  const engine = useRef({
    state: 'menu' as 'menu' | 'playing' | 'struggle' | 'result',
    distance: 0,
    time: 0,
    score: 0,
    combo: 1,
    maxCombo: 1,
    ropes: 3,
    steerInput: 0,
    boostActive: false,
    boostCooldown: 0,
    bulletTimeDuration: 0,
    shake: 0,
    player: {
      x: 0,
      z: 0,
      vx: 0,
      speed: 16.5,
      stamina: 1.0,
      stagger: 0,
    },
    bull: {
      x: 0.2,
      z: -48,
      vx: 0,
      lead: 48,
      mode: 'corrida' as 'corrida' | 'arrancada' | 'zigue' | 'freada',
      modeTimer: 2.0,
      targetX: 0.2,
    },
    struggle: {
      t: 0,
      pull: 0,
      tension: 0.2,
      needle: 0.5,
      sweetSpotMin: 0.65,
      sweetSpotMax: 0.88,
    },
    obstacles: [] as ObstacleEntity[],
    lastFrame: performance.now(),
    accumulator: 0,
    lastNearShout: 0,
    enteredDamZone: false,
  });

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  // Floating score popup helper
  const addScorePopup = useCallback((text: string, color: string = '#F59E0B') => {
    const id = Date.now() + Math.random();
    const x = window.innerWidth * 0.5 + (Math.random() - 0.5) * 80;
    const y = window.innerHeight * 0.42;
    setFloatingScores((prev) => [...prev, { id, text, x, y, color }]);

    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

  // Haptic feedback for mobile
  const triggerHaptic = useCallback((pattern: number | number[]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {}
  }, []);

  // Three.js References
  const threeRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    bullModel: BullModelRef;
    horseModel: HorseRiderModelRef;
    damEnv: DamEnvironmentRef;
    ropeLine: THREE.Line;
    mats: ReturnType<typeof createGameMaterials>;
  } | null>(null);

  // Inicialização da Pista de Obstáculos 3D
  const initTrack3D = useCallback((scene: THREE.Scene, mats: ReturnType<typeof createGameMaterials>) => {
    // Remove obstáculos anteriores
    engine.current.obstacles.forEach((obs) => {
      scene.remove(obs.mesh);
    });

    const obstacles: ObstacleEntity[] = [];
    let d = 80;
    let id = 1;
    let prevLane = 0;

    while (d < TOTAL_COURSE_METERS - 50) {
      let lane = (Math.random() * 2 - 1) * (ROAD_HALF_WIDTH * 0.7);
      if (Math.abs(lane - prevLane) < 1.8) {
        lane = Math.max(-ROAD_HALF_WIDTH * 0.75, Math.min(ROAD_HALF_WIDTH * 0.75, lane + (Math.random() > 0.5 ? 2.5 : -2.5)));
      }
      prevLane = lane;

      let type: 'mandacaru' | 'pedra' | 'cavalete';
      if (d < 500) {
        type = Math.random() > 0.45 ? 'mandacaru' : 'pedra';
      } else if (d < 900) {
        const r = Math.random();
        type = r < 0.4 ? 'cavalete' : r < 0.7 ? 'pedra' : 'mandacaru';
      } else {
        type = Math.random() > 0.35 ? 'cavalete' : 'pedra';
      }

      const mesh = createObstacle3D(type, mats);
      mesh.position.set(lane, 0, -d);
      scene.add(mesh);

      obstacles.push({
        id: id++,
        z: -d,
        laneX: lane,
        type,
        mesh,
        hit: false,
        near: false,
      });

      d += 35 + Math.random() * 25;
    }

    engine.current.obstacles = obstacles;
  }, []);

  // Iniciar Nova Corrida 3D
  const handleStart = useCallback(() => {
    sound.init();
    sound.resume();

    const e = engine.current;
    e.state = 'playing';
    e.distance = 0;
    e.time = 0;
    e.score = 0;
    e.combo = 1;
    e.maxCombo = 1;
    e.ropes = 3;
    e.shake = 0;
    e.boostActive = false;
    e.boostCooldown = 0;
    e.bulletTimeDuration = 0;
    e.lastNearShout = 0;
    e.enteredDamZone = false;

    e.player = {
      x: 0,
      z: 0,
      vx: 0,
      speed: 16.5,
      stamina: 1.0,
      stagger: 0,
    };

    e.bull = {
      x: 0.2,
      z: -48,
      vx: 0,
      lead: 48,
      mode: 'corrida',
      modeTimer: 2.0,
      targetX: 0.2,
    };

    e.struggle = {
      t: 0,
      pull: 0,
      tension: 0.2,
      needle: 0.5,
      sweetSpotMin: 0.65,
      sweetSpotMax: 0.88,
    };

    if (threeRefs.current) {
      initTrack3D(threeRefs.current.scene, threeRefs.current.mats);
      threeRefs.current.ropeLine.visible = false;
    }

    setGameState('playing');
    setMeters(0);
    setScore(0);
    setCombo(1);
    setRopes(3);
    setStamina(1.0);
    setCurrentZone('descida');
    setStrugglePull(0);
    setStruggleTension(0.2);
    setBullDistanceMeters(48);
    setIsLassoLockOn(false);
    setIsBulletTime(false);

    showToast('GALOPE LIBERADO! ALCANCE O BOI NA BARRAGEM!');
    triggerHaptic([40, 60, 40]);
    speakNarrator('start', true);
  }, [initTrack3D, showToast, triggerHaptic]);

  // Ação de Laçar ou Puxar
  const handleAction = useCallback(() => {
    sound.init();
    sound.resume();
    const e = engine.current;

    // 1. Minigame: Puxada de Corda
    if (e.state === 'struggle') {
      const needle = e.struggle.needle;
      const isGoodHit = needle >= e.struggle.sweetSpotMin && needle <= e.struggle.sweetSpotMax;

      if (isGoodHit) {
        e.struggle.pull = Math.min(1.0, e.struggle.pull + 0.24);
        e.struggle.tension = Math.max(0.08, e.struggle.tension - 0.14);
        const gain = 500 * e.combo;
        e.score += gain;
        e.combo = Math.min(8, e.combo + 1);
        if (e.combo > e.maxCombo) e.maxCombo = e.combo;

        sound.playTensionStrum(true);
        sound.playWhipCrack();
        triggerHaptic(60);
        addScorePopup(`+${gain} (${e.combo}x COMBO!)`, '#22C55E');
        showToast('PUXADA PERFEITA!');
      } else {
        e.struggle.pull = Math.max(0, e.struggle.pull - 0.06);
        e.struggle.tension = Math.min(1.0, e.struggle.tension + 0.22);
        e.combo = 1;
        e.shake = 0.35;
        sound.playTensionStrum(false);
        sound.playBullSnort();
        triggerHaptic([80, 50, 80]);
        showToast('TENSÃO ALTA! CUIDADO COM A CORDA!');
      }

      setScore(e.score);
      setCombo(e.combo);
      setStrugglePull(e.struggle.pull);
      setStruggleTension(e.struggle.tension);

      // Vitória: Boi Derrubado
      if (e.struggle.pull >= 1.0) {
        sound.playBerranteHorn();
        e.state = 'result';
        setGameState('result');
        triggerHaptic([100, 80, 100, 120, 200]);

        if (threeRefs.current) {
          threeRefs.current.ropeLine.visible = false;
        }

        const finalScore = Math.max(0, Math.round(15000 - e.time * 20 + e.ropes * 800 + e.maxCombo * 600));
        if (finalScore > highScore) {
          setHighScore(finalScore);
          try {
            localStorage.setItem('bdf_recorde_3d_sobradinho', String(finalScore));
          } catch {}
        }

        const m = Math.floor(e.time / 60);
        const s = Math.floor(e.time % 60);
        const grade: 'S' | 'A' | 'B' | 'C' =
          finalScore >= 14000 ? 'S' : finalScore >= 11000 ? 'A' : finalScore >= 8000 ? 'B' : 'C';

        setResultData({
          victory: true,
          score: finalScore,
          time: `${m}:${String(s).padStart(2, '0')}`,
          distance: Math.floor(e.distance),
          ropesLeft: e.ropes,
          maxCombo: e.maxCombo,
          grade,
        });

        speakNarrator('victory', true);
        return;
      }

      // Derrota por estouro da corda
      if (e.struggle.tension >= 1.0) {
        sound.playStumble();
        e.state = 'playing';
        setGameState('playing');
        e.bull.lead = Math.min(65, e.bull.lead + 22);
        e.bull.z = e.player.z - e.bull.lead;
        e.shake = 0.55;
        triggerHaptic([120, 60, 120]);
        showToast('A CORDA ESTOUROU!');

        if (threeRefs.current) {
          threeRefs.current.ropeLine.visible = false;
        }

        if (e.ropes <= 0) {
          setTimeout(() => {
            if (e.state === 'playing') {
              e.state = 'result';
              setGameState('result');
              setResultData({
                victory: false,
                score: 500,
                time: `${Math.floor(e.time / 60)}:${String(Math.floor(e.time % 60)).padStart(2, '0')}`,
                distance: Math.floor(e.distance),
                ropesLeft: 0,
                maxCombo: e.maxCombo,
                grade: 'D',
              });
              speakNarrator('escaped', true);
            }
          }, 1100);
        }
      }
      return;
    }

    if (e.state !== 'playing') return;

    if (e.ropes <= 0) {
      showToast('SEM LAÇOS RESTANTES!');
      return;
    }

    // 2. Lançamento do Laço (Com Bullet Time)
    sound.playLassoThrow();
    e.ropes--;
    setRopes(e.ropes);

    e.bulletTimeDuration = 0.85;
    setIsBulletTime(true);

    const lead = e.bull.lead;
    const lateralDiff = Math.abs(e.player.x - e.bull.x);

    // Condição de acerto no boi
    if (lead >= 3.5 && lead <= 18.5 && lateralDiff <= 1.8) {
      sound.playLassoCatch();
      sound.playBullSnort();
      e.state = 'struggle';
      e.struggle = {
        t: 0,
        pull: 0.18,
        tension: 0.22,
        needle: 0.5,
        sweetSpotMin: 0.65,
        sweetSpotMax: 0.88,
      };
      setGameState('struggle');
      setStrugglePull(0.18);
      setStruggleTension(0.22);
      triggerHaptic([80, 40, 100]);
      addScorePopup('+1000 LAÇO NO CHIFRE!', '#F59E0B');
      showToast('LAÇADO NO CHIFRE! PUXE AGORA!');
      speakNarrator('lassoCaught', true);

      if (threeRefs.current) {
        threeRefs.current.ropeLine.visible = true;
      }
    } else {
      e.shake = 0.25;
      triggerHaptic(40);
      e.combo = 1;
      setCombo(1);
      if (lead > 18.5) {
        showToast('MUITO LONGE! CHEGUE MAIS PERTO DO BOI.');
      } else if (lead < 3.5) {
        showToast('EM CIMA DEMAIS! O BOI RECUOU.');
      } else {
        showToast('DESALINHADO! MIRE RETO NA TRAJETÓRIA.');
      }

      if (e.ropes === 0) {
        setTimeout(() => {
          if (e.state === 'playing') {
            e.state = 'result';
            setGameState('result');
            setResultData({
              victory: false,
              score: 400,
              time: `${Math.floor(e.time / 60)}:${String(Math.floor(e.time % 60)).padStart(2, '0')}`,
              distance: Math.floor(e.distance),
              ropesLeft: 0,
              maxCombo: e.maxCombo,
              grade: 'D',
            });
            speakNarrator('escaped', true);
          }
        }, 1200);
      }
    }
  }, [addScorePopup, highScore, showToast, triggerHaptic]);

  // Arrancada de Espora (Turbo Boost)
  const handleBoost = useCallback(() => {
    sound.init();
    sound.resume();
    const e = engine.current;
    if (e.state !== 'playing' || e.boostCooldown > 0 || e.player.stamina < 0.25) return;

    e.boostActive = true;
    e.boostCooldown = 3.2;
    e.player.stamina = Math.max(0, e.player.stamina - 0.35);
    e.player.speed = Math.min(28, e.player.speed + 8.5);
    sound.playWhipCrack();
    triggerHaptic([40, 80]);
    addScorePopup('TURBO ESPORA!', '#38BDF8');
    showToast('ARRANCADA NA ESPORA!');
  }, [addScorePopup, showToast, triggerHaptic]);

  // Touch Joystick Handlers
  const handleTouchStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' && gameState !== 'struggle') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    if (touchX < rect.width * 0.5) {
      setTouchStickActive(true);
      setTouchStickPos({ x: touchX, y: touchY });
      setTouchStickKnob({ x: 0, y: 0 });
    }
  };

  const handleTouchMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStickActive || !touchStickPos) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    const dx = touchX - touchStickPos.x;
    const dy = touchY - touchStickPos.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setTouchStickKnob({ x: knobX, y: knobY });

    const normalizedSteer = Math.max(-1, Math.min(1, knobX / maxRadius));
    engine.current.steerInput = normalizedSteer;
  };

  const handleTouchEnd = () => {
    setTouchStickActive(false);
    setTouchStickPos(null);
    setTouchStickKnob({ x: 0, y: 0 });
    engine.current.steerInput = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.current.steerInput = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.current.steerInput = 1;
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAction();
      } else if (e.key === 'Shift' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleBoost();
      } else if (e.key === 'm' || e.key === 'M') {
        const m = sound.toggleMute();
        setIsMuted(m);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') &&
        engine.current.steerInput < 0
      ) {
        engine.current.steerInput = 0;
      }
      if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        engine.current.steerInput > 0
      ) {
        engine.current.steerInput = 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAction, handleBoost]);

  // Three.js Setup & Game Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8); // Céu azul de Sobradinho
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.0035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 800);
    camera.position.set(0, 5, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Iluminação Solar da Caatinga
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.8);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0xd4a373, 0.85);
    scene.add(hemiLight);

    // 3. Materiais e Modelos 3D
    const mats = createGameMaterials();
    const bullModel = createBullModel3D(mats);
    scene.add(bullModel.group);

    const horseModel = createHorseRiderModel3D(mats);
    scene.add(horseModel.group);

    const damEnv = createDamEnvironment3D(mats);
    scene.add(damEnv.group);

    // Linha de laço conectando o cavalo aos chifres do boi
    const ropeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const ropeLine = new THREE.Line(
      ropeGeo,
      new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 })
    );
    ropeLine.visible = false;
    scene.add(ropeLine);

    initTrack3D(scene, mats);

    threeRefs.current = {
      scene,
      camera,
      renderer,
      bullModel,
      horseModel,
      damEnv,
      ropeLine,
      mats,
    };

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    const tick = (now: number) => {
      const e = engine.current;
      const dt = Math.min(0.05, (now - e.lastFrame) / 1000);
      e.lastFrame = now;

      // Bullet Time
      let timeStep = dt;
      if (e.bulletTimeDuration > 0) {
        e.bulletTimeDuration -= dt;
        timeStep = dt * 0.3;
        if (e.bulletTimeDuration <= 0) {
          setIsBulletTime(false);
        }
      }

      if (e.state === 'playing' || e.state === 'struggle') {
        e.time += timeStep;

        // 1. Movimento do Jogador (Cavalo)
        const steer = e.steerInput;
        e.player.vx += (steer * 8.0 - e.player.vx) * Math.min(1, timeStep * 7);
        e.player.x = Math.max(-ROAD_HALF_WIDTH * 0.85, Math.min(ROAD_HALF_WIDTH * 0.85, e.player.x + e.player.vx * timeStep));

        if (e.player.stagger > 0) {
          e.player.stagger -= timeStep;
          e.player.speed = 10.5;
        } else if (e.boostActive) {
          e.player.speed = Math.max(16.5, e.player.speed - timeStep * 3.0);
          if (e.player.speed <= 17.0) e.boostActive = false;
        } else {
          e.player.speed = 16.5;
        }

        e.player.z -= e.player.speed * timeStep;
        e.distance = -e.player.z;
        e.player.stamina = Math.min(1.0, e.player.stamina + timeStep * 0.12);
        if (e.boostCooldown > 0) e.boostCooldown = Math.max(0, e.boostCooldown - timeStep);

        // Som de cascos
        const isDamAsphalt = e.distance > 800;
        if (Math.floor(e.time * 6.5) !== Math.floor((e.time - timeStep) * 6.5)) {
          sound.playHoofBeat(isDamAsphalt, e.player.speed / 16);
        }

        // Zonas
        let zone: 'descida' | 'subestacao' | 'crista' = 'descida';
        if (e.distance > 900) {
          zone = 'crista';
          if (!e.enteredDamZone) {
            e.enteredDamZone = true;
            speakNarrator('damEntry');
            showToast('BEM-VINDO À CRISTA DA BARRAGEM DE SOBRADINHO!');
          }
        } else if (e.distance > 500) {
          zone = 'subestacao';
        }
        setCurrentZone(zone);

        // 2. Inteligência e Movimento do Boi Nelore
        e.bull.modeTimer -= timeStep;
        if (e.bull.modeTimer <= 0) {
          const r = Math.random();
          e.bull.mode = r < 0.35 ? 'arrancada' : r < 0.65 ? 'zigue' : 'corrida';
          e.bull.modeTimer = 1.4 + Math.random() * 1.6;
          if (e.bull.mode === 'zigue') {
            e.bull.targetX = Math.max(-ROAD_HALF_WIDTH * 0.75, Math.min(ROAD_HALF_WIDTH * 0.75, -e.player.x * 0.8 + (Math.random() - 0.5) * 4));
            sound.playBullSnort();
          } else {
            e.bull.targetX = Math.max(-ROAD_HALF_WIDTH * 0.75, Math.min(ROAD_HALF_WIDTH * 0.75, e.bull.x + (Math.random() - 0.5) * 3));
          }
        }

        const bullSpeed = e.bull.mode === 'arrancada' ? 17.6 : e.bull.mode === 'zigue' ? 15.2 : 14.5;
        const bullAcc = (e.bull.targetX - e.bull.x) * 4.5 - e.bull.vx * 2.8;
        e.bull.vx += bullAcc * timeStep;
        e.bull.x = Math.max(-ROAD_HALF_WIDTH * 0.8, Math.min(ROAD_HALF_WIDTH * 0.8, e.bull.x + e.bull.vx * timeStep));

        e.bull.lead -= (e.player.speed - bullSpeed) * timeStep;
        e.bull.lead = Math.max(3.0, Math.min(85, e.bull.lead));
        e.bull.z = e.player.z - e.bull.lead;

        // 3. Minigame de Disputa
        if (e.state === 'struggle') {
          e.struggle.t += timeStep;
          e.struggle.needle = (Math.sin(e.struggle.t * 4.8 + Math.cos(e.struggle.t * 2.0) * 0.8) + 1) / 2;
          e.struggle.tension = Math.min(1.0, e.struggle.tension + timeStep * 0.055);
        }

        // 4. Verificação de Obstáculos
        e.obstacles.forEach((obs) => {
          const diffZ = obs.z - e.player.z;
          if (!obs.hit && diffZ > -1.5 && diffZ < 2.0) {
            if (Math.abs(e.player.x - obs.laneX) < 1.4) {
              obs.hit = true;
              e.player.stagger = 0.85;
              e.shake = 0.45;
              e.score = Math.max(0, e.score - 180);
              e.combo = 1;
              setCombo(1);
              sound.playStumble();
              triggerHaptic([100, 60, 100]);
              speakNarrator('collision');
              showToast('COLISÃO! RECUPERE O CONTROLE!');
            } else if (!obs.near) {
              obs.near = true;
              const nearBonus = 80 * e.combo;
              e.score += nearBonus;
              addScorePopup(`DESVIO RENTE! +${nearBonus}`, '#38BDF8');
            }
          }
        });

        // 5. Mira do Laço
        const isLockOn = e.bull.lead <= 18.5 && Math.abs(e.player.x - e.bull.x) <= 1.8;
        setIsLassoLockOn(isLockOn);
        setBullDistanceMeters(Math.round(e.bull.lead));

        if (e.bull.lead < 15 && isLockOn) {
          if (Date.now() - e.lastNearShout > 9000) {
            e.lastNearShout = Date.now();
            speakNarrator('nearBull');
          }
        }

        // Final de Percurso
        if (e.distance >= TOTAL_COURSE_METERS && e.state === 'playing') {
          e.state = 'result';
          setGameState('result');
          setResultData({
            victory: false,
            score: 450,
            time: `${Math.floor(e.time / 60)}:${String(Math.floor(e.time % 60)).padStart(2, '0')}`,
            distance: Math.floor(e.distance),
            ropesLeft: e.ropes,
            maxCombo: e.maxCombo,
            grade: 'D',
          });
          speakNarrator('escaped', true);
        }

        if (e.shake > 0) e.shake = Math.max(0, e.shake - timeStep * 2.8);

        // Sync React state
        setMeters(Math.floor(e.distance));
        setScore(e.score);
        setRopes(e.ropes);
        setSpeedKmh(Math.round(e.player.speed * 3.6));
        setStamina(e.player.stamina);
      }

      // --- ATUALIZAÇÕES GRÁFICAS THREE.JS ---
      // Posição do Boi Nelore (Orientado para a frente em -Z)
      bullModel.group.position.set(e.bull.x, 0, e.bull.z);
      animateBullModel(bullModel, e.time, e.player.speed, e.bull.vx);

      // Posição do Cavalo e Vaqueiro
      horseModel.group.position.set(e.player.x, 0, e.player.z);
      const isLassoSpin = e.state === 'playing' && e.bull.lead < 24;
      animateHorseRiderModel(horseModel, e.time, e.player.speed, e.player.vx, isLassoSpin);

      // Atualiza a estrada infinita
      damEnv.updateRoad(e.player.z);

      // Câmera em Terceira Pessoa (Chase Cam Suave)
      const targetCamX = e.player.x * 0.7;
      const targetCamY = 4.8;
      const targetCamZ = e.player.z + 10.5;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX + (Math.random() - 0.5) * e.shake * 0.6, 8, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY + (Math.random() - 0.5) * e.shake * 0.6, 8, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 12, dt);

      // Câmera olha para a frente em direção ao boi e à pista
      camera.lookAt(e.player.x * 0.4, 2.2, e.player.z - 22);

      // Linha do laço durante a disputa
      if (ropeLine.visible && e.state === 'struggle') {
        const p1 = new THREE.Vector3(e.player.x + 0.5, 3.5, e.player.z);
        const p2 = new THREE.Vector3(e.bull.x, 2.8, e.bull.z - 1.5);
        // Vibração física da corda tensionada
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        midPoint.y += Math.sin(e.struggle.t * 22) * 0.25;
        midPoint.x += Math.cos(e.struggle.t * 22) * 0.25;

        const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
        ropeLine.geometry.setFromPoints(curve.getPoints(12));
      }

      // Luz do sol acompanha o jogador
      sunLight.position.set(e.player.x + 40, 60, e.player.z + 30);
      sunLight.target.position.set(e.player.x, 0, e.player.z - 20);
      sunLight.target.updateMatrixWorld();

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initTrack3D]);

  return (
    <div
      onPointerDown={handleTouchStart}
      onPointerMove={handleTouchMove}
      onPointerUp={handleTouchEnd}
      onPointerCancel={handleTouchEnd}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none text-white"
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full block touch-none z-0" />

      {/* PAINEL SUPERIOR MOBILE HUD (Brutalist High-Contrast Console) */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          {/* Logo / Selo do Jogo */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border-2 border-amber-500 rounded pointer-events-auto shadow-md">
            <span className="text-2xl">🐂</span>
            <div className="leading-tight">
              <span className="font-black text-xs sm:text-sm tracking-wider text-amber-400 block">
                BOI DE FUGA 3D
              </span>
              <span className="text-[9px] text-sky-400 tracking-tight font-bold block">
                SOBRADINHO • CHESF
              </span>
            </div>
          </div>

          {/* Medidores de Corrida */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 bg-slate-900 border-2 border-slate-700 rounded text-xs font-mono font-bold shadow-md">
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">METROS</span>
                <span className="text-amber-400 text-xs sm:text-sm">{meters}m</span>
              </div>
              <div className="w-[1px] h-5 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">VELOCIDADE</span>
                <span className="text-sky-400 text-xs sm:text-sm">{speedKmh} km/h</span>
              </div>
              <div className="w-[1px] h-5 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">DIST. BOI</span>
                <span
                  className={`text-xs sm:text-sm ${
                    isLassoLockOn ? 'text-emerald-400 font-black animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {bullDistanceMeters}m
                </span>
              </div>
              <div className="w-[1px] h-5 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">COMBO</span>
                <span className="text-amber-400 text-xs sm:text-sm">{combo}x</span>
              </div>
              <div className="w-[1px] h-5 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">LAÇOS</span>
                <span className="text-emerald-400 text-xs sm:text-sm">{ropes}/3</span>
              </div>
            </div>

            {/* Mudo e Ajuda */}
            <button
              onClick={() => {
                const m = sound.toggleMute();
                setIsMuted(m);
              }}
              className="p-2.5 bg-slate-900 border-2 border-slate-700 rounded active:scale-95 text-amber-400"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2.5 bg-slate-900 border-2 border-slate-700 rounded active:scale-95 text-sky-400"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Rota e Etapa Geográfica de Sobradinho */}
        <div className="max-w-4xl mx-auto w-full flex items-center gap-2 px-3 py-1 bg-slate-900/95 border border-slate-700 rounded text-[10px] font-bold">
          <span className="text-amber-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            {currentZone === 'crista'
              ? 'ETAPA 3: CRISTA DA BARRAGEM (CHESF)'
              : currentZone === 'subestacao'
              ? 'ETAPA 2: SUBESTAÇÃO E ACESSO'
              : 'ETAPA 1: DESCIDA DO CRUZEIRO'}
          </span>
          <div className="flex-1 h-2 bg-slate-950 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-sky-400 transition-all duration-100"
              style={{ width: `${Math.min(100, (meters / TOTAL_COURSE_METERS) * 100)}%` }}
            />
          </div>
          <span className="text-slate-400 font-mono">
            {Math.round((meters / TOTAL_COURSE_METERS) * 100)}%
          </span>
        </div>
      </div>

      {/* INDICADOR DE BULLET TIME */}
      {isBulletTime && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded shadow-xl animate-pulse z-20 pointer-events-none">
          ⚡ CÂMERA LENTA 3D · DISPARO DO LAÇO!
        </div>
      )}

      {/* DISPUTA DE CABO DE GUERRA */}
      {gameState === 'struggle' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-slate-900/95 border-3 border-amber-500 p-4 rounded shadow-2xl z-20">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-400 mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4 text-amber-400" /> PUXADA NO LAÇO!
            </span>
            <span className="text-emerald-400 text-[10px] font-mono">TOQUE NO VERDE</span>
          </div>

          <div className="relative w-full h-8 bg-slate-950 border-2 border-slate-700 rounded overflow-hidden my-2">
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/80 border-x-2 border-emerald-300"
              style={{
                left: `${engine.current.struggle.sweetSpotMin * 100}%`,
                width: `${
                  (engine.current.struggle.sweetSpotMax - engine.current.struggle.sweetSpotMin) * 100
                }%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-3 bg-amber-400 shadow-[0_0_12px_#F59E0B] -translate-x-1/2"
              style={{ left: `${struggleNeedle * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mt-2">
            <div>
              <div className="flex justify-between text-emerald-400">
                <span>Derrubar Boi</span>
                <span>{Math.round(strugglePull * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded overflow-hidden border border-slate-700 mt-0.5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${strugglePull * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-rose-400">
                <span>Risco Estourar</span>
                <span>{Math.round(struggleTension * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded overflow-hidden border border-slate-700 mt-0.5">
                <div
                  className="h-full bg-rose-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, struggleTension * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST */}
      {toastText && (
        <div className="absolute top-1/2 -translate-y-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm tracking-wide uppercase rounded shadow-2xl z-30 pointer-events-none whitespace-nowrap">
          {toastText}
        </div>
      )}

      {/* FLOATING SCORE POPUPS */}
      {floatingScores.map((fs) => (
        <div
          key={fs.id}
          className="absolute font-black font-mono text-sm sm:text-base pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-bounce z-30"
          style={{ left: fs.x, top: fs.y, color: fs.color }}
        >
          {fs.text}
        </div>
      ))}

      {/* VISUAL TOUCH JOYSTICK (Floating Thumbstick) */}
      {touchStickActive && touchStickPos && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: touchStickPos.x, top: touchStickPos.y }}
        >
          <div className="w-24 h-24 rounded border-2 border-amber-400/80 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
            <div
              className="w-10 h-10 rounded border-2 border-amber-300 bg-amber-500 shadow-[0_0_12px_#F59E0B]"
              style={{
                transform: `translate(${touchStickKnob.x}px, ${touchStickKnob.y}px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* CONTROLES MOBILE TÁCTEIS */}
      <div className="absolute bottom-4 inset-x-4 flex items-end justify-between pointer-events-none z-10 max-w-4xl mx-auto">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onPointerDown={() => {
              engine.current.steerInput = -1;
            }}
            onPointerUp={() => {
              if (engine.current.steerInput < 0) engine.current.steerInput = 0;
            }}
            onPointerCancel={() => {
              if (engine.current.steerInput < 0) engine.current.steerInput = 0;
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/90 border-2 border-amber-500 active:bg-amber-600 rounded flex flex-col items-center justify-center font-black text-amber-400 active:text-white shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-2xl leading-none">◀</span>
            <span className="text-[8px] uppercase tracking-tighter">Esquerda</span>
          </button>
          <button
            onPointerDown={() => {
              engine.current.steerInput = 1;
            }}
            onPointerUp={() => {
              if (engine.current.steerInput > 0) engine.current.steerInput = 0;
            }}
            onPointerCancel={() => {
              if (engine.current.steerInput > 0) engine.current.steerInput = 0;
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/90 border-2 border-amber-500 active:bg-amber-600 rounded flex flex-col items-center justify-center font-black text-amber-400 active:text-white shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-2xl leading-none">▶</span>
            <span className="text-[8px] uppercase tracking-tighter">Direita</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleBoost}
            disabled={stamina < 0.25}
            className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded flex flex-col items-center justify-center font-black uppercase text-[9px] shadow-lg active:scale-95 transition-transform ${
              stamina < 0.25
                ? 'bg-slate-900/60 border-slate-700 text-slate-500'
                : 'bg-slate-900/90 border-sky-400 text-sky-400 active:bg-sky-500 active:text-white'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span>Espora</span>
          </button>

          <button
            onClick={handleAction}
            className={`w-20 h-20 sm:w-24 sm:h-24 border-3 rounded flex flex-col items-center justify-center font-black uppercase tracking-wider text-xs shadow-2xl active:scale-95 transition-all ${
              gameState === 'struggle'
                ? 'bg-emerald-500 border-white text-slate-950 animate-bounce'
                : isLassoLockOn
                ? 'bg-emerald-500 border-white text-slate-950 animate-pulse'
                : 'bg-amber-500 border-white text-slate-950 active:bg-amber-600'
            }`}
          >
            <Target className="w-7 h-7 mb-1" />
            <span>{gameState === 'struggle' ? 'PUXAR!' : isLassoLockOn ? 'LAÇAR AGORA!' : 'LAÇAR'}</span>
          </button>
        </div>
      </div>

      {/* MODAL INICIAL */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-40">
          <div className="max-w-md w-full bg-slate-900 border-3 border-amber-500 p-6 sm:p-7 rounded shadow-2xl text-center space-y-4">
            <div>
              <span className="text-4xl block mb-1">🐂</span>
              <h1 className="text-3xl sm:text-4xl font-black text-amber-400 uppercase tracking-tight">
                BOI DE FUGA 3D
              </h1>
              <p className="text-xs text-sky-400 font-bold tracking-widest uppercase">
                SOBRADINHO • BAHIA • CHESF
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O boi Nelore escapou na descida do Morro do Cruzeiro e tomou a rodovia sobre a crista da
              Barragem de Sobradinho! Persiga o animal em 3D real, desvie dos obstáculos sobre a usina,
              alinhe o laço e derrube o boi antes do fim da barragem!
            </p>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-left text-xs space-y-1.5 text-slate-300 font-mono">
              <div>🎯 <b>VISÃO 3D:</b> Câmera traseira acompanhando o cavalo e o boi correndo à frente.</div>
              <div>⚡ <b>ESPORA:</b> Arrancada rápida para colar na garupa do animal.</div>
              <div>✊ <b>LAÇO & PUXADA:</b> Quando laçar, toque repetidamente no ponto verde.</div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded shadow-xl active:scale-95 transition-transform"
            >
              MONTAR NO CAVALO E INICIAR
            </button>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Recorde: {highScore} pts</span>
              <span>Locutor: Voz Gemini 3.8 Flash TTS</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO */}
      {gameState === 'result' && resultData && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-40">
          <div className="max-w-md w-full bg-slate-900 border-3 border-amber-500 p-6 rounded shadow-2xl space-y-4 text-center">
            <span className="text-5xl block">{resultData.victory ? '🏆' : '💨'}</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded">
                GRAU {resultData.grade}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-amber-400 tracking-tight">
                {resultData.victory ? 'BOI DERRUBADO NO CHÃO!' : 'O BOI ESCAPOU NO LAGO'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Pontuação Final</span>
                <span className="text-amber-400 text-lg">{resultData.score} pts</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Distância</span>
                <span className="text-sky-400 text-lg">{resultData.distance}m</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Maior Combo</span>
                <span className="text-amber-400 text-lg">{resultData.maxCombo}x</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Laços Sobrando</span>
                <span className="text-emerald-400 text-lg">{resultData.ropesLeft}/3</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {resultData.victory
                ? 'Valeu boi! Derrubada limpa e no tempo certo sobre a crista da Barragem de Sobradinho!'
                : 'O animal escapou pela muralha da CHESF. Recupere o fôlego e tente de novo!'}
            </p>

            <button
              onClick={handleStart}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded shadow-xl flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> CORRER NOVAMENTE
            </button>
          </div>
        </div>
      )}

      {/* MODAL TUTORIAL */}
      {showTutorial && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50">
          <div className="max-w-sm w-full bg-slate-900 border-2 border-slate-700 p-5 rounded space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-sm text-amber-400 uppercase">COMO JOGAR EM 3D</span>
              <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li>• <b>Direção Táctil:</b> Arraste o polegar no lado esquerdo da tela para guiar o cavalo.</li>
              <li>• <b>Espora ⚡:</b> Acelere na espora para se aproximar da garupa do boi.</li>
              <li>• <b>Laço 🎯:</b> Quando estiver a menos de 18 metros e alinhado na pista, solte o braço!</li>
              <li>• <b>Cabo de Guerra:</b> Puxe repetidamente quando a agulha passar pela zona verde.</li>
            </ul>
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
