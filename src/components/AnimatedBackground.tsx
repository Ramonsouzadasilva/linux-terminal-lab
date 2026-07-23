import React, { useEffect, useRef } from 'react';
import { OSTheme } from '../types';

interface AnimatedBackgroundProps {
  theme: OSTheme;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // MATRIX CODE RAIN
    let columns = Math.floor(width / 20);
    let drops: number[] = Array(columns).fill(1);
    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>@#$%&*+-/='.split('');

    // COSMIC STARS
    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      alpha: number;
      increasing: boolean;
    }
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.05 + 0.01,
      alpha: Math.random(),
      increasing: Math.random() > 0.5
    }));

    // CYBERPUNK GRID SPEED
    let gridOffset = 0;

    // KALI CYBER WAVES
    let waveOffset = 0;

    // ANIMATION LOOP
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';

      if (theme === 'matrix') {
        // Semi-transparent black bg to create fade trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00ff00';
        ctx.font = '15px monospace';

        // Recalculate columns if width changed
        if (drops.length < Math.floor(width / 20)) {
          columns = Math.floor(width / 20);
          drops = Array(columns).fill(1);
        }

        for (let i = 0; i < drops.length; i++) {
          const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * 20;
          const y = drops[i] * 20;

          // Random brighter head characters
          if (Math.random() > 0.98) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = '#00ff55';
          }

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } 
      else if (theme === 'cyberpunk') {
        // Neon dark cyberpunk bg
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0a0518');
        grad.addColorStop(1, '#020108');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cyber Grid Perspective lines
        ctx.strokeStyle = 'rgba(219, 39, 119, 0.15)'; // Deep pink
        ctx.lineWidth = 1.5;

        // Draw horizontal receding lines
        gridOffset = (gridOffset + 1) % 40;
        const horizon = height * 0.5;

        for (let y = horizon; y < height; y += 30) {
          const ratio = (y - horizon) / (height - horizon);
          // Perspective spacing
          const screenY = horizon + ratio * ratio * (height - horizon) + gridOffset * ratio;
          if (screenY < height) {
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();
          }
        }

        // Draw vertical perspective rays
        const rayCount = 30;
        const centerX = width / 2;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / (rayCount - 1)) * Math.PI - Math.PI;
          const targetX = centerX + Math.cos(angle) * width * 1.5;
          ctx.beginPath();
          ctx.moveTo(centerX, horizon);
          ctx.lineTo(targetX, height);
          ctx.stroke();
        }

        // Sun disc
        const sunRadius = 90;
        const sunY = horizon - 20;
        const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
        sunGrad.addColorStop(0, '#ff007f');
        sunGrad.addColorStop(1, '#ffaa00');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, sunY, sunRadius, 0, Math.PI, true);
        ctx.fill();

        // Cyberpunk synth lines in sun
        ctx.fillStyle = '#0a0518';
        for (let sy = sunY - 40; sy > sunY - sunRadius; sy -= 12) {
          const stripeHeight = Math.max(1, (sunY - sy) * 0.08);
          ctx.fillRect(centerX - sunRadius - 10, sy, sunRadius * 2 + 20, stripeHeight);
        }
      } 
      else if (theme === 'cosmic') {
        // Space cosmic stars bg
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#020212');
        grad.addColorStop(0.5, '#05041a');
        grad.addColorStop(1, '#0d0d2a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Nebulae glow
        const nebulaGrad = ctx.createRadialGradient(width * 0.7, height * 0.3, 50, width * 0.7, height * 0.3, 300);
        nebulaGrad.addColorStop(0, 'rgba(112, 26, 117, 0.12)'); // Purple
        nebulaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)'); // Blue
        nebulaGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, width, height);

        const nebulaGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 50, width * 0.2, height * 0.7, 250);
        nebulaGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.1)'); // Cyan
        nebulaGrad2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebulaGrad2;
        ctx.fillRect(0, 0, width, height);

        // Draw stars
        stars.forEach(star => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();

          // Speed twinkle
          if (star.increasing) {
            star.alpha += star.speed;
            if (star.alpha >= 0.95) star.increasing = false;
          } else {
            star.alpha -= star.speed;
            if (star.alpha <= 0.15) star.increasing = true;
          }
        });
      } 
      else if (theme === 'kali') {
        // Kali linux dark technological look
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0f172a'); // Slate 900
        grad.addColorStop(1, '#020617'); // Slate 950
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Tech network connections / cyber nodes background
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)'; // Cyan subtle lines
        ctx.lineWidth = 1;
        
        // Draw grid
        const spacing = 60;
        for (let x = 0; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw a technological abstract security wave
        waveOffset += 0.01;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const y = height * 0.8 + Math.sin(x * 0.003 + waveOffset) * 45 + Math.cos(x * 0.008 + waveOffset * 0.5) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)'; // Pink secondary wave
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const y = height * 0.82 + Math.cos(x * 0.004 - waveOffset * 0.7) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Abstract security binary HUD in corners
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.font = '10px monospace';
        ctx.fillText('SYS_SEC: SECURE', 20, 30);
        ctx.fillText('LOCAL_ADDR: 127.0.0.1', 20, 45);
        ctx.fillText('PREVIEW_MODE: LAB_CONTAINER', 20, 60);

        ctx.fillText('VIRTUAL_OS: KALI_K3RNEL', width - 160, 30);
        ctx.fillText('SHIELD_STATUS: ACTIVE', width - 160, 45);
      } 
      else if (theme === 'ubuntu') {
        // Ubuntu classic aubergine gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#4f1937'); // Classic aubergine
        grad.addColorStop(0.6, '#310f22');
        grad.addColorStop(1, '#e95420'); // Orange highlight
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Soft orange glowing blobs
        const glow = ctx.createRadialGradient(width * 0.9, height * 0.9, 0, width * 0.9, height * 0.9, 400);
        glow.addColorStop(0, 'rgba(233, 84, 32, 0.25)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      } 
      else {
        // minimal
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#f8fafc'); // Slate 50
        grad.addColorStop(1, '#e2e8f0'); // Slate 200
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle professional grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.015)';
        ctx.lineWidth = 1;
        const spacing = 40;
        for (let x = 0; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block -z-10 select-none pointer-events-none"
    />
  );
};
