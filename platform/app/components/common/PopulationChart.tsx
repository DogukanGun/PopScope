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
    datasets: data.map((country, index) => ({
      label: country.country_name,
      data: years.map((year) => country.population[year] || null),
      borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 60) % 360}, 70%, 50%, 0.5)`,
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
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'system-ui'
          },
          color: '#e2e8f0', // text color
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              const style = meta.hidden ? { backgroundColor: 'transparent' } : {};
              return {
                text: dataset.label || '',
                fillStyle: dataset.borderColor as string,
                strokeStyle: dataset.borderColor as string,
                lineWidth: 2,
                hidden: meta.hidden,
                index: i,
                ...style,
                // Add visual indication of active/inactive state
                textOpacity: meta.hidden ? 0.5 : 1,
                textDecoration: meta.hidden ? 'line-through' : undefined,
              };
            });
          },
        },
        onClick: (e, legendItem, legend) => {
          if (legendItem.index !== undefined) {
            const index = legendItem.index;
            const ci = legend.chart;
            const meta = ci.getDatasetMeta(index);
            
            // Toggle the hidden state
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : !meta.hidden;
            
            // Trigger a chart update
            ci.update();
          }
        },
      },
      title: {
        display: true,
        text: isGrowthRate ? 'Growth Rate Trends' : 'Population Trends Over Time',
        color: '#e2e8f0',
        font: {
          size: 16,
          weight: 'bold',
          family: 'system-ui'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
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
          label: (context) => {
            const value = context.parsed.y;
            if (value !== undefined && value !== null) {
              if (isGrowthRate) {
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              }
              return `${context.dataset.label}: ${value.toLocaleString()} people`;
            }
            return `${context.dataset.label}: No data`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        }
      },
      y: {
        title: {
          display: true,
          text: isGrowthRate ? 'Growth Rate (%)' : 'Population',
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          },
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
    <div className="w-full h-[400px] bg-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PopulationChart; 