import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    title: "Solar Panel Installations",
    subtitle: "Harness the power of the sun for your home or business",
    category: "☀️ Solar",
    ctaText: "View Solar Projects",
    ctaLink: "/solar",
    gradient: "from-amber-600/70 to-orange-500/50"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80",
    title: "Electrical Engineering Excellence",
    subtitle: "Safe, modern, and code-compliant electrical systems",
    category: "⚡ Electrical",
    ctaText: "View Electrical Work",
    ctaLink: "/electrical",
    gradient: "from-blue-800/70 to-blue-400/50"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80",
    title: "Commercial Solar Farms",
    subtitle: "Large-scale solar solutions for businesses and industries",
    category: "☀️ Solar",
    ctaText: "Explore Solutions",
    ctaLink: "/solar",
    gradient: "from-amber-600/70 to-orange-500/50"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
    title: "Expert Electrical Engineering",
    subtitle: "Professional electrical design, installation, and maintenance",
    category: "⚡ Electrical",
    ctaText: "Our Services",
    ctaLink: "/services",
    gradient: "from-blue-800/70 to-cyan-400/50"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1200&q=80",
    title: "Solar Installation Teams",
    subtitle: "Certified professionals ensuring quality and safety",
    category: "☀️ Solar",
    ctaText: "Meet Our Team",
    ctaLink: "/about",
    gradient: "from-emerald-600/70 to-teal-500/50"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=1200&q=80",
    title: "Industrial Electrical Solutions",
    subtitle: "Heavy-duty electrical systems for industrial applications",
    category: "⚡ Electrical",
    ctaText: "View Industrial Work",
    ctaLink: "/electrical",
    gradient: "from-blue-800/70 to-blue-400/50"
  }
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5, ease: 'easeIn' }
    })
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />
          <div className="absolute inset-0 bg-electrical-grid opacity-30" />
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient}`} />
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full">
              <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="#60a5fa" strokeWidth="2" />
              <line x1="30%" y1="40%" x2="60%" y2="30%" stroke="#60a5fa" strokeWidth="2" />
              <line x1="60%" y1="30%" x2="80%" y2="50%" stroke="#60a5fa" strokeWidth="2" />
              <line x1="80%" y1="50%" x2="70%" y2="70%" stroke="#60a5fa" strokeWidth="2" />
              <circle cx="30%" cy="40%" r="4" fill="#60a5fa" opacity="0.5" />
              <circle cx="60%" cy="30%" r="4" fill="#60a5fa" opacity="0.5" />
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
              {currentSlide.category}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight text-shadow-glow">
              {currentSlide.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              {currentSlide.subtitle}
            </p>
            <Link to={currentSlide.ctaLink}>
              <button className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                {currentSlide.ctaText} →
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110">
        <ChevronLeft size={28} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110">
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-10 bg-blue-400' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
      <div className="absolute bottom-8 right-8 text-white/60 text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroCarousel;