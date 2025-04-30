import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackgroundBeamsWithCollisionDemo from "@/components/background-beams-with-collision-demo";
import CardHoverEffectDemo from "@/components/card-hover-effect-demo";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const TEAM = [
  { name: "Nathan", role: "Developer", avatar: "NJ" },
  { name: "Matias", role: "Developer", avatar: "MD" },
  { name: "Alice", role: "Design & Dev", avatar: "AL" },
  { name: "Kylian", role: "Developer", avatar: "KD" },
  { name: "Younes", role: "Developer", avatar: "YD" },
];

const STATS = [
  { label: "Users", value: "+1 200" },
  { label: "Connected Homes", value: "+350" },
  { label: "Automated Routines", value: "+7 000" },
  { label: "Energy Savings", value: "-22%" },
];

const FEATURES = [
  {
    title: "Smart Automation",
    description: "Schedule and let Synkro manage your routines for you.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Consumption Tracking",
    description: "Visualize and optimize your energy consumption in real time.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 8h8v8H8z" />
      </svg>
    ),
  },
  {
    title: "Security & Control",
    description: "Keep control of your home, wherever you are.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
];

const FAQ = [
  {
    author: "TG",
    name: "Taisa Guidini",
    question: "Does Synkro work with all connected devices?",
    answer: "Yes! Synkro is compatible with most connected devices on the market (lights, thermostats, shutters, etc.) and the list continues to grow.",
  },
  {
    author: "EA",
    name: "Eva Ansermin",
    question: "Can I control my home remotely?",
    answer: "Absolutely! The Synkro app allows you to control your home from anywhere, from your smartphone or computer.",
  },
  {
    author: "RG",
    name: "Romuald Grignon",
    question: "Is my data secure?",
    answer: "Yes, your data security is a priority. All information is encrypted and strictly confidential.",
  },
];

const LandingPage = () => {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      const animationRatio = Math.pow(scrollRatio, 0.7);
      
      if (logoRef.current) {
        const scale = 1 + (animationRatio * 1.5);
        const translateY = -animationRatio * 120;
        logoRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
        logoRef.current.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)';
        logoRef.current.style.willChange = 'transform';
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statsSectionRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsSectionRef, { once: true, amount: 0.4 });

  return (
    <div className="bg-white text-primary min-h-screen w-full font-sans">
      {/* Hero Section with Background Beams */}
      <BackgroundBeamsWithCollisionDemo />
      
      {/* Main Hero Content */}
      <section className="flex flex-col items-center justify-center h-screen relative z-10 px-4 -mt-[100vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 tracking-tight">
            SYNKRO
          </h1>
          <p className="text-base md:text-lg text-primary/80 mb-8 leading-relaxed mx-auto max-w-md">
            Manage, monitor, and optimize your connected home with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="px-6 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-all duration-300"
              onClick={() => window.location.href = '/discover'}
            >
              Discover Synkro
            </Button>
            <Button 
              variant="outline" 
              className="px-6 py-2 text-sm rounded-md border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              onClick={() => window.location.href = '/auth/sign_up'}
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </section>
      
      {/* Features Demo Cards */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-medium text-center text-primary/80 mb-2">Our Solutions</h2>
          <CardHoverEffectDemo />
        </div>
      </section>
      
      {/* Stats Section */}
      <motion.section
        ref={statsSectionRef}
        className="py-16 px-4 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-medium text-center text-primary/80 mb-10">Key Metrics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(stat => {
              const match = stat.value.match(/([\d\s]+)/);
              let num = 0;
              if (match) {
                num = parseInt(match[1].replace(/\s/g, ""), 10);
              }
              const isPercent = stat.value.includes('%');
              
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card key={stat.label} className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <CardContent className="flex flex-col items-center p-4">
                      <span className="text-2xl font-bold text-primary my-2">
                        <AnimatedCounter
                          value={num}
                          duration={1.2}
                          className="inline-block"
                          trigger={!!statsInView}
                          format={n =>
                            stat.value.startsWith("+") ?
                              "+" + n.toLocaleString("en-US") + (isPercent ? "%" : "") :
                            stat.value.startsWith("-") ?
                              "-" + n.toLocaleString("en-US") + (isPercent ? "%" : "") :
                              n.toLocaleString("en-US") + (isPercent ? "%" : "")
                          }
                        />
                      </span>
                      <span className="text-sm text-primary/70">{stat.label}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section
        id="features"
        className="py-16 px-4 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-medium text-center text-primary/80 mb-10">Why Synkro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="border border-gray-100 rounded-md p-6 hover:border-primary/30 hover:shadow-sm transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="p-2 bg-primary/5 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-base font-medium text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-primary/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-medium text-center text-primary/80 mb-10">Our Team</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
            {TEAM.map((member, index) => (
              <motion.div
                key={member.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
              >
                <Avatar className="w-14 h-14 border border-primary/20 mb-2">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-medium text-primary">{member.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs bg-transparent border-primary/20 text-primary/70">
                  {member.role}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 px-4 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-medium text-center text-primary/80 mb-8">FAQ</h2>
          
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50">
              <TabsTrigger value="tab1" className="text-xs">Compatibility</TabsTrigger>
              <TabsTrigger value="tab2" className="text-xs">Usage</TabsTrigger>
              <TabsTrigger value="tab3" className="text-xs">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tab1" className="space-y-4">
              <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-4 px-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {FAQ[0].author}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-primary">{FAQ[0].name}</p>
                      <p className="text-sm text-primary mt-1">{FAQ[0].question}</p>
                      <p className="text-xs text-primary/70 mt-1 leading-relaxed">{FAQ[0].answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tab2" className="space-y-4">
              <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-4 px-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {FAQ[1].author}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-primary">{FAQ[1].name}</p>
                      <p className="text-sm text-primary mt-1">{FAQ[1].question}</p>
                      <p className="text-xs text-primary/70 mt-1 leading-relaxed">{FAQ[1].answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tab3" className="space-y-4">
              <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-4 px-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {FAQ[2].author}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-primary">{FAQ[2].name}</p>
                      <p className="text-sm text-primary mt-1">{FAQ[2].question}</p>
                      <p className="text-xs text-primary/70 mt-1 leading-relaxed">{FAQ[2].answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-medium text-primary mb-3">Ready to transform your home?</h2>
            <p className="text-sm text-primary/70 mb-6">Join the Synkro community and take control of your living space.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="px-6 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-all duration-300"
                onClick={() => window.location.href = '/auth/sign_up'}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-2 text-sm rounded-md border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                onClick={() => window.location.href = '/discover'}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-primary mb-3">Synkro</h3>
              <p className="text-xs text-primary/70">Smart home solution</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary mb-3">Product</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary mb-3">Resources</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary mb-3">Legal</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-gray-100 mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-primary/70">© 2025 Synkro. All rights reserved.</p>
            <div className="flex gap-3">
              <a href="#" className="text-primary/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-primary/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-primary/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Styles d'animation */}
      <style>{`
        @keyframes fade-in-up-scroll {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up-scroll { opacity: 0; animation: fade-in-up-scroll 0.8s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up-scroll.delay-150 { animation-delay: .15s; }
        .animate-fade-in-up-scroll.delay-300 { animation-delay: .3s; }
      `}</style>
    </div>
  );
};

export default LandingPage;