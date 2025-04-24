import React from "react";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen w-full font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-800 mb-6 animate-fade-in-up">Bienvenue sur Synkro</h1>
        <p className="text-lg md:text-2xl text-indigo-600 mb-10 animate-fade-in-up delay-150 text-center max-w-xl">
          Gérez, surveillez et optimisez votre maison connectée en toute simplicité.
        </p>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 animate-bounce"
          onClick={() => {}}
        >
          Essayer la démo
        </button>
        <button
          className="mt-8 text-indigo-500 hover:text-indigo-700 text-xl animate-fade-in-up delay-300 flex flex-col items-center"
          onClick={() => scrollToSection("features")}
        >
          <span>Découvrir</span>
          <svg className="w-6 h-6 animate-bounce mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>
      {/* Features Section */}
      <section id="features" className="py-24 px-4 max-w-5xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-16">Pourquoi Synkro ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Automatisation intelligente</h3>
            <p className="text-gray-600 text-center">Programmez et laissez Synkro gérer vos routines pour vous.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float-delay" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 8h8v8H8z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Suivi de la consommation</h3>
            <p className="text-gray-600 text-center">Visualisez et optimisez votre consommation d'énergie en temps réel.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <svg className="w-14 h-14 text-indigo-400 mb-4 animate-float-delay-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Sécurité & contrôle</h3>
            <p className="text-gray-600 text-center">Gardez le contrôle de votre maison, où que vous soyez.</p>
          </div>
        </div>
      </section>
      {/* Animation de fond */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-200 rounded-full opacity-30 blur-3xl animate-bg-move" style={{filter:'blur(80px)'}}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl animate-bg-move-reverse" style={{filter:'blur(90px)'}}></div>
      </div>
      {/* Styles d’animation */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up.delay-150 { animation-delay: .15s; }
        .animate-fade-in-up.delay-300 { animation-delay: .3s; }
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