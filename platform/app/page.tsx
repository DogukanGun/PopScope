'use client';

import FeaturesSection from './components/dashboard/FeaturesSection';
import HeroSection from './components/dashboard/HeroSection';
import StatsSection from './components/dashboard/StatsSection';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
