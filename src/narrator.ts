import { sound } from './soundEngine';

// Authentic Sobradinho Vaquejada Voice Narrator
// Calls server-side /api/tts backed by gemini-3.8-flash-tts with automatic fallback to browser Web Speech API (pt-BR)
// when Gemini API quota (Free Tier 10 requests/day limit) is exhausted or unavailable.

interface NarratorCue {
  text: string;
  speaker: string;
  style: string;
}

const NARRATOR_LINES = {
  start: [
    { text: "Olha o boi na descida do Cruzeiro! Bota pressão, vaqueiro!", speaker: "Locutor", style: "Narrador de vaquejada nordestino e sertanejo vibrante de Sobradinho" },
    { text: "Porteira abriu em Sobradinho! Segura as rédeas e aperta o passo!", speaker: "Locutor", style: "Narrador sertanejo empolgado e veloz" },
  ],
  damEntry: [
    { text: "Entrou na crista da Barragem de Sobradinho! Cuidado com o abismo e as pedras!", speaker: "Locutor", style: "Narrador tenso e alerta" },
  ],
  nearBull: [
    { text: "Tá no rabo do boi! Prepara o laço, ajusta a mira e solta o braço!", speaker: "Locutor", style: "Narrador acelerado e empolgante" },
  ],
  lassoCaught: [
    { text: "Laço no chifre! Segura a corda, controla a tensão e puxa no compasso!", speaker: "Locutor", style: "Narrador enérgico no clímax da vaquejada" },
  ],
  victory: [
    { text: "Derrubou no chão de Sobradinho! Valeu boi! Campeão do sertão!", speaker: "Locutor", style: "Narrador eufórico comemorando vitória de vaquejada" },
  ],
  escaped: [
    { text: "O bicho escapou pro lago de Sobradinho! Hoje o boi levou a melhor!", speaker: "Locutor", style: "Narrador desapontado com respeito ao boi" },
  ],
  collision: [
    { text: "Bateu na barreira! Equilibra o cavalo e retoma o galope!", speaker: "Locutor", style: "Narrador alarmado e urgente" },
  ],
};

let lastSpeechTime = 0;
const SPEECH_COOLDOWN_MS = 3800;
let pendingFetch = false;

// Fallback to local browser Web Speech API (pt-BR) when offline or quota exceeded
function speakBrowserSpeech(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || sound.getMuted()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.15; // Ritmo ágil de locutor de vaquejada
    utterance.pitch = 1.05;

    // Tenta encontrar uma voz em português
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt') || v.lang.includes('Brazil')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Falha silenciosa sem quebrar o jogo
  }
}

export async function speakNarrator(event: keyof typeof NARRATOR_LINES, force: boolean = false): Promise<void> {
  const now = Date.now();
  if (!force && (now - lastSpeechTime < SPEECH_COOLDOWN_MS || pendingFetch)) {
    return;
  }

  const pool = NARRATOR_LINES[event];
  if (!pool || pool.length === 0) return;
  const cue = pool[Math.floor(Math.random() * pool.length)];

  lastSpeechTime = now;
  pendingFetch = true;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cue),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        await sound.playBase64Audio(data.audioBase64);
        return;
      }
      if (data.quotaExceeded) {
        speakBrowserSpeech(cue.text);
        return;
      }
    }

    // Se o servidor retornar erro ou cota esgotada, use a Web Speech API
    speakBrowserSpeech(cue.text);
  } catch (err) {
    speakBrowserSpeech(cue.text);
  } finally {
    pendingFetch = false;
  }
}
