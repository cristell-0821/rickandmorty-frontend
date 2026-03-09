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

    // ---- Estrellas (hyperspace) ----
    const STAR_COUNT = 400;
    const SPEED = 2.8;

    interface Star {
      x: number; y: number; z: number;
      prevX: number; prevY: number;
    }

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * width,
      prevX: 0, prevY: 0
    }));

    // ---- Nebulosas (blobs de color suave) ----
    interface Nebula {
      x: number; y: number;
      r: number;
      color: string;
      opacity: number;
      speed: number;
      angle: number;
    }

    const nebulas: Nebula[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 180 + Math.random() * 220,
      color: Math.random() > 0.5 ? '68,215,232' : '57,255,20',
      opacity: 0.03 + Math.random() * 0.04,
      speed: 0.1 + Math.random() * 0.15,
      angle: Math.random() * Math.PI * 2
    }));

    // ---- Partículas flotantes ----
    interface Particle {
      x: number; y: number;
      size: number;
      opacity: number;
      speedX: number; speedY: number;
      pulse: number; pulseSpeed: number;
    }

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    }));

    const CX = () => width / 2;
    const CY = () => height / 2;

    function drawFrame() {
      // Fondo con trail
      ctx.fillStyle = 'rgba(6, 11, 20, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // --- Nebulosas ---
      for (const n of nebulas) {
        n.angle += n.speed * 0.005;
        n.x += Math.cos(n.angle) * n.speed * 0.3;
        n.y += Math.sin(n.angle) * n.speed * 0.3;

        // Wrap around
        if (n.x < -n.r) n.x = width + n.r;
        if (n.x > width + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = height + n.r;
        if (n.y > height + n.r) n.y = -n.r;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `rgba(${n.color},${n.opacity})`);
        grad.addColorStop(1, `rgba(${n.color},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // --- Partículas flotantes ---
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // --- Estrellas hyperspace ---
      for (const star of stars) {
        star.prevX = (star.x / star.z) * width + CX();
        star.prevY = (star.y / star.z) * height + CY();
        star.z -= SPEED;

        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
          star.prevX = (star.x / star.z) * width + CX();
          star.prevY = (star.y / star.z) * height + CY();
        }

        const sx = (star.x / star.z) * width + CX();
        const sy = (star.y / star.z) * height + CY();
        const size = Math.max(0.3, (1 - star.z / width) * 3.5);
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

        // Punto
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Glow cercanas
        if (progress > 0.7) {
          ctx.beginPath();
          ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.12})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(drawFrame);
    }

    drawFrame();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }
}
