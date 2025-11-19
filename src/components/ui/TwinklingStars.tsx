import React, { useState, useEffect } from "react";
import {motion,} from "framer-motion";
const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 80}%`,
      size: `${Math.random() * 3.5 + 0.5}px`,
      duration: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[white] rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity, star.opacity + 0.5, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}
    </>
  );
}

export default TwinklingStars