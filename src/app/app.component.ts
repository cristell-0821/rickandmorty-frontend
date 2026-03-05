import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initStarfield();
  }

  initStarfield(): void {
    const canvas = document.getElementById('starfield') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const STAR_COUNT = 280;
    const SPEED = 2.5;
    const CENTER_X = () => width / 2;
    const CENTER_Y = () => height / 2;

    interface Star {
      x: number;
      y: number;
      z: number;
      prevX: number;
      prevY: number;
    }

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * width,
      prevX: 0,
      prevY: 0
    }));

    function drawStars() {
      // Fondo con trail suave
      ctx.fillStyle = 'rgba(6, 11, 20, 0.25)';
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.prevX = (star.x / star.z) * width + CENTER_X();
        star.prevY = (star.y / star.z) * height + CENTER_Y();

        star.z -= SPEED;

        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
          star.prevX = (star.x / star.z) * width + CENTER_X();
          star.prevY = (star.y / star.z) * height + CENTER_Y();
        }

        const sx = (star.x / star.z) * width + CENTER_X();
        const sy = (star.y / star.z) * height + CENTER_Y();

        // Tamaño en base a profundidad
        const size = Math.max(0.3, (1 - star.z / width) * 3);

        // Color: cyan → verde portal según profundidad
        const progress = 1 - star.z / width;
        const r = Math.floor(57 + progress * (151 - 57));
        const g = Math.floor(215 + progress * (206 - 215));
        const b = Math.floor(232 + progress * (76 - 232));
        const alpha = Math.min(1, progress * 2.5);

        // Trail
        ctx.beginPath();
        ctx.moveTo(star.prevX, star.prevY);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.6})`;
        ctx.lineWidth = size * 0.8;
        ctx.stroke();

        // Punto de la estrella
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Glow en las más cercanas
        if (progress > 0.7) {
          ctx.beginPath();
          ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(drawStars);
    }

    drawStars();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }
}
