import { HoverEffect } from "@/components/ui/card-hover-effect";

export default function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-xl font-medium text-center text-primary/80 mb-8">Trusted By</h2>
      <HoverEffect items={projects} />
    </div>
  );
}

export const projects = [
  {
    title: "Smart Automation",
    description:
      "Schedule personalized routines for your home and let Synkro handle the rest.",
    
  },
  {
    title: "Energy Savings",
    description:
      "Reduce your energy consumption with our intelligent optimization algorithms.",
    
  },
  {
    title: "Remote Control",
    description:
      "Control all your connected devices from anywhere in the world.",
    
  },
  {
    title: "Advanced Security",
    description:
      "Protect your home with our connected security system and real-time notifications.",

  },
  {
    title: "Detailed Analytics",
    description:
      "Visualize and analyze your consumption data with intuitive charts.",

  },
  {
    title: "Multi-User Access",
    description:
      "Share access to your smart home with your family and friends.",

  },
]; 