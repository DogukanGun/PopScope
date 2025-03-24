from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..services.country_service import CountryService
from ..models.country import CountryBase, CountryPopulation, CountryGrowth

router = APIRouter(prefix="/api/countries", tags=["countries"])

def get_country_service():
    return CountryService()

@router.get("/", response_model=List[CountryBase])
async def get_countries(service: CountryService = Depends(get_country_service)):
    """Get list of available countries"""
    try:
        return service.get_countries()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{country_codes}/population", response_model=List[CountryPopulation])
async def get_population_data(
    country_codes: str,
    service: CountryService = Depends(get_country_service)
):
    """Get population data for specified countries"""
    try:
        # Validate input
        if not country_codes:
            raise HTTPException(status_code=400, detail="Country codes cannot be empty")
        
        codes = country_codes.split(',')
        
        # Validate each country code
        invalid_codes = [code for code in codes if not code.strip()]
        if invalid_codes:
            raise HTTPException(status_code=400, detail=f"Invalid country codes: {invalid_codes}")
        
        return service.get_population_data(codes)
    except HTTPException:
        # Re-raise HTTPException to preserve its details
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving population data: {str(e)}")

@router.get("/{country_code}/growth/{year}", response_model=CountryGrowth)
async def get_growth_metrics(
    country_code: str,
    year: int,
    service: CountryService = Depends(get_country_service)
):
    """Get growth metrics for a specific country and year"""
    try:
        # Validate input
        if not country_code:
            raise HTTPException(status_code=400, detail="Country code cannot be empty")
        
        if year < 1960 or year > 2022:
            raise HTTPException(
                status_code=400, 
                detail="Year must be between 1960 and 2022"
            )
        
        return service.get_growth_metrics(country_code, year)
    except HTTPException:
        # Re-raise HTTPException to preserve its details
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving growth metrics for {country_code} in {year}: {str(e)}"
        ) 