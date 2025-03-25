'use client';

import { useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import PopulationChart from '../components/common/PopulationChart';
import GrowthMetrics from '../components/common/GrowthMetrics';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import apiService, { 
  PopulationData, 
  GrowthMetrics as GrowthMetricsType, 
  Country,
  PopulationTrend
} from '../lib/services/api';
import { motion } from 'framer-motion';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const continents = [
  { name: 'Asia', color: 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50' },
  { name: 'Europe', color: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50' },
  { name: 'North America', color: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50' },
  { name: 'South America', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50' },
  { name: 'Africa', color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50' },
  { name: 'Oceania', color: 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/50' },
];

interface DashboardState {
  selectedCountries: string[];
  populationData: PopulationData[];
  selectedMetrics: {
    metrics: GrowthMetricsType;
    countryName: string;
    year: string;
  } | null;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;
  isCountrySelectorExpanded: boolean;
  searchQuery: string;
  availableCountries: Country[];
  selectedContinent: string | null;
}

type DashboardAction = 
  | { type: 'SET_AVAILABLE_COUNTRIES'; payload: Country[] }
  | { type: 'SET_POPULATION_DATA'; payload: PopulationData[] }
  | { type: 'SET_SELECTED_METRICS'; payload: DashboardState['selectedMetrics'] }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_COUNTRY_SELECTOR' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SELECT_COUNTRY'; payload: string }
  | { type: 'SET_SELECTED_CONTINENT'; payload: string | null };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_AVAILABLE_COUNTRIES':
      return { ...state, availableCountries: action.payload };
    case 'SET_POPULATION_DATA':
      return { ...state, populationData: action.payload, isLoading: false };
    case 'SET_SELECTED_METRICS':
      return { ...state, selectedMetrics: action.payload };
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'TOGGLE_COUNTRY_SELECTOR':
      return { ...state, isCountrySelectorExpanded: !state.isCountrySelectorExpanded };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountries: state.selectedCountries.includes(action.payload)
          ? state.selectedCountries.filter(code => code !== action.payload)
          : [...state.selectedCountries, action.payload]
      };
    case 'SET_SELECTED_CONTINENT':
      return { 
        ...state, 
        selectedContinent: 
          state.selectedContinent === action.payload ? null : action.payload 
      };
    default:
      return state;
  }
}

export default function Dashboard() {
  const initialState: DashboardState = {
    selectedCountries: [],
    populationData: [],
    selectedMetrics: null,
    selectedYear: 2022,
    isLoading: false,
    error: null,
    isCountrySelectorExpanded: true,
    searchQuery: '',
    availableCountries: [],
    selectedContinent: null
  };

  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const [showAdditionalGraphs, setShowAdditionalGraphs] = useState(false);

  const getCountryContinent = useCallback((countryCode: string): string => {
    const continentMap: { [key: string]: string } = {
      'CHN': 'Asia', 'IND': 'Asia', 'IDN': 'Asia', 'PAK': 'Asia', 'BGD': 'Asia', 
      'JPN': 'Asia', 'PHL': 'Asia', 'VNM': 'Asia', 'TUR': 'Asia', 'IRN': 'Asia',
      'DEU': 'Europe', 'FRA': 'Europe', 'GBR': 'Europe', 'ITA': 'Europe', 'ESP': 'Europe',
      'POL': 'Europe', 'ROU': 'Europe', 'NLD': 'Europe', 'BEL': 'Europe', 'GRC': 'Europe',
      'USA': 'North America', 'CAN': 'North America', 'MEX': 'North America',
      'BRA': 'South America', 'COL': 'South America', 'ARG': 'South America', 'PER': 'South America',
      'VEN': 'South America', 'CHL': 'South America', 'ECU': 'South America', 'BOL': 'South America',
      'PRY': 'South America', 'URY': 'South America',
      'NGA': 'Africa', 'ETH': 'Africa', 'EGY': 'Africa', 'COD': 'Africa', 'TZA': 'Africa',
      'ZAF': 'Africa', 'KEN': 'Africa', 'UGA': 'Africa', 'DZA': 'Africa', 'SDN': 'Africa',
      'AUS': 'Oceania', 'PNG': 'Oceania', 'NZL': 'Oceania', 'FJI': 'Oceania', 'SLB': 'Oceania',
      'VUT': 'Oceania', 'NCL': 'Oceania', 'PYF': 'Oceania', 'WSM': 'Oceania', 'GUM': 'Oceania'
    };
    return continentMap[countryCode] || 'Other';
  }, []);

  const filteredCountries = useMemo(() => 
    state.availableCountries.filter(country =>
      country.country_name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
      (!state.selectedContinent || getCountryContinent(country.country_code) === state.selectedContinent)
    ), 
    [state.availableCountries, state.searchQuery, state.selectedContinent, getCountryContinent]
  );

  const fetchCountries = useCallback(async () => {
    try {
      const countries = await apiService.getCountries();
      dispatch({ type: 'SET_AVAILABLE_COUNTRIES', payload: countries });
    } catch (err) {
      console.error('Error fetching countries:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to load countries' 
      });
    }
  }, []);

  const fetchPopulationData = useCallback(async () => {
    if (state.selectedCountries.length === 0) {
      dispatch({ type: 'SET_POPULATION_DATA', payload: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = await apiService.getPopulationData(state.selectedCountries);
      dispatch({ type: 'SET_POPULATION_DATA', payload: data });
    } catch (err) {
      console.error('Error fetching population data:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to load population data' 
      });
    }
  }, [state.selectedCountries]);

  const handleDataPointClick = useCallback(async (countryCode: string, year: string) => {
    try {
      const metrics = await apiService.getGrowthMetrics(countryCode, parseInt(year));
      const country = state.populationData.find(data => data.country_code === countryCode);
      
      if (country) {
        dispatch({ 
          type: 'SET_SELECTED_METRICS', 
          payload: {
            metrics,
            countryName: country.country_name,
            year,
          }
        });
        dispatch({ type: 'SET_SELECTED_YEAR', payload: parseInt(year) });
      }
    } catch (err) {
      console.error('Error fetching growth metrics:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to load growth metrics' 
      });
    }
  }, [state.populationData]);

  const fetchPopulationTrends = useCallback(async (countryCodes: string[]) => {
    try {
      const trendsPromises = countryCodes.map(async (countryCode) => {
        const trends = await apiService.getPopulationTrends(
          countryCode, 
          2000, 
          2022
        );
        const country = state.availableCountries.find(c => c.country_code === countryCode);
        return { 
          countryCode, 
          countryName: country?.country_name || countryCode, 
          trends 
        };
      });

      const populationTrends = await Promise.all(trendsPromises);
      return populationTrends;
    } catch (err) {
      console.error('Error fetching population trends:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to load population trends' 
      });
      return [];
    }
  }, [state.availableCountries]);

  const toggleAdditionalGraphs = async () => {
    if (!showAdditionalGraphs && state.selectedCountries.length > 0) {
      const trends = await fetchPopulationTrends(state.selectedCountries);
      setPopulationTrends(trends);
    }
    setShowAdditionalGraphs(!showAdditionalGraphs);
  };

  const [populationTrends, setPopulationTrends] = useState<{
    countryCode: string, 
    countryName: string, 
    trends: PopulationTrend[]
  }[]>([]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    fetchPopulationData();
  }, [fetchPopulationData]);

  const getSelectedCountriesText = useCallback(() => {
    if (state.selectedCountries.length === 0) return 'No countries selected';
    const countryNames = state.selectedCountries
      .map(code => state.availableCountries.find(c => c.country_code === code)?.country_name)
      .filter(Boolean)
      .join(', ');
    return `Selected Countries: ${countryNames}`;
  }, [state.selectedCountries, state.availableCountries]);

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-4">
          Population Trends Dashboard
        </h1>
        <p className="text-blue-100 text-lg">
          Explore and analyze population trends across different countries and time periods.
          Click on data points to view detailed metrics.
        </p>
      </motion.div>

      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden"
      >
        <button
          onClick={() => dispatch({ type: 'TOGGLE_COUNTRY_SELECTOR' })}
          className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-slate-200">
            {state.isCountrySelectorExpanded 
              ? 'Select Countries to Compare' 
              : getSelectedCountriesText()}
          </h2>
          {state.isCountrySelectorExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {state.isCountrySelectorExpanded && (
          <div className="p-6 border-t border-slate-700">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {continents.map(continent => (
                  <button
                    key={continent.name}
                    onClick={() => dispatch({ type: 'SET_SELECTED_CONTINENT', payload: continent.name })}
                    className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg border ${continent.color} ${
                      state.selectedContinent === continent.name ? 'ring-2 ring-offset-2 ring-offset-slate-800' : ''
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
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  className="w-full px-3 py-2 md:px-4 md:py-2 pl-8 md:pl-10 text-sm md:text-base bg-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <MagnifyingGlassIcon className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              </div>

              <div className="flex flex-wrap gap-2">
                {state.selectedCountries.map(countryCode => {
                  const country = state.availableCountries.find(c => c.country_code === countryCode);
                  return country && (
                    <button
                      key={countryCode}
                      onClick={() => dispatch({ type: 'SELECT_COUNTRY', payload: countryCode })}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      {country.country_name}
                      <XMarkIcon className="h-4 w-4 ml-2" />
                    </button>
                  );
                })}
              </div>

              {state.searchQuery && (
                <div className="max-h-96 overflow-y-auto bg-slate-700/50 rounded-lg">
                  {Object.entries(
                    filteredCountries.reduce((acc, country) => {
                      const firstLetter = country.country_name[0].toUpperCase();
                      if (!acc[firstLetter]) acc[firstLetter] = [];
                      acc[firstLetter].push(country);
                      return acc;
                    }, {} as { [key: string]: Country[] })
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, countries]) => (
                      <div key={letter} className="border-b border-slate-600 last:border-b-0">
                        <button
                          onClick={(e) => {
                            const content = e.currentTarget.nextElementSibling;
                            if (content) {
                              content.classList.toggle('hidden');
                              e.currentTarget.querySelector('.chevron')?.classList.toggle('rotate-180');
                            }
                          }}
                          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-600/30 transition-colors text-slate-200"
                        >
                          <span className="font-medium">
                            {letter} ({countries.length})
                          </span>
                          <svg
                            className="h-4 w-4 transform transition-transform duration-200 chevron"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div className="hidden">
                          {countries.map(country => (
                            <button
                              key={country.country_code}
                              onClick={() => dispatch({ type: 'SELECT_COUNTRY', payload: country.country_code })}
                              className={`w-full px-6 py-2 text-left hover:bg-slate-600/50 transition-colors ${
                                state.selectedCountries.includes(country.country_code)
                                  ? 'text-emerald-300 bg-emerald-500/10'
                                  : 'text-slate-300'
                              }`}
                            >
                              {country.country_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!state.searchQuery && (
                <div className="max-h-96 overflow-y-auto bg-slate-700/50 rounded-lg">
                  {Object.entries(
                    filteredCountries.reduce((acc, country) => {
                      const firstLetter = country.country_name[0].toUpperCase();
                      if (!acc[firstLetter]) acc[firstLetter] = [];
                      acc[firstLetter].push(country);
                      return acc;
                    }, {} as { [key: string]: Country[] })
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, countries]) => (
                      <div key={letter} className="border-b border-slate-600 last:border-b-0">
                        <button
                          onClick={(e) => {
                            const content = e.currentTarget.nextElementSibling;
                            if (content) {
                              content.classList.toggle('hidden');
                              e.currentTarget.querySelector('.chevron')?.classList.toggle('rotate-180');
                            }
                          }}
                          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-600/30 transition-colors text-slate-200"
                        >
                          <span className="font-medium">
                            {letter} ({countries.length})
                          </span>
                          <svg
                            className="h-4 w-4 transform transition-transform duration-200 chevron"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div className="hidden">
                          {countries.map(country => (
                            <button
                              key={country.country_code}
                              onClick={() => dispatch({ type: 'SELECT_COUNTRY', payload: country.country_code })}
                              className={`w-full px-6 py-2 text-left hover:bg-slate-600/50 transition-colors ${
                                state.selectedCountries.includes(country.country_code)
                                  ? 'text-emerald-300 bg-emerald-500/10'
                                  : 'text-slate-300'
                              }`}
                            >
                              {country.country_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {state.error && (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20"
        >
          {state.error}
        </motion.div>
      )}

      {state.isLoading ? (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center py-12"
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading data...</p>
        </motion.div>
      ) : state.populationData.length > 0 ? (
        <div className="space-y-8">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="bg-slate-800 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700"
          >
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-2 md:mb-0">
                Population Trends Over Time
              </h2>
              <button 
                onClick={toggleAdditionalGraphs}
                className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                {showAdditionalGraphs ? 'Hide' : 'Show'} Additional Insights
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <PopulationChart
                data={state.populationData}
                onDataPointClick={handleDataPointClick}
              />
            </div>
          </motion.div>
          
          {showAdditionalGraphs && (
            <div className="space-y-8">
              <motion.div 
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="bg-slate-800 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700"
              >
                <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-4 md:mb-6">
                  Population Growth Rate Trends
                </h2>
                <div className="w-full overflow-x-auto">
                  <PopulationChart
                    data={populationTrends.map(country => ({
                      country_name: country.countryName,
                      country_code: country.countryCode,
                      population: country.trends.reduce((acc, trend) => ({
                        ...acc,
                        [trend.year]: trend.growth_rate || 0
                      }), {})
                    }))}
                    isGrowthRate={true}
                  />
                </div>
              </motion.div>

              <motion.div 
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="bg-slate-800 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700"
              >
                <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-4 md:mb-6">
                  Comparative Population Metrics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.populationData.map(country => (
                    <div 
                      key={country.country_code} 
                      className="bg-slate-700/50 p-3 md:p-4 rounded-lg"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-slate-200 mb-2">
                        {country.country_name}
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs md:text-sm text-slate-400">Latest Population</p>
                          <p className="text-base md:text-xl font-bold text-slate-200">
                            {Object.values(country.population).pop()?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-slate-400">Population Change</p>
                          <p className="text-base md:text-xl font-bold text-slate-200">
                            {(() => {
                              const values = Object.values(country.population);
                              const change = values[values.length - 1] - values[0];
                              const percentage = (change / values[0]) * 100;
                              return `${change > 0 ? '+' : ''}${change.toLocaleString()} (${percentage.toFixed(2)}%)`
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
          
          {state.selectedMetrics && (
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700"
            >
              <GrowthMetrics
                metrics={state.selectedMetrics.metrics}
                countryName={state.selectedMetrics.countryName}
                year={state.selectedMetrics.year}
              />
            </motion.div>
          )}
        </div>
      ) : state.selectedCountries.length > 0 ? (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center py-12 text-slate-400"
        >
          No data available for the selected countries
        </motion.div>
      ) : (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center py-12 text-slate-400"
        >
          Select countries to view population trends
        </motion.div>
      )}

      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="border-t border-slate-700/50 pt-8"
      >
        <h2 className="text-2xl font-bold text-slate-200 mb-6">
          Global Analytics Overview
        </h2>
        <AnalyticsDashboard selectedYear={state.selectedYear} />
      </motion.div>
    </div>
  );
} 