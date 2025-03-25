import { useEffect, useMemo, useCallback, useReducer } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import apiService, { PopulationTrend, AnalyticsData } from '@/app/lib/services/api';
import { motion } from 'framer-motion';

interface AnalyticsDashboardProps {
  selectedYear?: number;
}

interface YearRange {
  startYear: number;
  endYear: number;
}

interface FetchSuccessPayload {
  data: AnalyticsData;
  growthTrends: { [key: string]: PopulationTrend[] };
}

type AnalyticsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: FetchSuccessPayload }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_YEAR_RANGE'; payload: YearRange };

interface RegionalData {
  region_name: string;
  total_population: number;
}

interface TopCountryData {
  country_name: string;
  value: number;
  growth_rate?: number; // Optional if not always present
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsState {
  data: AnalyticsData | null;
  growthTrends: { [key: string]: PopulationTrend[] };
  isLoading: boolean;
  error: string | null;
  yearRange: YearRange;
}

function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        growthTrends: action.payload.growthTrends,
        isLoading: false,
        error: null
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_YEAR_RANGE':
      return { ...state, yearRange: action.payload };
    default:
      return state;
  }
}

const AnalyticsDashboard = ({ selectedYear = 2022 }: AnalyticsDashboardProps) => {
  const [state, dispatch] = useReducer(analyticsReducer, {
    data: null,
    growthTrends: {},
    isLoading: true,
    error: null,
    yearRange: {
      startYear: selectedYear - 5,
      endYear: selectedYear
    }
  });

  const colorScheme = useMemo(() => {
    const vibrantColors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(255, 99, 255, 0.8)',
    ];
    return {
      colors: vibrantColors,
      borders: vibrantColors.map(color => color.replace('0.8', '1'))
    };
  }, []);

  const prepareChartData = useCallback((dataSource: (RegionalData | TopCountryData)[], labelKey: string, valueKey: string) => {
    return {
      labels: dataSource.map(item => item[labelKey as keyof (RegionalData | TopCountryData)] as string),
      datasets: [{
        label: 'Data',
        data: dataSource.map(item => item[valueKey as keyof (RegionalData | TopCountryData)] as number),
        backgroundColor: colorScheme.colors,
        borderColor: colorScheme.borders,
        borderWidth: 1,
      }]
    };
  }, [colorScheme]);

  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const analytics = await apiService.getAnalyticsDashboard(selectedYear);
      
      const trendsPromises = analytics.top_populated_countries
        .slice(0, 5)
        .map(async (country) => {
          const trends = await apiService.getPopulationTrends(
            country.country_code,
            state.yearRange.startYear,
            state.yearRange.endYear
          );
          return { [country.country_code]: trends };
        });

      const trendsResults = await Promise.all(trendsPromises);
      const combinedTrends = trendsResults.reduce<{ [key: string]: PopulationTrend[] }>(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );

      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { 
          data: analytics, 
          growthTrends: combinedTrends 
        } 
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: 'Failed to load analytics data' 
      });
    }
  }, [selectedYear, state.yearRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const regionData = useMemo(() => 
    state.data ? prepareChartData(state.data.regional_data, 'region_name', 'total_population') : 
    { labels: [], datasets: [] }, 
    [state.data, prepareChartData]
  );

  const topCountriesData = useMemo(() => 
    state.data ? prepareChartData(state.data.top_populated_countries, 'country_name', 'value') : 
    { labels: [], datasets: [] }, 
    [state.data, prepareChartData]
  );

  const growthRateData = useMemo(() => 
    state.data ? prepareChartData(state.data.top_growing_countries, 'country_name', 'growth_rate') : 
    { labels: [], datasets: [] }, 
    [state.data, prepareChartData]
  );

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="text-center text-red-500 p-4">
        {state.error || 'No analytics data available'}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Key Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Total Population</p>
              <p className="text-2xl font-bold text-slate-200">
                {state.data.total_population.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Average Growth Rate</p>
              <p className="text-2xl font-bold text-slate-200">
                {state.data.average_growth_rate.toFixed(2)}%
              </p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Population Distribution</p>
              <p className="text-2xl font-bold text-slate-200">
                {state.data.population_distribution.ranges.length} ranges
              </p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Top Growing Countries</p>
              <p className="text-2xl font-bold text-slate-200">
                {state.data.top_growing_countries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Regional Distribution</h3>
          <Pie data={regionData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Top Populated Countries</h3>
          <Bar data={topCountriesData} options={{ responsive: true }} />
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Top Growing Countries</h3>
          <Bar data={growthRateData} options={{ responsive: true }} />
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard; 