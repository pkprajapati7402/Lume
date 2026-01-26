'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Star {
  id: number;
  size: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
}

interface Particle {
  id: number;
  size: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
}

interface ShootingStar {
  id: number;
  delay: number;
  duration: number;
  left: string;
  top: string;
}

export default function AnimatedBackground() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Generate shooting stars
    const shootingStarsData = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 1 + Math.random() * 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`
    }));
    setShootingStars(shootingStarsData);

    // Generate floating particles
    const particlesData = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
    setParticles(particlesData);

    // Generate starfield
    const starsData = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 2 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.7
    }));
    setStars(starsData);

    setIsMounted(true);
  }, []);

  // Don't render animated elements until mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - static elements are safe */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-20 right-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5), 0 0 20px 4px rgba(147, 51, 234, 0.3)'
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, -100, -200],
            y: [0, 100, 200],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 8 + Math.random() * 5,
            ease: "easeOut"
          }}
        >
          {/* Shooting star tail */}
          <div className="absolute w-20 h-px bg-gradient-to-r from-white to-transparent opacity-70" 
               style={{ 
                 transform: 'rotate(-45deg)',
                 transformOrigin: 'left center'
               }} 
          />
        </motion.div>
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Starfield - Blinking Stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)` : 'none'
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Animated Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating Icons/Illustrations */}
      <motion.div
        className="absolute left-[10%] top-[20%] w-16 h-16 opacity-20"
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[15%] top-[30%] w-12 h-12 opacity-20"
        animate={{
          y: [10, -10, 10],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-400">
          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-[20%] bottom-[25%] w-14 h-14 opacity-20"
        animate={{
          y: [-15, 15, -15],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyan-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[25%] bottom-[20%] w-10 h-10 opacity-20"
        animate={{
          y: [12, -12, 12],
          x: [-5, 5, -5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h.01M15 10h.01M9.5 15.5c1 1 2.5 1.5 2.5 1.5s1.5-.5 2.5-1.5" />
        </svg>
      </motion.div>

      {/* Pulse Rings */}
      <motion.div
        className="absolute left-1/4 top-1/3 w-32 h-32 rounded-full border-2 border-purple-500/20"
        animate={{
          scale: [1, 2, 2],
          opacity: [0.5, 0.2, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
      <motion.div
        className="absolute right-1/3 bottom-1/3 w-40 h-40 rounded-full border-2 border-blue-500/20"
        animate={{
          scale: [1, 2.5, 2.5],
          opacity: [0.5, 0.2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1
        }}
      />

      {/* Sparkles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() < 0.5 ? 2 : 3,
            height: Math.random() < 0.5 ? 2 : 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: Math.random() < 0.5 ? '#ffffff' : Math.random() < 0.7 ? '#a78bfa' : '#60a5fa',
            boxShadow: '0 0 8px currentColor'
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1.5, 0]
          }}
          transition={{
            duration: 1.5 + Math.random() * 2,
            delay: Math.random() * 8,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 4
          }}
        />
      ))}
    </div>
  );
}
