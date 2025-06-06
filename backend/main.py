from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import country_router, analytics_router

app = FastAPI(title="Population Trends API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(country_router)
app.include_router(analytics_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    from os import getenv

    host = getenv("HOST", "0.0.0.0")
    port = int(getenv("PORT", "8080"))  # Default port is 8080 if not specified
    uvicorn.run(app, host=host, port=port)