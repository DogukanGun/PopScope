import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PopulationData } from '@/app/lib/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PopulationChartProps {
  data: PopulationData[];
  onDataPointClick?: (countryCode: string, year: string) => void;
  isGrowthRate?: boolean;
}

const PopulationChart = ({ data, onDataPointClick, isGrowthRate = false }: PopulationChartProps) => {
  const years = Object.keys(data[0]?.population || {}).sort();
  
  const chartData: ChartData<'line'> = {
    labels: years,
    datasets: data.map((country) => ({
      label: country.country_name,
      data: years.map((year) => country.population[year] || null),
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: isGrowthRate ? 'Growth Rate Trends' : 'Population Trends Over Time',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (isGrowthRate) {
              return `${context.dataset.label}: ${value?.toFixed(2)}%`;
            }
            return `${context.dataset.label}: ${value?.toLocaleString()} people`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        title: {
          display: true,
          text: isGrowthRate ? 'Growth Rate (%)' : 'Population',
        },
        ticks: {
          callback: (value) => {
            if (typeof value === 'number') {
              return isGrowthRate ? `${value.toFixed(2)}%` : value.toLocaleString();
            }
            return value;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onDataPointClick && !isGrowthRate) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        const countryCode = data[datasetIndex].country_code;
        const year = years[index];
        onDataPointClick(countryCode, year);
      }
    },
  };

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PopulationChart; 