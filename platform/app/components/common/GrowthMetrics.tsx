import { GrowthMetrics as GrowthMetricsType } from '@/app/lib/services/api';

interface GrowthMetricsProps {
  metrics: GrowthMetricsType;
  countryName: string;
  year: string;
}

const MetricCard = ({
  title,
  absolute,
  percentage,
}: {
  title: string;
  absolute: number | null;
  percentage: number | null;
}) => (
  <div className="bg-slate-700/50 p-4 rounded-lg">
    <h4 className="text-sm font-medium text-slate-400 mb-2">
      {title}
    </h4>
    <div className="space-y-1">
      <p className="text-lg font-semibold text-slate-200">
        {absolute !== null
          ? `${(absolute >= 0 ? '+' : '')}${absolute.toLocaleString()} people`
          : 'N/A'}
      </p>
      <p className={`text-sm ${percentage !== null ? (percentage >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-400'}`}>
        {percentage !== null
          ? `${(percentage >= 0 ? '+' : '')}${percentage.toFixed(2)}%`
          : 'N/A'}
      </p>
    </div>
  </div>
);

const GrowthMetrics = ({ metrics, countryName, year }: GrowthMetricsProps) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-xl font-semibold text-slate-200">
          Growth Metrics
        </h3>
        <p className="text-slate-400">
          {countryName} - {year}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="1 Year Growth"
          absolute={metrics.one_year.absolute}
          percentage={metrics.one_year.percentage}
        />
        <MetricCard
          title="3 Year Growth"
          absolute={metrics.three_year.absolute}
          percentage={metrics.three_year.percentage}
        />
        <MetricCard
          title="5 Year Growth"
          absolute={metrics.five_year.absolute}
          percentage={metrics.five_year.percentage}
        />
      </div>
    </div>
  );
};

export default GrowthMetrics; 