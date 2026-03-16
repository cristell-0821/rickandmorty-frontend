import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../character.model';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  private apiUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<Character[]> {
    const pages = [1, 2, 3];
    return forkJoin(
      pages.map(p => this.http.get<any>(`${this.apiUrl}?page=${p}`))
    ).pipe(
      map(results => results.flatMap((r: any) => r.results))
    );
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }

  getEpisodeNameByUrl(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
}