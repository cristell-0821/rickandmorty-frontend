import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CharacterService } from '../services/character.service';
import { Character } from '../character.model';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.css']
})
export class CharacterDetailComponent implements OnInit {
  character: Character | undefined;
  firstEpisodeName: string = '-';
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.characterService.getCharacterById(id).subscribe({
      next: (data) => {
        this.character = data;
        this.error = false;

        const firstEpisodeUrl = data.episode[0];
        this.characterService.getEpisodeNameByUrl(firstEpisodeUrl).subscribe({
          next: episodeData => {
            this.firstEpisodeName = episodeData.name;
          }
        });
      },
      error: () => {
        this.error = true;
      }
    });
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  }

  async downloadPDF() {
    const character = this.character;
    if (!character) return;

    try {
      const base64Img = await this.getBase64ImageFromURL(character.image);

      const statusColors: { [key: string]: string } = {
        'Alive':   '#97ce4c',
        'Dead':    '#e74c3c',
        'unknown': '#8e8e8e'
      };
      const statusColor = statusColors[character.status] || '#8e8e8e';

      const docDefinition: any = {
        content: [
          // Imagen centrada con borde
          {
            stack: [{ image: base64Img, width: 160, alignment: 'center' }],
            margin: [0, 20, 0, 16]
          },
          // Nombre
          {
            text: character.name,
            font: 'Roboto',
            fontSize: 22,
            bold: true,
            color: '#0d1b2a',
            alignment: 'center',
            margin: [0, 0, 0, 6]
          },
          // Especie y género
          {
            text: `${character.species}  ·  ${character.gender}`,
            fontSize: 10,
            color: '#44d7e8',
            alignment: 'center',
            margin: [0, 0, 0, 14],
            characterSpacing: 2
          },
          // Badge de status
          {
            table: { widths: ['*'], body: [[{
              text: character.status.toUpperCase(),
              alignment: 'center',
              color: '#060b14',
              fillColor: statusColor,
              bold: true,
              fontSize: 10,
              margin: [0, 5, 0, 5],
              characterSpacing: 3
            }]]},
            layout: 'noBorders',
            margin: [140, 0, 140, 24]
          },
          // Línea separadora
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#44d7e8' }], margin: [0, 0, 0, 20] },
          // Datos
          { columns: [{ width: '45%', text: 'ORIGEN', style: 'label' },         { width: '*', text: character.origin.name,             style: 'value' }], margin: [0, 0, 0, 12] },
          { columns: [{ width: '45%', text: 'ÚLTIMA UBICACIÓN', style: 'label'},  { width: '*', text: character.location?.name || '-',    style: 'value' }], margin: [0, 0, 0, 12] },
          { columns: [{ width: '45%', text: 'PRIMERA APARICIÓN', style: 'label'}, { width: '*', text: this.firstEpisodeName || '-',        style: 'value' }], margin: [0, 0, 0, 12] },
          { columns: [{ width: '45%', text: 'TOTAL EPISODIOS', style: 'label'},   { width: '*', text: `${character.episode.length}`,       style: 'value' }], margin: [0, 0, 0, 12] },
          // Footer
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#44d7e8' }], margin: [0, 20, 0, 10] },
          { text: 'rickandmorty-app  ·  Character Database', fontSize: 8, color: '#2a4a6a', alignment: 'center' }
        ],
        styles: {
          label: { fontSize: 9,  color: '#0a8a9f', bold: true, characterSpacing: 1.5 },
          value: { fontSize: 11, color: '#1a2a3a' }  
        },
        pageMargins: [40, 20, 40, 20]
      };

      pdfMake.createPdf(docDefinition).download(`${character.name}.pdf`);
    } catch (err) {
      console.error('Error al convertir imagen a base64', err);
    }
  }
}
