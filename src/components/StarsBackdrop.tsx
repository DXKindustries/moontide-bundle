
import React from 'react';

const StarsBackdrop = () => {
  // Create an array of star positions
  const generateStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.7 + 0.3;
      
      stars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        opacity,
        animationDelay: `${Math.random() * 3}s`,
      });
    }
    return stars;
  };

  const stars = generateStars(150);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackdrop;
