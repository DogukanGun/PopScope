import { motion } from 'framer-motion';
import { ChartBarIcon, GlobeAltIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Interactive World Map',
    description: 'Visualize population data across different regions with our interactive world map interface',
    icon: GlobeAltIcon,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep dive into population trends with comprehensive growth metrics and comparative analysis',
    icon: ChartBarIcon,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Regional Insights',
    description: 'Compare population distributions and growth patterns across different continents',
    icon: ChartPieIcon,
    gradient: 'from-orange-500 to-red-500'
  }
];

export default function FeaturesSection() {
  return (
    <div id="features" className="relative py-32 bg-gradient-to-b from-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Powerful Analytics Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to analyze and understand global population trends
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000`}></div>
              <div className="relative p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-6`}>
                  <feature.icon className="h-full w-full text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 