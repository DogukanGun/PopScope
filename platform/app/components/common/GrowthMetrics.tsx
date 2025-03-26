import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
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
  delay = 0
}: {
  title: string;
  absolute: number | null;
  percentage: number | null;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gradient-to-br from-slate-700/30 to-slate-700/10 p-6 rounded-xl border border-slate-600/30 hover:border-slate-500/30 transition-colors"
  >
    <h4 className="text-sm font-medium text-slate-400 mb-3">
      {title}
    </h4>
    <div className="space-y-2">
      <p className="text-2xl font-bold text-slate-200">
        {absolute !== null
          ? `${(absolute >= 0 ? '+' : '')}${absolute.toLocaleString()} people`
          : 'N/A'}
      </p>
      <div className="flex items-center">
        {percentage !== null && (
          <>
            {percentage >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-400 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400 mr-1" />
            )}
          </>
        )}
        <p className={`text-sm font-medium ${
          percentage !== null
            ? percentage >= 0
              ? 'text-emerald-400'
              : 'text-red-400'
            : 'text-slate-400'
        }`}>
          {percentage !== null
            ? `${(percentage >= 0 ? '+' : '')}${percentage.toFixed(2)}%`
            : 'N/A'}
        </p>
      </div>
    </div>
  </motion.div>
);

const GrowthMetrics = ({ metrics, countryName, year }: GrowthMetricsProps) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-700/50"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            {countryName} Growth Metrics
          </h2>
          <p className="text-slate-400">
            Detailed population changes for the year {year}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Year: {year}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="1 Year Growth"
          absolute={metrics.one_year.absolute}
          percentage={metrics.one_year.percentage}
          delay={0.1}
        />
        <MetricCard
          title="3 Year Growth"
          absolute={metrics.three_year.absolute}
          percentage={metrics.three_year.percentage}
          delay={0.2}
        />
        <MetricCard
          title="5 Year Growth"
          absolute={metrics.five_year.absolute}
          percentage={metrics.five_year.percentage}
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
      >
        <p className="text-sm text-blue-400">
          <strong>Note:</strong> Growth rates are calculated over different time periods to provide a comprehensive view of population changes.
        </p>
      </motion.div>
    </div>
  );
};

export default GrowthMetrics; 