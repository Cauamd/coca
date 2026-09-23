"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// viewBox fixo: 1280 x 720.

// Fronteira compartilhada entre preto e vermelho — evita gap entre as duas formas.
const BOUNDARY_CURVE =
  "C120,175 180,120 300,140 C430,162 470,205 560,210 " +
  "C660,215 700,175 800,180 C900,185 940,225 1020,220 " +
  "C1110,214 1140,160 1200,150 C1230,145 1260,150 1280,155";

// Fronteira compartilhada entre vermelho e branco.
const RED_WHITE_BOUNDARY =
  "C1150,660 1080,690 960,650 C860,617 760,615 660,650 " +
  "C540,692 380,660 260,620 C160,588 60,600 0,610";

// Onda preta: do topo até a fronteira com o vermelho. Sempre estática.


// Onda vermelha: da fronteira com o preto até a fronteira com o branco.
const RED_PATH = `M0,205 ${BOUNDARY_CURVE} L1280,610 ${RED_WHITE_BOUNDARY} Z`;

// Onda branca: nasce na MESMA fronteira onde o vermelho termina, mas se estende
// bem além da base do viewBox (até 1400, bem abaixo dos 720 visíveis) — assim,
// mesmo subindo junto com o vermelho, ela nunca deixa de cobrir tudo atrás dela.
const WHITE_PATH = `M0,610 ${RED_WHITE_BOUNDARY} L1280,1400 L0,1400 Z`;

const springTransition = {
  type: "spring" as const,
  stiffness: 45,
  damping: 16,
  mass: 1,
};

export default function CocaColaLoginWave() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  function handleSubmit() {
    setIsTransitioning(true);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Fundo: branco -> preto (só relevante para a área acima da onda preta, no topo) */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: isTransitioning ? "#ffffff" : "#ffffff" }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
        <svg width="260" height="80" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
          <text
            x="130"
            y="52"
            textAnchor="middle"
            fontFamily="'Brush Script MT', 'Segoe Script', cursive"
            fontSize="46"
            fill="#E00000"
          >
            Coca-Cola
          </text>
        </svg>
      </div>

      {/* Onda preta — estática */}


      {/* Vermelho e branco sobem JUNTOS, no mesmo <motion.g>, com a mesma
          animação — assim ficam sempre grudados, sem vão preto entre eles */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-20"
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
      >
        <motion.g
          initial={false}
          animate={{ y: isTransitioning ? -190 : 0 }}
          transition={springTransition}
        >
          <path d={WHITE_PATH} fill="#FFFFFF" />
          <path d={RED_PATH} fill="#FF3B3B" />
        </motion.g>
      </motion.svg>

      {/* Pílulas — só no Estado 1 */}
      <AnimatePresence>
        {!isTransitioning && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
            style={{ paddingTop: "60px" }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <input
              type="text"
              placeholder="Usuário"
              className="w-64 h-12 rounded-full bg-white px-5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-64 h-12 rounded-full bg-white px-5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
            />
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-48 h-9 rounded-full bg-white text-sm font-semibold text-red-600 shadow-[0_6px_16px_rgba(0,0,0,0.2)] cursor-pointer"
            >
              Entrar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo pós-transição — placeholder */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <span className="text-white text-lg font-medium">Carregando dashboard...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}