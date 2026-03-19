import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { RankingService, RankingEntry } from '../services/ranking.service';

type Difficulty = 'easy' | 'normal' | 'hard';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class RankingComponent implements OnInit {

  selectedDifficulty: Difficulty = 'normal';
  rankings: RankingEntry[] = [];
  isLoading: boolean = true;

  difficulties: { key: Difficulty, label: string }[] = [
    { key: 'easy',   label: 'Fácil' },
    { key: 'normal', label: 'Normal' },
    { key: 'hard',   label: 'Difícil' }
  ];

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.loadRanking();
  }

  async loadRanking(): Promise<void> {
    this.isLoading = true;
    this.rankings = await this.rankingService.getTopByDifficulty(this.selectedDifficulty);
    this.isLoading = false;
  }

  selectDifficulty(d: Difficulty): void {
    this.selectedDifficulty = d;
    this.loadRanking();
  }

  getMedalIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }
}