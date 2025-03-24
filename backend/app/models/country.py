from pydantic import BaseModel
from typing import Dict, Optional, List

class CountryBase(BaseModel):
    country_name: str
    country_code: str

class CountryPopulation(CountryBase):
    population: Dict[str, float]

class GrowthMetrics(BaseModel):
    absolute: Optional[int]
    percentage: Optional[float]

class CountryGrowth(BaseModel):
    one_year: GrowthMetrics
    three_year: GrowthMetrics
    five_year: GrowthMetrics 