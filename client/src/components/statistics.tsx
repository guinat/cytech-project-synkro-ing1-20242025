import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";

export function Statistics() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            Our Impact
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Synkro is making homes smarter, more efficient, and more sustainable across the globe.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
            >
              <h3 className="text-primary text-lg font-medium flex items-center justify-center">
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2}
                />
                <span className="ml-1">{stat.unit}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  {
    value: 120,
    unit: "K+",
    label: "Smart homes",
  },
  {
    value: 15,
    unit: "%",
    label: "Average energy saved",
  },
  {
    value: 95,
    unit: "%",
    label: "Customer satisfaction",
  },
  {
    value: 42,
    unit: "K",
    label: "Tons of CO₂ reduced",
  },
]; 