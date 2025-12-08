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
from brand_crew import research_brand, BrandInfo
from competitor_crew import research_competitors, CompetitorAnalysis
from prompt_crew import generate_prompts_fast, generate_prompts_for_brand, PromptGenerationResult

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


class BrandResearchRequest(BaseModel):
    """Request model for brand research"""
    website_url: str
    brand_name: Optional[str] = None
    user_id: str
    callback_url: Optional[str] = None


class BrandResearchResponse(BaseModel):
    """Response model for brand research"""
    success: bool
    data: Optional[BrandInfo] = None
    error: Optional[str] = None


@app.post("/brand/research", response_model=BrandResearchResponse)
async def research_brand_endpoint(request: BrandResearchRequest):
    """
    Research a brand from their website using CrewAI.

    The agent will:
    1. Fetch and analyze the website content
    2. Search for additional brand information if needed
    3. Extract brand description, values, and suggested topics
    """
    try:
        # Run CrewAI brand research
        brand_info = research_brand(request.website_url, request.brand_name)

        return BrandResearchResponse(
            success=True,
            data=brand_info
        )

    except Exception as e:
        return BrandResearchResponse(
            success=False,
            error=str(e)
        )


@app.post("/brand/research/simple")
async def research_brand_simple(request: BrandResearchRequest):
    """
    Simplified brand research endpoint that returns data in n8n-compatible format.
    The agent autonomously analyzes the brand website.
    """
    try:
        # Run CrewAI brand research
        brand_info = research_brand(request.website_url, request.brand_name)

        # Return in format expected by n8n workflow
        return {
            "website_url": request.website_url,
            "brand_name": request.brand_name,
            "user_id": request.user_id,
            "callback_url": request.callback_url,
            "brandData": {
                "name": brand_info.name,
                "description": brand_info.description or "",
                "tagline": brand_info.tagline,
                "industry": brand_info.industry,
                "target_audience": brand_info.target_audience,
                "key_products": brand_info.key_products,
                "brand_values": brand_info.brand_values,
                "unique_selling_points": brand_info.unique_selling_points,
                "tone_of_voice": brand_info.tone_of_voice,
                "suggested_topics": brand_info.suggested_topics or []
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CompetitorResearchRequest(BaseModel):
    """Request model for competitor research"""
    brand_name: str
    brand_description: str
    industry: str
    topics: list[str]
    user_id: str
    request_id: Optional[str] = None
    callback_url: Optional[str] = None


class CompetitorResearchResponse(BaseModel):
    """Response model for competitor research"""
    success: bool
    data: Optional[CompetitorAnalysis] = None
    error: Optional[str] = None


@app.post("/competitors/research", response_model=CompetitorResearchResponse)
async def research_competitors_endpoint(request: CompetitorResearchRequest):
    """
    Research competitors for a brand using CrewAI.

    The agent will:
    1. Search for direct competitors
    2. Search for alternative solutions
    3. Analyze the competitive landscape
    """
    try:
        competitor_analysis = research_competitors(
            brand_name=request.brand_name,
            brand_description=request.brand_description,
            industry=request.industry,
            topics=request.topics
        )

        return CompetitorResearchResponse(
            success=True,
            data=competitor_analysis
        )

    except Exception as e:
        return CompetitorResearchResponse(
            success=False,
            error=str(e)
        )


@app.post("/competitors/research/simple")
async def research_competitors_simple(request: CompetitorResearchRequest):
    """
    Simplified competitor research endpoint that returns data in n8n-compatible format.
    """
    try:
        competitor_analysis = research_competitors(
            brand_name=request.brand_name,
            brand_description=request.brand_description,
            industry=request.industry,
            topics=request.topics
        )

        # Return in format expected by n8n workflow
        return {
            "brand_name": request.brand_name,
            "user_id": request.user_id,
            "request_id": request.request_id,
            "callback_url": request.callback_url,
            "competitorData": {
                "brand_name": competitor_analysis.brand_name,
                "industry": competitor_analysis.industry,
                "competitors": [
                    {
                        "name": c.name,
                        "website": c.website,
                        "description": c.description,
                        "similarity_reason": c.similarity_reason,
                        "strengths": c.strengths or [],
                        "target_audience": c.target_audience
                    }
                    for c in competitor_analysis.competitors
                ],
                "market_position": competitor_analysis.market_position,
                "competitive_landscape": competitor_analysis.competitive_landscape
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class PromptGenerationRequest(BaseModel):
    """Request model for prompt generation"""
    brand_id: str
    brand_name: str
    brand_description: str
    topics: list[str] = []
    competitors: list[str] = []
    user_id: str
    organization_id: str
    num_topics: int = 5
    prompts_per_topic: int = 5
    use_fast_mode: bool = True  # Use fast OpenAI API instead of CrewAI
    callback_url: Optional[str] = None


class PromptGenerationResponse(BaseModel):
    """Response model for prompt generation"""
    success: bool
    brand_id: str
    data: Optional[PromptGenerationResult] = None
    error: Optional[str] = None


@app.post("/prompts/generate", response_model=PromptGenerationResponse)
async def generate_prompts_endpoint(request: PromptGenerationRequest):
    """
    Generate research topics and prompts for AI visibility tracking.

    The agent will:
    1. Analyze the brand description and industry topics
    2. Generate relevant research topics
    3. Create consumer-style prompts for each topic
    4. Return structured data for storage in Supabase
    """
    try:
        # Choose generation method based on request
        if request.use_fast_mode:
            result = generate_prompts_fast(
                brand_name=request.brand_name,
                brand_description=request.brand_description,
                topics=request.topics,
                competitors=request.competitors,
                num_topics=request.num_topics,
                prompts_per_topic=request.prompts_per_topic
            )
        else:
            result = generate_prompts_for_brand(
                brand_name=request.brand_name,
                brand_description=request.brand_description,
                topics=request.topics,
                competitors=request.competitors,
                num_topics=request.num_topics,
                prompts_per_topic=request.prompts_per_topic
            )

        return PromptGenerationResponse(
            success=True,
            brand_id=request.brand_id,
            data=result
        )

    except Exception as e:
        return PromptGenerationResponse(
            success=False,
            brand_id=request.brand_id,
            error=str(e)
        )


@app.post("/prompts/generate/simple")
async def generate_prompts_simple(request: PromptGenerationRequest):
    """
    Simplified prompt generation endpoint that returns data in n8n-compatible format.
    This is designed to be used in n8n workflows for storing in Supabase.
    """
    try:
        # Choose generation method based on request
        if request.use_fast_mode:
            result = generate_prompts_fast(
                brand_name=request.brand_name,
                brand_description=request.brand_description,
                topics=request.topics,
                competitors=request.competitors,
                num_topics=request.num_topics,
                prompts_per_topic=request.prompts_per_topic
            )
        else:
            result = generate_prompts_for_brand(
                brand_name=request.brand_name,
                brand_description=request.brand_description,
                topics=request.topics,
                competitors=request.competitors,
                num_topics=request.num_topics,
                prompts_per_topic=request.prompts_per_topic
            )

        # Return in format expected by n8n workflow for Supabase storage
        return {
            "brand_id": request.brand_id,
            "brand_name": request.brand_name,
            "user_id": request.user_id,
            "organization_id": request.organization_id,
            "callback_url": request.callback_url,
            "generation_result": {
                "brand_name": result.brand_name,
                "industry": result.industry,
                "total_prompts": result.total_prompts,
                "topics": [
                    {
                        "name": topic.name,
                        "slug": topic.slug,
                        "description": topic.description,
                        "prompts": [
                            {
                                "prompt_text": prompt.prompt_text,
                                "intent": prompt.intent,
                                "expected_mentions": prompt.expected_mentions
                            }
                            for prompt in topic.prompts
                        ]
                    }
                    for topic in result.topics
                ]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
