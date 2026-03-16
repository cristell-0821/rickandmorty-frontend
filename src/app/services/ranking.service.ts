import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { db } from './firebase';

export interface RankingEntry {
  apodo: string;
  score: number;
  difficulty: string;
  difficultyLabel: string;
  time: string;
  attempts: number;
  date: string;
}


@Injectable({
  providedIn: 'root'
})
export class RankingService {

  async saveScore(entry: RankingEntry): Promise<void> {
    try {
      const { doc, updateDoc, setDoc } = await import('firebase/firestore');

      // Buscar si ya existe un puntaje de este usuario en esta dificultad
      const q = query(
        collection(db, 'rankings'),
        where('apodo', '==', entry.apodo),
        where('difficulty', '==', entry.difficulty)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        const docSnap = existing.docs[0];
        const prevScore = docSnap.data()['score'];

        if (entry.score > prevScore) {
          // Solo actualiza si el puntaje es mayor
          await updateDoc(doc(db, 'rankings', docSnap.id), { ...entry });
        }
        // Si es menor o igual, no hace nada
        return;
      }

      // No existe → crear nuevo
      await addDoc(collection(db, 'rankings'), {
        ...entry,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error guardando puntaje:', error);
    }
  }

  async getTopByDifficulty(difficulty: string, limitCount: number = 10): Promise<RankingEntry[]> {
    try {
      const q = query(
        collection(db, 'rankings'),
        where('difficulty', '==', difficulty),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as RankingEntry);
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      return [];
    }
  }
}