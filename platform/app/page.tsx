'use client';

import Link from 'next/link';
import { ChartBarIcon, GlobeAltIcon, ArrowTrendingUpIcon, MapIcon, ChartPieIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stats = [
  { label: 'Countries', value: '200+', icon: GlobeAltIcon },
  { label: 'Years of Data', value: '60+', icon: ChartBarIcon },
  { label: 'Data Points', value: '12K+', icon: SparklesIcon },
];

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

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/90 to-purple-800/90"></div>
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
              opacity: [0.3, 0.5]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="absolute inset-0 bg-gradient-conic from-blue-500/30 via-transparent to-transparent bg-[length:50%_50%] bg-no-repeat"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="inline-block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Explore Global Population
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Trends & Insights
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover powerful insights into population dynamics across countries and time periods with interactive visualizations and comprehensive analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MapIcon className="h-6 w-6 mr-2" />
                Explore Dashboard
              </Link>
              <a
                href="#features"
                className="inline-flex items-center px-8 py-4 rounded-full bg-white/10 text-white font-semibold text-lg hover:bg-white/20 backdrop-blur-sm transition-all transform hover:scale-105"
              >
                <SparklesIcon className="h-6 w-6 mr-2" />
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Animated Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce mx-auto"></div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
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
    </div>
  );
}
