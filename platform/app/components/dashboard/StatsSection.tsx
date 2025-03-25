import { motion } from 'framer-motion';
import { ChartBarIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const stats = [
  { label: 'Countries', value: '200+', icon: GlobeAltIcon },
  { label: 'Years of Data', value: '60+', icon: ChartBarIcon },
  { label: 'Data Points', value: '12K+', icon: SparklesIcon },
];

export default function StatsSection() {
  return (
    <div className='relative py-32 bg-gradient-to-b from-gray-900 to-black'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Comprehensive Global Insights
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unlock the power of data to understand worldwide trends and patterns
          </p>
        </motion.div>
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto ">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative p-8 bg-white/10 backdrop-blur-sm rounded-lg">
                <stat.icon className="h-8 w-8 mb-4 text-blue-200" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

  );
} 