import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../character.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = 'http://localhost:8080/characters';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.apiUrl);
  }

  getCharacterById(id: number): Observable<Character> {
  return this.http.get<Character>(`${this.apiUrl}/${id}`);
}
  getEpisodeNameByUrl(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

}
