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
  ArcElement,
  RadialLinearScale,
  ChartEvent,
  ActiveElement,
  TooltipItem,
  Chart
} from 'chart.js';
import { Bar, Pie, PolarArea } from 'react-chartjs-2';
import apiService, { PopulationTrend, AnalyticsData } from '@/app/lib/services/api';
import { motion } from 'framer-motion';
import Flag from 'react-world-flags';
import { GlobeAltIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
  ArcElement,
  RadialLinearScale
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

const StatCard = ({
  title,
  value,
  trend,
  icon: Icon,
  delay = 0
}: {
  title: string;
  value: string | number;
  trend?: { value: number; label: string };
  icon: React.ElementType;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-slate-900 p-6 rounded-2xl border border-slate-700/30 hover:border-slate-600/30 transition-colors"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h4 className="mt-2 text-2xl font-bold text-slate-200">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h4>
      </div>
      <div className="p-2 bg-slate-700/30 rounded-lg">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        {trend.value >= 0 ? (
          <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="h-4 w-4 text-red-400 mr-1" />
        )}
        <span className={trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {trend.value > 0 ? '+' : ''}{trend.value.toFixed(2)}% {trend.label}
        </span>
      </div>
    )}
  </motion.div>
);

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
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(168, 85, 247, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(34, 211, 238, 0.8)',   // Cyan
      'rgba(16, 185, 129, 0.8)',   // Emerald
      'rgba(245, 158, 11, 0.8)',   // Amber
    ];
    return {
      colors: vibrantColors,
      borders: vibrantColors.map(color => color.replace('0.8', '1')),
      gradients: vibrantColors.map(color => ({
        start: color.replace('0.8', '0.2'),
        end: color.replace('0.8', '0.8')
      }))
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

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-lg opacity-20 animate-pulse"></div>
          <div className="relative flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-400 animate-pulse">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-red-500/10">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">{state.error || 'No analytics data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Population"
          value={state.data.total_population}
          trend={{
            value: state.data.average_growth_rate,
            label: 'growth'
          }}
          icon={GlobeAltIcon}
          delay={0.1}
        />
        <StatCard
          title="Average Growth Rate"
          value={`${state.data.average_growth_rate.toFixed(2)}%`}
          icon={ArrowTrendingUpIcon}
          delay={0.2}
        />
        <StatCard
          title="Population Ranges"
          value={state.data.population_distribution.ranges.length}
          icon={ChartBarIcon}
          delay={0.3}
        />
        <StatCard
          title="Growing Countries"
          value={state.data.top_growing_countries.length}
          icon={SparklesIcon}
          delay={0.4}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <span className="inline-block w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded mr-3"></span>
            Regional Distribution
          </h3>
          <div className="aspect-square relative">
            <PolarArea 
              data={regionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#ffffff',
                      usePointStyle: true,
                      padding: 20,
                      boxWidth: 30,
                      boxHeight: 30,
                      font: {
                        family: 'system-ui',
                        size: 14,
                        weight: 'bold'
                      },
                      filter: (legendItem, data) => true,
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels?.length && data.datasets.length) {
                          const meta = chart.getDatasetMeta(0);
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i] as number;
                            const isHidden = meta.data[i] ? (meta.data[i] as any).hidden : false;
                            return {
                              text: `${label}\n${(value / 1000000).toFixed(1)}M`,
                              fillStyle: colorScheme.colors[i].replace('0.8', '1'),
                              strokeStyle: '#ffffff',
                              lineWidth: 2,
                              hidden: isHidden,
                              index: i,
                              textOpacity: isHidden ? 0.5 : 1,
                              fontColor: isHidden ? 'rgba(255, 255, 255, 0.5)' : '#ffffff'
                            }
                          });
                        }
                        return [];
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    titleFont: {
                      size: 16,
                      weight: 'bold',
                      family: 'system-ui'
                    },
                    bodyFont: {
                      size: 14,
                      family: 'system-ui'
                    },
                    padding: 16,
                    cornerRadius: 8,
                    callbacks: {
                      title: (items: any[]) => items[0].label as string,
                      label: (tooltipItem: TooltipItem<"polarArea">) => {
                        const value = tooltipItem.raw as number;
                        return `Population: ${(value / 1000000).toFixed(1)}M people`;
                      }
                    }
                  }
                },
                scales: {
                  r: {
                    ticks: {
                      display: false
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.2)',
                      circular: true
                    },
                    angleLines: {
                      color: 'rgba(255, 255, 255, 0.2)'
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeOutQuart'
                },
                onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const meta = chart.getDatasetMeta(0);
                    if (meta.data[index]) {
                      (meta.data[index] as any).hidden = !(meta.data[index] as any).hidden;
                      chart.update();
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-slate-700/10 transition-all flex flex-col"
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <span className="inline-block w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded mr-3"></span>
            Population Distribution
          </h3>
          <div className="h-[250px]">
            <Bar
              data={{
                labels: state.data.population_distribution.ranges,
                datasets: [{
                  label: 'Countries',
                  data: state.data.population_distribution.counts,
                  backgroundColor: colorScheme.colors,
                  borderColor: colorScheme.borders,
                  borderWidth: 1,
                  borderRadius: 6,
                  hoverBackgroundColor: colorScheme.colors.map(c => c.replace('0.8', '0.9')),
                  hoverBorderColor: colorScheme.borders,
                  hoverBorderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                      family: 'system-ui'
                    },
                    bodyFont: {
                      size: 12,
                      family: 'system-ui'
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      title: (items) => `Population Range: ${items[0].label}`,
                      label: (context) => {
                        return `${context.parsed.y} countries in this range`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                      color: 'rgb(148, 163, 184)',
                      padding: 8,
                      font: {
                        family: 'system-ui',
                        size: 11
                      }
                    },
                    border: {
                      dash: [4, 4],
                      display: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: 'rgb(148, 163, 184)',
                      maxRotation: 45,
                      minRotation: 45,
                      padding: 8,
                      font: {
                        family: 'system-ui',
                        size: 11
                      }
                    },
                    border: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
              <span className="inline-block w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded mr-3"></span>
              Growth Rate Distribution
            </h3>
            <div className="h-[200px]">
              <Bar
                data={{
                  labels: state.data.top_growing_countries.slice(0, 5).map(c => c.country_name),
                  datasets: [{
                    label: 'Growth Rate',
                    data: state.data.top_growing_countries.slice(0, 5).map(c => c.growth_rate || 0),
                    backgroundColor: colorScheme.colors.slice(0, 5),
                    borderColor: colorScheme.borders.slice(0, 5),
                    borderWidth: 1,
                    borderRadius: 6
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      callbacks: {
                        label: (context) => `Growth Rate: ${context.parsed.x.toFixed(2)}%`
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                      },
                      ticks: {
                        callback: (value) => `${value}%`,
                        color: 'rgb(148, 163, 184)',
                        font: {
                          size: 11
                        }
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: 'rgb(148, 163, 184)',
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Countries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-slate-900 p-6 rounded-2xl border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Top Populated Countries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.data.top_populated_countries.map((country, index) => (
            <div
              key={country.country_code}
              className="flex items-center space-x-4 p-4 bg-gradient-to-br from-slate-700/30 to-slate-700/10 rounded-lg border border-slate-600/30"
            >
              <div className="flex-shrink-0 w-12 h-8 relative overflow-hidden rounded shadow-sm">
                <Flag 
                  code={country.country_code} 
                  fallback={<GlobeAltIcon className="h-6 w-6 text-slate-400" />} 
                />
              </div>
              <div>
                <p className="font-medium text-slate-200">{country.country_name}</p>
                <p className="text-sm text-slate-400">{country.value.toLocaleString()} people</p>
              </div>
              <div className="ml-auto text-2xl font-bold text-slate-400">#{index + 1}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsDashboard; 