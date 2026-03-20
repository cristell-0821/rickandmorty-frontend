import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../services/character.service';
import { RankingService } from '../services/ranking.service';
import { AuthService } from '../services/auth.service';
import { User } from 'firebase/auth';
import { DIFFICULTY_CONFIG, GameRecord, Difficulty } from '../memory/memory.component';

const STORAGE_KEY = 'rickmorty_history';

interface MemoryCard {
  id: number;
  characterId: number;
  name: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.component.html',
  styleUrls: ['./memory-game.component.css']
})
export class MemoryGameComponent implements OnInit, OnDestroy {

  difficulty: Difficulty = 'normal';
  cards: MemoryCard[] = [];
  cols: number = 4;
  config = DIFFICULTY_CONFIG;

  flippedCards: MemoryCard[] = [];
  lockBoard: boolean = false;
  mismatchIds: Set<number> = new Set();

  attempts: number = 0;
  matchedPairs: number = 0;
  totalPairs: number = 0;
  elapsedTime: number = 0;
  private timerInterval: any;

  gameState: 'playing' | 'won' = 'playing';
  finalScore: number = 0;
  isNewRecord: boolean = false;
  isLoadingCards: boolean = false;

  currentUser: User | null = null;
  isLoggingIn: boolean = false;
  apodoGuardado: boolean = false;
  isSavingScore: boolean = false;

  history: GameRecord[] = [];
  bestScores: { [key in Difficulty]?: GameRecord } = {};

  showCheatModal: boolean = false;

  @ViewChild('confettiCanvas') confettiCanvas!: ElementRef<HTMLCanvasElement>;
  private confettiAnimFrame: any;
  private audioCtx: AudioContext | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private rankingService: RankingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    // Leer dificultad del query param
    this.route.queryParams.subscribe(params => {
      this.difficulty = (params['difficulty'] as Difficulty) || 'normal';
      this.startGame();
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.audioCtx?.close();
    if (this.confettiAnimFrame) cancelAnimationFrame(this.confettiAnimFrame);
  }

  // ===================== JUEGO =====================

  startGame(): void {
    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    this.totalPairs = cfg.pairs;
    this.cols = cfg.cols;
    this.attempts = 0;
    this.matchedPairs = 0;
    this.elapsedTime = 0;
    this.flippedCards = [];
    this.lockBoard = false;
    this.isLoadingCards = true;
    this.isNewRecord = false;
    this.apodoGuardado = false;
    this.gameState = 'playing';

    this.characterService.getCharacters().subscribe(data => {
      this.isLoadingCards = false;
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, cfg.pairs);
      const pairs: MemoryCard[] = [];
      shuffled.forEach((char, i) => {
        pairs.push({ id: i * 2,     characterId: char.id, name: char.name, image: char.image, flipped: false, matched: false });
        pairs.push({ id: i * 2 + 1, characterId: char.id, name: char.name, image: char.image, flipped: false, matched: false });
      });
      this.cards = pairs.sort(() => Math.random() - 0.5);
      this.startTimer();
    });
  }

  flipCard(card: MemoryCard): void {
    if (this.lockBoard || card.flipped || card.matched) return;
    card.flipped = true;
    this.playFlipSound();
    this.flippedCards.push(card);
    if (this.flippedCards.length === 2) {
      this.attempts++;
      this.lockBoard = true;
      this.checkMatch();
    }
  }

  checkMatch(): void {
    const [a, b] = this.flippedCards;
    if (a.characterId === b.characterId) {
      a.matched = true;
      b.matched = true;
      this.playMatchSound();
      this.matchedPairs++;
      this.flippedCards = [];
      this.lockBoard = false;
      if (this.matchedPairs === this.totalPairs) {
        this.stopTimer();
        this.calculateScore();
        this.addRecord();
        this.playWinSound();
        setTimeout(() => {
          this.gameState = 'won';
          this.launchConfetti();
        }, 600);
      }
    } else {
      this.playErrorSound();
      this.mismatchIds.add(a.id);
      this.mismatchIds.add(b.id);
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        this.mismatchIds.delete(a.id);
        this.mismatchIds.delete(b.id);
        this.flippedCards = [];
        this.lockBoard = false;
      }, 1000);
    }
  }

  calculateScore(): void {
    const baseScore = this.totalPairs * 100;
    const timePenalty = this.elapsedTime * 2;
    const attemptPenalty = Math.max(0, this.attempts - this.totalPairs) * 10;
    this.finalScore = Math.max(0, baseScore - timePenalty - attemptPenalty);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => this.elapsedTime++, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  goBack(): void {
    this.stopTimer();
    this.router.navigate(['/memory']);
  }

  playAgain(): void {
    this.stopTimer();
    this.startGame();
  }

  get formattedTime(): string {
    const m = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
    const s = (this.elapsedTime % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get progressPercent(): number {
    return this.totalPairs ? (this.matchedPairs / this.totalPairs) * 100 : 0;
  }

  // ===================== HISTORIAL =====================

  loadHistory(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.history = raw ? JSON.parse(raw) : [];
      this.computeBestScores();
    } catch {
      this.history = [];
    }
  }

  computeBestScores(): void {
    this.bestScores = {};
    for (const record of this.history) {
      const current = this.bestScores[record.difficulty];
      if (!current || record.score > current.score) {
        this.bestScores[record.difficulty] = record;
      }
    }
  }

  addRecord(): void {
    const prev = this.bestScores[this.difficulty];
    this.isNewRecord = !prev || this.finalScore > prev.score;

    const record: GameRecord = {
      difficulty: this.difficulty,
      difficultyLabel: DIFFICULTY_CONFIG[this.difficulty].label,
      time: this.formattedTime,
      attempts: this.attempts,
      score: this.finalScore,
      date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
    };

    this.history.unshift(record);
    if (this.history.length > 5) this.history = this.history.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    this.computeBestScores();
  }

  getBestForDifficulty(d: Difficulty): GameRecord | undefined {
    return this.bestScores[d];
  }

  // ===================== RANKING =====================

  async loginAndSave(): Promise<void> {
    this.isLoggingIn = true;
    const user = await this.authService.loginWithGoogle();
    this.isLoggingIn = false;
    if (user) await this.saveToRanking(user);
  }

  async saveToRanking(user: User): Promise<void> {
    const minTimes = { easy: 10, normal: 20, hard: 30 };
    if (this.elapsedTime < minTimes[this.difficulty]) {
      this.showCheatModal = true;
      return;
    }
    this.isSavingScore = true;
    await this.rankingService.saveScore({
      apodo: user.displayName || 'Anónimo',
      score: this.finalScore,
      difficulty: this.difficulty,
      difficultyLabel: DIFFICULTY_CONFIG[this.difficulty].label,
      time: this.formattedTime,
      attempts: this.attempts,
      date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
    });
    this.isSavingScore = false;
    this.apodoGuardado = true;
  }

  // ===================== SONIDOS =====================

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return this.audioCtx;
  }

  playFlipSound(): void {
    const ctx = this.getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  }

  playMatchSound(): void {
    const ctx = this.getAudioCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  }

  playErrorSound(): void {
    const ctx = this.getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }

  playWinSound(): void {
    const ctx = this.getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.25);
      osc.start(ctx.currentTime + i * 0.13); osc.stop(ctx.currentTime + i * 0.13 + 0.25);
    });
  }

  // ===================== CONFETTI =====================

  launchConfetti(): void {
    setTimeout(() => {
      const canvas = this.confettiCanvas?.nativeElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const colors = ['#97ce4c', '#44d7e8', '#ffffff', '#f39c12', '#e74c3c'];
      const pieces = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        spin: Math.random() * 4 - 2,
        opacity: 1
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
          ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y); ctx.rotate((p.angle * Math.PI) / 180);
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2.5); ctx.restore();
          p.y += p.speed; p.angle += p.spin;
          if (p.y > canvas.height) { p.y = -10; p.opacity -= 0.015; }
        });
        if (pieces.some(p => p.opacity > 0)) this.confettiAnimFrame = requestAnimationFrame(draw);
      };
      draw();
    }, 650);
  }
}