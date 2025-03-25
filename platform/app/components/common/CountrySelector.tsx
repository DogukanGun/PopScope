'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiService, { Country } from '@/app/lib/services/api';

interface CountryWithContinent extends Country {
  continent: string;
}

interface CountrySelectorProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

const continents = [
  { name: 'Asia', color: 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50' },
  { name: 'Europe', color: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50' },
  { name: 'North America', color: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50' },
  { name: 'South America', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50' },
  { name: 'Africa', color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50' },
  { name: 'Oceania', color: 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/50' },
];

// Map of country codes to their continents
const countryToContinentMap: { [key: string]: string } = {
  // Asia
  'CHN': 'Asia', 'IND': 'Asia', 'IDN': 'Asia', 'PAK': 'Asia', 'BGD': 'Asia', 
  'JPN': 'Asia', 'PHL': 'Asia', 'VNM': 'Asia', 'TUR': 'Asia', 'IRN': 'Asia',
  // Europe
  'DEU': 'Europe', 'FRA': 'Europe', 'GBR': 'Europe', 'ITA': 'Europe', 'ESP': 'Europe',
  'POL': 'Europe', 'ROU': 'Europe', 'NLD': 'Europe', 'BEL': 'Europe', 'GRC': 'Europe',
  // North America
  'USA': 'North America', 'CAN': 'North America', 'MEX': 'North America',
  // South America
  'BRA': 'South America', 'COL': 'South America', 'ARG': 'South America', 'PER': 'South America',
  'VEN': 'South America', 'CHL': 'South America', 'ECU': 'South America', 'BOL': 'South America',
  'PRY': 'South America', 'URY': 'South America',
  // Africa
  'NGA': 'Africa', 'ETH': 'Africa', 'EGY': 'Africa', 'COD': 'Africa', 'TZA': 'Africa',
  'ZAF': 'Africa', 'KEN': 'Africa', 'UGA': 'Africa', 'DZA': 'Africa', 'SDN': 'Africa',
  // Oceania
  'AUS': 'Oceania', 'PNG': 'Oceania', 'NZL': 'Oceania', 'FJI': 'Oceania', 'SLB': 'Oceania',
  'VUT': 'Oceania', 'NCL': 'Oceania', 'PYF': 'Oceania', 'WSM': 'Oceania', 'GUM': 'Oceania'
};

const CountrySelector = ({ selectedCountries, onCountriesChange }: CountrySelectorProps) => {
  const [countries, setCountries] = useState<CountryWithContinent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiService.getCountries();
        const countriesWithContinent = data.map(country => ({
          ...country,
          continent: countryToContinentMap[country.country_code] || 'Other'
        }));
        setCountries(countriesWithContinent);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.country_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContinent = !selectedContinent || country.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const firstLetter = country.country_name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {} as { [key: string]: CountryWithContinent[] });

  const handleCountrySelect = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onCountriesChange(selectedCountries.filter(code => code !== countryCode));
    } else {
      onCountriesChange([...selectedCountries, countryCode]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {continents.map(continent => (
          <button
            key={continent.name}
            onClick={() => setSelectedContinent(
              selectedContinent === continent.name ? null : continent.name
            )}
            className={`px-4 py-2 rounded-lg border ${continent.color} ${
              selectedContinent === continent.name ? 'ring-2 ring-offset-2 ring-offset-slate-800' : ''
            }`}
          >
            {continent.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {Object.entries(groupedCountries).map(([letter, letterCountries]) => (
          <div key={letter} className="rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGroup(letter)}
              className="w-full px-4 py-2 bg-slate-700/50 text-left flex justify-between items-center hover:bg-slate-700/70"
            >
              <span className="font-medium text-slate-200">
                {letter} ({letterCountries.length})
              </span>
              {expandedGroups.includes(letter) ? (
                <ChevronUpIcon className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-slate-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedGroups.includes(letter) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-slate-800/50">
                    {letterCountries.map(country => (
                      <button
                        key={country.country_code}
                        onClick={() => handleCountrySelect(country.country_code)}
                        className={`px-3 py-2 rounded text-left transition-colors ${
                          selectedCountries.includes(country.country_code)
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {country.country_name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountrySelector;