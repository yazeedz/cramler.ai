"""
Product Research API - FastAPI server for CrewAI product research
"""
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from product_crew import research_product, ProductInfo

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Product Research API",
    description="CrewAI-powered product research service with autonomous web search",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProductResearchRequest(BaseModel):
    """Request model for product research"""
    product_id: str
    product_name: str
    user_id: str
    callback_url: Optional[str] = None


class ProductResearchResponse(BaseModel):
    """Response model for product research"""
    success: bool
    product_id: str
    data: Optional[ProductInfo] = None
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "product-research-api", "version": "2.0.0"}


@app.post("/research", response_model=ProductResearchResponse)
async def research_product_endpoint(request: ProductResearchRequest):
    """
    Research a product using CrewAI with autonomous web search.

    The agent will:
    1. Search for the product to get general info and pricing
    2. Search for ingredients
    3. Search for reviews and claims
    4. Compile comprehensive product information
    """
    try:
        # Run CrewAI research (agent will do its own searches)
        product_info = research_product(request.product_name)

        return ProductResearchResponse(
            success=True,
            product_id=request.product_id,
            data=product_info
        )

    except Exception as e:
        return ProductResearchResponse(
            success=False,
            product_id=request.product_id,
            error=str(e)
        )


@app.post("/research/simple")
async def research_product_simple(request: ProductResearchRequest):
    """
    Simplified research endpoint that returns data in n8n-compatible format.
    The agent autonomously searches for product information.
    """
    try:
        # Run CrewAI research (agent will do its own searches)
        product_info = research_product(request.product_name)

        # Return in format expected by n8n workflow
        return {
            "product_id": request.product_id,
            "user_id": request.user_id,
            "callback_url": request.callback_url,
            "updateData": {
                "name": product_info.name,
                "brand": product_info.brand,
                "description": product_info.description,
                "ingredients": product_info.ingredients,
                "claims": product_info.claims,
                "price": product_info.price,
                "target_audience": product_info.target_audience,
                "main_category": product_info.main_category,
                "sub_category": product_info.sub_category,
                "product_type": product_info.product_type,
                "what_it_does": product_info.what_it_does,
                "main_difference": product_info.main_difference,
                "status": "ready"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
