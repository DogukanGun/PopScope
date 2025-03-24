import pandas as pd
from typing import List, Dict, Optional
import numpy as np

class CountryData:
    def __init__(self):
        # Read the TSV file
        self.df = pd.read_csv('country_development.tsv', sep='\t')
        # Convert year columns to numeric, replacing non-numeric values with NaN
        year_columns = [str(year) for year in range(1960, 2024)]
        for col in year_columns:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')

        # Get list of available countries (excluding aggregates and regions)
        self.countries = self.df[~self.df['Country Code'].str.contains('^(AFE|AFW|ARB)$')][
            ['Country Name', 'Country Code']].dropna().to_dict('records')

    def get_countries(self) -> List[Dict]:
        return self.countries

    def get_population_data(self, country_codes: List[str]) -> Dict:
        # Filter data for selected countries
        filtered_df = self.df[self.df['Country Code'].isin(country_codes)]

        if filtered_df.empty:
            raise HTTPException(status_code=404, detail="No data found for specified countries")

        result = []
        for _, row in filtered_df.iterrows():
            country_data = {
                'country_name': row['Country Name'],
                'country_code': row['Country Code'],
                'population': {
                    str(year): row[str(year)]
                    for year in range(1960, 2024)
                    if not pd.isna(row[str(year)])
                }
            }
            result.append(country_data)

        return result

    def get_growth_metrics(self, country_code: str, year: int) -> Dict:
        country_data = self.df[self.df['Country Code'] == country_code].iloc[0]

        if pd.isna(country_data[str(year)]):
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")

        current_pop = country_data[str(year)]

        def calculate_growth(years_back: int) -> tuple:
            if year - years_back < 1960:
                return None, None

            past_year = str(year - years_back)
            if pd.isna(country_data[past_year]):
                return None, None

            past_pop = country_data[past_year]
            absolute_growth = current_pop - past_pop
            percentage_growth = (absolute_growth / past_pop) * 100
            return absolute_growth, percentage_growth

        one_year = calculate_growth(1)
        three_year = calculate_growth(3)
        five_year = calculate_growth(5)

        return {
            "one_year": {
                "absolute": int(one_year[0]) if one_year and one_year[0] is not None else None,
                "percentage": round(one_year[1], 2) if one_year and one_year[1] is not None else None
            },
            "three_year": {
                "absolute": int(three_year[0]) if three_year and three_year[0] is not None else None,
                "percentage": round(three_year[1], 2) if three_year and three_year[1] is not None else None
            },
            "five_year": {
                "absolute": int(five_year[0]) if five_year and five_year[0] is not None else None,
                "percentage": round(five_year[1], 2) if five_year and five_year[1] is not None else None
            }
        }
