from pydantic import BaseModel
from typing import Dict, List, Optional

class PopulationTrend(BaseModel):
    year: int
    population: float
    growth_rate: Optional[float]

class RegionalData(BaseModel):
    region_name: str
    total_population: float
    countries: List[str]
    growth_rate: float

class PopulationDistribution(BaseModel):
    ranges: List[str]
    counts: List[int]
    countries_in_range: Dict[str, List[str]]

class TopCountriesData(BaseModel):
    country_name: str
    country_code: str
    value: float
    growth_rate: float

class AnalyticsResponse(BaseModel):
    total_population: float
    average_growth_rate: float
    population_distribution: PopulationDistribution
    top_growing_countries: List[TopCountriesData]
    top_populated_countries: List[TopCountriesData]
    regional_data: List[RegionalData] 