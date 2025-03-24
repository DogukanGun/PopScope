import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface Country {
  country_name: string;
  country_code: string;
}

export interface PopulationData {
  country_name: string;
  country_code: string;
  population: { [year: string]: number };
}

export interface GrowthMetrics {
  one_year: { absolute: number | null; percentage: number | null };
  three_year: { absolute: number | null; percentage: number | null };
  five_year: { absolute: number | null; percentage: number | null };
}

export interface PopulationTrend {
  year: number;
  population: number;
  growth_rate: number | null;
}

export interface RegionalData {
  region_name: string;
  total_population: number;
  countries: string[];
  growth_rate: number;
}

export interface PopulationDistribution {
  ranges: string[];
  counts: number[];
  countries_in_range: { [range: string]: string[] };
}

export interface TopCountryData {
  country_name: string;
  country_code: string;
  value: number;
  growth_rate: number;
}

export interface AnalyticsData {
  total_population: number;
  average_growth_rate: number;
  population_distribution: PopulationDistribution;
  top_growing_countries: TopCountryData[];
  top_populated_countries: TopCountryData[];
  regional_data: RegionalData[];
}

class ApiService {
  private static instance: ApiService;
  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async getCountries(): Promise<Country[]> {
    const response = await axios.get(`${API_BASE_URL}/countries`);
    return response.data;
  }

  async getPopulationData(countryCodes: string[]): Promise<PopulationData[]> {
    const response = await axios.get(`${API_BASE_URL}/countries/${countryCodes.join(',')}/population`);
    return response.data;
  }

  async getGrowthMetrics(countryCode: string, year: number): Promise<GrowthMetrics> {
    const response = await axios.get(`${API_BASE_URL}/countries/${countryCode}/growth/${year}`);
    return response.data;
  }

  async getPopulationTrends(
    countryCode: string,
    startYear?: number,
    endYear?: number
  ): Promise<PopulationTrend[]> {
    const queryParams = new URLSearchParams();
    if (startYear) queryParams.append('start_year', startYear.toString());
    if (endYear) queryParams.append('end_year', endYear.toString());

    const response = await axios.get(
      `${API_BASE_URL}/analytics/trends/${countryCode}?${queryParams.toString()}`
    );
    return response.data;
  }

  async getAnalyticsDashboard(year?: number): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());

    const response = await axios.get(
      `${API_BASE_URL}/analytics/dashboard?${queryParams.toString()}`
    );
    return response.data;
  }
}

export default ApiService.getInstance(); 