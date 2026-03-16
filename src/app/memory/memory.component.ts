import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RankingService } from '../services/ranking.service';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameRecord {
  difficulty: Difficulty;
  difficultyLabel: string;
  time: string;
  attempts: number;
  score: number;
  date: string;
}

export const DIFFICULTY_CONFIG = {
  easy:   { pairs: 6,  cols: 4, label: 'Fácil' },
  normal: { pairs: 8,  cols: 4, label: 'Normal' },
  hard:   { pairs: 12, cols: 6, label: 'Difícil' }
};

const STORAGE_KEY = 'rickmorty_history';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.css']
})
export class MemoryComponent implements OnInit {

  difficulty: Difficulty = 'normal';
  difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  config = DIFFICULTY_CONFIG;

  portalLoaded: boolean = false;

  history: GameRecord[] = [];
  bestScores: { [key in Difficulty]?: GameRecord } = {};

  statsTab: 'personal' | 'global' = 'personal';
  globalDifficulty: Difficulty = 'normal';
  globalRankings: any[] = [];
  isLoadingGlobal: boolean = false;

  constructor(
    private router: Router,
    private rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  // ===================== NAVEGACIÓN =====================

  selectDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  startGame(): void {
    this.router.navigate(['/memory/play'], {
      queryParams: { difficulty: this.difficulty }
    });
  }

  // ===================== HISTORIAL LOCAL =====================

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

  clearHistory(): void {
    this.history = [];
    this.bestScores = {};
    localStorage.removeItem(STORAGE_KEY);
  }

  getBestForDifficulty(d: Difficulty): GameRecord | undefined {
    return this.bestScores[d];
  }

  // ===================== RANKING GLOBAL =====================

  setStatsTab(tab: 'personal' | 'global'): void {
    this.statsTab = tab;
    if (tab === 'global') this.loadGlobalRanking();
  }

  setGlobalDifficulty(d: Difficulty): void {
    this.globalDifficulty = d;
    this.loadGlobalRanking();
  }

  async loadGlobalRanking(): Promise<void> {
    this.isLoadingGlobal = true;
    this.globalRankings = await this.rankingService.getTopByDifficulty(this.globalDifficulty);
    this.isLoadingGlobal = false;
  }

  getMedalIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }
}