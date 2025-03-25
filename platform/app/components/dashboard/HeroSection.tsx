import Link from 'next/link';
import { MapIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
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
  );
} 