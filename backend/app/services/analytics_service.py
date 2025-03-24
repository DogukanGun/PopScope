from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from fastapi import HTTPException

class AnalyticsService:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.current_year = 2022  # Last year with complete data
        self.base_year = 1960

    def get_population_trends(self, country_code: str, start_year: Optional[int] = None, end_year: Optional[int] = None) -> List[Dict]:
        if start_year is None:
            start_year = self.base_year
        if end_year is None:
            end_year = self.current_year

        country_data = self.df[self.df['Country Code'] == country_code].iloc[0]
        trends = []

        for year in range(start_year, end_year + 1):
            current_pop = country_data[str(year)]
            if pd.isna(current_pop):
                continue

            growth_rate = None
            if year > start_year:
                prev_pop = country_data[str(year - 1)]
                if not pd.isna(prev_pop) and prev_pop != 0:
                    growth_rate = ((current_pop - prev_pop) / prev_pop) * 100

            trends.append({
                "year": year,
                "population": float(current_pop),
                "growth_rate": round(growth_rate, 2) if growth_rate is not None else None
            })

        return trends

    def get_analytics_data(self, year: int = None) -> Dict:
        if year is None:
            year = self.current_year

        # Filter out aggregate regions and get valid countries
        exclude_codes = ['AFE', 'AFW', 'ARB']
        valid_countries = self.df[~self.df['Country Code'].isin(exclude_codes)].copy()
        
        # Calculate total population and growth rates
        total_pop = valid_countries[str(year)].sum()
        prev_total = valid_countries[str(year-1)].sum()
        avg_growth = ((total_pop - prev_total) / prev_total) * 100 if prev_total > 0 else 0

        # Population distribution
        pop_ranges = [0, 1e6, 10e6, 50e6, 100e6, 500e6, float('inf')]
        range_labels = ['<1M', '1M-10M', '10M-50M', '50M-100M', '100M-500M', '>500M']
        
        distribution = {'ranges': range_labels, 'counts': [], 'countries_in_range': {}}
        
        for i in range(len(pop_ranges)-1):
            mask = (valid_countries[str(year)] >= pop_ranges[i]) & (valid_countries[str(year)] < pop_ranges[i+1])
            countries_in_range = valid_countries[mask]
            distribution['counts'].append(len(countries_in_range))
            distribution['countries_in_range'][range_labels[i]] = countries_in_range['Country Name'].tolist()

        # Top growing countries
        valid_countries.loc[:, 'growth_rate'] = (
            (valid_countries[str(year)] - valid_countries[str(year-1)]) / 
            valid_countries[str(year-1)] * 100
        )
        
        top_growing = valid_countries.nlargest(10, 'growth_rate')[
            ['Country Name', 'Country Code', str(year), 'growth_rate']
        ].to_dict('records')

        top_growing_formatted = [
            {
                'country_name': country['Country Name'],
                'country_code': country['Country Code'],
                'value': float(country[str(year)]),
                'growth_rate': round(float(country['growth_rate']), 2)
            }
            for country in top_growing
        ]

        # Top populated countries
        top_populated = valid_countries.nlargest(10, str(year))[
            ['Country Name', 'Country Code', str(year), 'growth_rate']
        ].to_dict('records')

        top_populated_formatted = [
            {
                'country_name': country['Country Name'],
                'country_code': country['Country Code'],
                'value': float(country[str(year)]),
                'growth_rate': round(float(country['growth_rate']), 2)
            }
            for country in top_populated
        ]

        # Regional data (using continent-level aggregation)
        regions = {
            'Asia': ['CHN', 'IND', 'IDN', 'PAK', 'BGD', 'JPN', 'PHL', 'VNM', 'TUR', 'IRN'],
            'Europe': ['DEU', 'FRA', 'GBR', 'ITA', 'ESP', 'POL', 'ROU', 'NLD', 'BEL', 'GRC'],
            'North America': ['USA', 'CAN', 'MEX'],
            'South America': ['BRA', 'COL', 'ARG', 'PER', 'VEN', 'CHL', 'ECU', 'BOL', 'PRY', 'URY'],
            'Africa': ['NGA', 'ETH', 'EGY', 'COD', 'TZA', 'ZAF', 'KEN', 'UGA', 'DZA', 'SDN'],
            'Oceania': ['AUS', 'PNG', 'NZL', 'FJI', 'SLB', 'VUT', 'NCL', 'PYF', 'WSM', 'GUM']
        }

        regional_data = []
        for region_name, country_codes in regions.items():
            region_countries = valid_countries[valid_countries['Country Code'].isin(country_codes)]
            if not region_countries.empty:
                total_region_pop = region_countries[str(year)].sum()
                prev_region_pop = region_countries[str(year-1)].sum()
                region_growth = ((total_region_pop - prev_region_pop) / prev_region_pop * 100 
                               if prev_region_pop > 0 else 0)
                
                regional_data.append({
                    'region_name': region_name,
                    'total_population': float(total_region_pop),
                    'countries': region_countries['Country Name'].tolist(),
                    'growth_rate': round(float(region_growth), 2)
                })

        return {
            'total_population': float(total_pop),
            'average_growth_rate': round(float(avg_growth), 2),
            'population_distribution': distribution,
            'top_growing_countries': top_growing_formatted,
            'top_populated_countries': top_populated_formatted,
            'regional_data': regional_data
        } 