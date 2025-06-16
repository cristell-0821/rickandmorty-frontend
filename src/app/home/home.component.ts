import { Component, OnInit } from '@angular/core';
import { Character } from '../character.model';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  characters: Character[] = [];

  firstEpisodes: { [id: number]: string } = {};

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe(data => {
      this.characters = data;

      this.characters.forEach(character => {
        const firstEpisodeUrl = character.episode[0];
        this.characterService.getEpisodeNameByUrl(firstEpisodeUrl).subscribe(episode => {
          this.firstEpisodes[character.id] = episode.name;
        });
      });
    });
  }
}
