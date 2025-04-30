import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const TEAM = [
  { name: "Nathan", role: "Développeur", avatar: "🧑‍💻" },
  { name: "Matias", role: "Développeur", avatar: "👨‍💻" },
  { name: "Alice", role: "Design & Dev", avatar: "👩‍🎨" },
  { name: "Kylian", role: "Développeur", avatar: "🧑‍🔬" },
  { name: "Younes", role: "Développeur", avatar: "🧑‍🚀" },
];

const STATS = [
  { label: "Utilisateurs", value: "+1 200" },
  { label: "Maisons connectées", value: "+350" },
  { label: "Routines automatisées", value: "+7 000" },
  { label: "Économie d'énergie", value: "-22%" },
];

const LandingPage = () => {
  // Animation logo on scroll
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Ratio de scroll sur toute la page (0 en haut, 1 en bas)
      const scrollRatio = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      
      // Pour un effet plus rapide au début, on peut utiliser une fonction non-linéaire
      // Cela donnera une animation qui commence plus rapidement puis ralentit
      const animationRatio = Math.pow(scrollRatio, 0.7); // Effet plus progressif
      
      if (logoRef.current) {
        // Grossissement du logo: 1x → 2.5x
        const scale = 1 + (animationRatio * 1.5);
        
        // Déplacement vers le haut: 0 → -120px (valeur plus importante pour un effet plus visible)
        const translateY = -animationRatio * 120;
        
        // Appliquer les transformations
        logoRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
        logoRef.current.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)';
        logoRef.current.style.willChange = 'transform';
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Application initiale
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statsSectionRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsSectionRef, { once: true, amount: 0.4 });

  return (
    <div className="bg-white min-h-screen w-full font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-800 mb-6 animate-fade-in-up-scroll">Bienvenue sur Synkro</h1>
        <p className="text-lg md:text-2xl text-indigo-600 mb-10 animate-fade-in-up-scroll delay-150 text-center max-w-xl">
          Gérez, surveillez et optimisez votre maison connectée en toute simplicité.
        </p>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 animate-bounce"
          onClick={() => window.location.href = '/discover'}
        >
          Découvrez nos fonctionnalités
        </button>
        <button
          className="mt-8 text-indigo-500 hover:text-indigo-700 text-xl animate-fade-in-up-scroll delay-300 flex flex-col items-center"
          onClick={() => scrollToSection("features")}
        >
          <span>Découvrir</span>
          <svg className="w-6 h-6 animate-bounce mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {/* Logo animé - replacé sous le bouton Découvrir */}
        <div className="flex justify-center mt-8">
          <img
            
            src="/synkro.svg"
            alt="Logo Synkro"
            className="w-56 h-56"
          />
        </div>
      </section>
      
      {/* Stats Section */}
      <motion.section
        ref={statsSectionRef}
        className="flex flex-wrap justify-center gap-8 py-8"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {STATS.map(stat => {
          // Extraction du nombre pour l'animation
          const match = stat.value.match(/([\d\s]+)/);
          let num = 0;
          if (match) {
            num = parseInt(match[1].replace(/\s/g, ""), 10);
          }
          const isPercent = stat.value.includes('%');
          return (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center min-w-[170px] hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="text-3xl font-bold text-indigo-700 flex items-center">
                <AnimatedCounter
                  value={num}
                  duration={1.2}
                  className="inline-block"
                  trigger={!!statsInView}
                  format={n =>
                    stat.value.startsWith("+") ?
                      "+" + n.toLocaleString("fr-FR") + (isPercent ? "%" : "") :
                    stat.value.startsWith("-") ?
                      "-" + n.toLocaleString("fr-FR") + (isPercent ? "%" : "") :
                      n.toLocaleString("fr-FR") + (isPercent ? "%" : "")
                  }
                />
              </span>
              <span className="text-md text-gray-600 mt-1">{stat.label}</span>
            </motion.div>
          );
        })}
      </motion.section>
      
      {/* Features Section */}
      <motion.section
        id="features"
        className="py-24 px-4 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-16">Pourquoi Synkro ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Automatisation intelligente</h3>
            <p className="text-gray-600 text-center">Programmez et laissez Synkro gérer vos routines pour vous.</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float-delay" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 8h8v8H8z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Suivi de la consommation</h3>
            <p className="text-gray-600 text-center">Visualisez et optimisez votre consommation d'énergie en temps réel.</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float-delay-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Sécurité & contrôle</h3>
            <p className="text-gray-600 text-center">Gardez le contrôle de votre maison, où que vous soyez.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-20 px-4 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-12">L'équipe Synkro</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {TEAM.map(member => (
            <motion.div
              key={member.name}
              className="bg-white rounded-xl shadow-lg px-12 py-10 flex flex-col items-center hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-indigo-300 shadow">
                <span aria-label="avatar" role="img">{member.avatar}</span>
              </div>
              <span className="font-semibold text-xl text-indigo-800 mb-1">{member.name}</span>
              <span className="text-gray-500 text-base">{member.role}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section FAQ */}
      <motion.section
        className="py-20 px-4 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">FAQ</h2>
        <div className="space-y-8">
          <div className="bg-indigo-50 rounded-xl p-6 shadow flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700">TG</div>
            <div>
              <div className="font-semibold text-indigo-900">Taisa Guidini</div>
              <div className="text-indigo-800 mt-1">Est-ce que Synkro fonctionne avec tous les appareils connectés&nbsp;?</div>
              <div className="text-gray-600 mt-2">Bien sûr ! Synkro est compatible avec la majorité des objets connectés du marché (lumières, thermostats, volets, etc.) et la liste s’agrandit régulièrement.</div>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 shadow flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700">EA</div>
            <div>
              <div className="font-semibold text-indigo-900">Eva Ansermin</div>
              <div className="text-indigo-800 mt-1">Est-ce que je peux contrôler ma maison à distance&nbsp;?</div>
              <div className="text-gray-600 mt-2">Absolument ! L’application Synkro vous permet de piloter votre maison où que vous soyez, depuis votre smartphone ou ordinateur.</div>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 shadow flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700">RG</div>
            <div>
              <div className="font-semibold text-indigo-900">Romuald Grignon</div>
              <div className="text-indigo-800 mt-1">Est-ce que mes données sont sécurisées&nbsp;?</div>
              <div className="text-gray-600 mt-2">Oui, la sécurité de vos données est une priorité. Toutes les informations sont chiffrées et strictement confidentielles.</div>
            </div>
          </div>
        </div>
        {/* Call to action final */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-indigo-800 mb-6">Convaincu&nbsp;?</h3>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300"
            onClick={() => window.location.href = '/auth/sign_up'}
          >
            Inscrivez vous Maintenant 
          </button>
        </div>
      </motion.section>
      
      {/* Optionnel : tu peux garder ou retirer les blobs animés pour un style plus "moderne blanc" épuré */}
      {/* <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-200 rounded-full opacity-30 blur-3xl animate-bg-move" style={{filter:'blur(80px)'}}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl animate-bg-move-reverse" style={{filter:'blur(90px)'}}></div>
      </div> */}
      
      {/* Styles d'animation */}
      <style>{`
        @keyframes fade-in-up-scroll {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up-scroll { opacity: 0; animation: fade-in-up-scroll 1s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up-scroll.delay-150 { animation-delay: .15s; }
        .animate-fade-in-up-scroll.delay-300 { animation-delay: .3s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delay { animation: float 3s ease-in-out infinite; animation-delay: 1s; }
        .animate-float-delay-2 { animation: float 3s ease-in-out infinite; animation-delay: 2s; }
        
        @keyframes bg-move {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(60px) scale(1.1); }
        }
        .animate-bg-move { animation: bg-move 8s ease-in-out infinite; }
        .animate-bg-move-reverse { animation: bg-move 10s ease-in-out infinite reverse; }
      `}</style>
    </div>
  );
};

export default LandingPage;