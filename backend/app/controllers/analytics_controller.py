from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..services.analytics_service import AnalyticsService
from ..services.country_service import CountryService
from ..models.analytics import PopulationTrend, AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

def get_analytics_service():
    try:
        country_service = CountryService()
        return AnalyticsService(country_service.df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing analytics service: {str(e)}")

@router.get("/trends/{country_code}", response_model=List[PopulationTrend])
async def get_population_trends(
    country_code: str,
    start_year: Optional[int] = Query(None, ge=1960, le=2022),
    end_year: Optional[int] = Query(None, ge=1960, le=2022),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get population trends for a specific country"""
    try:
        # Validate input
        if not country_code:
            raise HTTPException(status_code=400, detail="Country code cannot be empty")
        
        if start_year is not None and end_year is not None and start_year > end_year:
            raise HTTPException(
                status_code=400, 
                detail="Start year must be less than or equal to end year"
            )
        
        trends = service.get_population_trends(country_code, start_year, end_year)
        
        if not trends:
            raise HTTPException(
                status_code=404, 
                detail=f"No population trends found for country code {country_code}"
            )
        
        return trends
    except HTTPException:
        # Re-raise HTTPException to preserve its details
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving population trends for {country_code}: {str(e)}"
        )

@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_analytics_dashboard(
    year: Optional[int] = Query(None, ge=1960, le=2022),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get comprehensive analytics data for dashboard visualization"""
    try:
        # If no year is provided, use the default from the service
        if year is not None and (year < 1960 or year > 2022):
            raise HTTPException(
                status_code=400, 
                detail="Year must be between 1960 and 2022"
            )
        
        analytics_data = service.get_analytics_data(year)
        
        if not analytics_data:
            raise HTTPException(
                status_code=404, 
                detail="No analytics data found"
            )
        
        return analytics_data
    except HTTPException:
        # Re-raise HTTPException to preserve its details
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving analytics dashboard data: {str(e)}"
        ) 