import { Component, OnInit, OnDestroy } from '@angular/core';
import { CharacterService } from '../services/character.service';

export type Difficulty = 'easy' | 'normal' | 'hard';

interface MemoryCard {
  id: number;
  characterId: number;
  name: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

const DIFFICULTY_CONFIG = {
  easy:   { pairs: 6,  cols: 4, label: 'Fácil',  time: 0 },
  normal: { pairs: 8,  cols: 4, label: 'Normal', time: 0 },
  hard:   { pairs: 12, cols: 6, label: 'Difícil', time: 0 }
};

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.css']
})
export class MemoryComponent implements OnInit, OnDestroy {

  // Estado del juego
  gameState: 'selecting' | 'playing' | 'won' = 'selecting';
  difficulty: Difficulty = 'normal';
  cards: MemoryCard[] = [];
  cols: number = 4;

  // Lógica de volteo
  flippedCards: MemoryCard[] = [];
  lockBoard: boolean = false;

  // Stats
  attempts: number = 0;
  matchedPairs: number = 0;
  totalPairs: number = 0;
  elapsedTime: number = 0;
  private timerInterval: any;

  // Score final
  finalScore: number = 0;

  //carga
  isLoadingCards: boolean = false;

  difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  config = DIFFICULTY_CONFIG;

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopTimer();
  }

  selectDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

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
    this.gameState = 'playing';

    this.characterService.getCharacters().subscribe(data => {
      this.isLoadingCards = false;  
      // Tomar personajes aleatorios según pares necesarios
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, cfg.pairs);

      // Crear pares y mezclar
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
      this.matchedPairs++;
      this.flippedCards = [];
      this.lockBoard = false;

      if (this.matchedPairs === this.totalPairs) {
        this.stopTimer();
        this.calculateScore();
        setTimeout(() => this.gameState = 'won', 600);
      }
    } else {
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
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

  restartGame(): void {
    this.stopTimer();
    this.gameState = 'selecting';
    this.cards = [];
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
}