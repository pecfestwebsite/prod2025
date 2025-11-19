"use client";

import { useEffect } from "react";

export default function Cursor() {
  useEffect(() => {
    // -----------------------------
    // SETUP CANVAS
    // -----------------------------
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouseX = 0;
    let mouseY = 0;
    const isMobile = window.innerWidth <= 768;

    // Track cursor position for the Aladdin sprite
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);

      mouseX = e.clientX;
      mouseY = e.clientY;

      // Only add particles on mousemove for desktop
      if (!isMobile) {
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: mouseX,
            y: mouseY,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            size: Math.random() * 4 + 2,
          });
        }
      }
    };

    // Handle touch events for mobile
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0] || e.changedTouches[0];
      if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;

        // Add particles on touch
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: mouseX,
            y: mouseY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1,
            size: Math.random() * 5 + 3,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch);
    window.addEventListener("touchmove", handleTouch);

    // -----------------------------
    // PARTICLE SYSTEM
    // -----------------------------
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
    }[] = [];

    // -----------------------------
    // ANIMATION LOOP
    // -----------------------------
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.size *= 0.97;

        // Golden sand glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 215, 130, ${p.life})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255,200,120,0.8)";
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  return (
    <>
      {/* Particle trail canvas (behind Aladdin) */}
      <canvas
        id="particles"
        className="fixed inset-0 z-[9998] pointer-events-none"
      ></canvas>

      {/* Cursor follower (Aladdin image) - Hidden on mobile */}
      <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
        <div
          className="
            absolute
            w-[160px] h-[160px]
            flex items-center justify-center
            rounded-full
            transition-transform duration-[400ms] ease-out
            [transform:translate(calc(var(--mouse-x)-50%-20px),calc(var(--mouse-y)-50%-20px))]
          "
        >

        </div>
      </div>
    </>
  );
}