import { Component, OnInit } from '@angular/core';
import { Character } from '../character.model';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  characters: Character[] = [];
  filteredCharacters: Character[] = [];
  pagedCharacters: Character[] = [];
  firstEpisodes: { [id: number]: string } = {};

  searchName: string = '';
  selectedStatus: string = '';
  selectedSpecies: string = '';
  availableSpecies: string[] = [];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;
  pages: number[] = [];

  constructor(private characterService: CharacterService) {}

  speciesOpen: boolean = false;

  selectSpecies(species: string): void {
    this.selectedSpecies = species;
    this.speciesOpen = false;
    this.applyFilters();
  }
  isLoading: boolean = true; 

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe(data => {
      this.isLoading = false;
      this.characters = data;
      this.filteredCharacters = [...data];

      const speciesSet = new Set(data.map(c => c.species));
      this.availableSpecies = Array.from(speciesSet).sort();

      this.updatePagination();

      data.forEach(character => {
        const firstEpisodeUrl = character.episode[0];
        this.characterService.getEpisodeNameByUrl(firstEpisodeUrl).subscribe(episode => {
          this.firstEpisodes[character.id] = episode.name;
        });
      });
    });
    document.addEventListener('click', (e) => {
      const el = document.querySelector('.custom-select');
      if (el && !el.contains(e.target as Node)) {
        this.speciesOpen = false;
      }
    });
  }

  applyFilters(): void {
    const name = this.searchName.toLowerCase().trim();
    const status = this.selectedStatus.toLowerCase();
    const species = this.selectedSpecies.toLowerCase();

    this.filteredCharacters = this.characters.filter(c => {
      const matchName = !name || c.name.toLowerCase().includes(name);
      const matchStatus = !status || c.status.toLowerCase() === status;
      const matchSpecies = !species || c.species.toLowerCase() === species;
      return matchName && matchStatus && matchSpecies;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCharacters.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCharacters = this.filteredCharacters.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchName = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchName = '';
    this.selectedStatus = '';
    this.selectedSpecies = '';
    this.filteredCharacters = [...this.characters];
    this.currentPage = 1;
    this.updatePagination();
  }
}