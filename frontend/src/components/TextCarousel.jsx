import React, { useEffect, useState } from 'react';

const messages = [
  "Prenota visite ed esami online in pochi click",
  "Scegli la data che preferisci",
  "Ricevi conferma immediata via email",
  "Evita le code e risparmia tempo",
  "Gestisci tutto dal tuo smartphone",
  "Sincronizza con il tuo calendario",
];

const TextCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-carousel-container">
      <p className="text-carousel-text text-white/90 font-medium">
        {messages[index]}
      </p>
    </div>
  );
};

export default TextCarousel;