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

        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  async downloadPDF() {
    const character = this.character;
    if (!character) return;

    try {
      const base64Img = await this.getBase64ImageFromURL(character.image);

      const docDefinition: any = {
        content: [
          {
            image: base64Img,
            width: 180,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: character.name,
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 10],
            color: '#2c3e50'
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: `${character.status} - ${character.species}`,
                    alignment: 'center',
                    color: 'white',
                    fillColor: '#27ae60',
                    bold: true,
                    fontSize: 12,
                    margin: [0, 4, 0, 4]
                  }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 1,
                lineColor: '#cccccc'
              }
            ],
            margin: [0, 10, 0, 10]
          },
          {
            columns: [
              { width: '45%', text: 'Origen:', style: 'label' },
              { width: '*', text: character.origin.name, style: 'value' }
            ]
          },
          {
            columns: [
              { width: '45%', text: 'Última ubicación:', style: 'label' },
              { width: '*', text: character.location?.name || '-', style: 'value' }
            ]
          },
          {
            columns: [
              { width: '45%', text: 'Primera aparición:', style: 'label' },
              { width: '*', text: this.firstEpisodeName || '-', style: 'value' }
            ]
          }
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true
          },
          label: {
            fontSize: 11,
            color: '#7f8c8d',
            bold: true,
            margin: [0, 2, 0, 2]
          },
          value: {
            fontSize: 12,
            color: '#2c3e50',
            margin: [0, 2, 0, 2]
          }
        }
      };

      pdfMake.createPdf(docDefinition).download(`${character.name}.pdf`);
    } catch (err) {
      console.error('Error al convertir imagen a base64', err);
    }
  }
}
