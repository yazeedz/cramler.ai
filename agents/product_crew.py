"""
Product Research Crew - CrewAI agent for extracting product information
"""
import os
import json
import httpx
from typing import Optional
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from pydantic import BaseModel


class ProductInfo(BaseModel):
    """Structured product information"""
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[list[str]] = None
    claims: Optional[list[str]] = None
    price: Optional[str] = None
    target_audience: Optional[str] = None
    main_category: Optional[str] = None
    sub_category: Optional[str] = None
    product_type: Optional[str] = None
    what_it_does: Optional[str] = None
    main_difference: Optional[str] = None


@tool
def search_google(query: str) -> str:
    """
    Search Google for product information using SerpAPI.

    Args:
        query: The search query (e.g., "CeraVe Hydrating Cleanser ingredients")

    Returns:
        Formatted search results with product information, snippets, and related data
    """
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return "Error: SERPAPI_API_KEY not configured"

    try:
        url = "https://serpapi.com/search.json"
        params = {
            "q": query,
            "api_key": api_key,
            "engine": "google"
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        extracted = []

        # Extract from immersive_products (shopping results)
        if "immersive_products" in data:
            extracted.append("=== SHOPPING RESULTS ===")
            for i, product in enumerate(data["immersive_products"][:5]):
                extracted.append(f"\nProduct {i+1}:")
                extracted.append(f"  Title: {product.get('title', 'N/A')}")
                extracted.append(f"  Source: {product.get('source', 'N/A')}")
                extracted.append(f"  Price: {product.get('price', 'N/A')}")
                extracted.append(f"  Rating: {product.get('rating', 'N/A')}")
                extracted.append(f"  Reviews: {product.get('reviews', 'N/A')}")

        # Extract from organic results
        if "organic_results" in data:
            extracted.append("\n\n=== ORGANIC SEARCH RESULTS ===")
            for i, result in enumerate(data["organic_results"][:5]):
                extracted.append(f"\nResult {i+1}:")
                extracted.append(f"  Title: {result.get('title', 'N/A')}")
                extracted.append(f"  Snippet: {result.get('snippet', 'N/A')}")
                extracted.append(f"  Source: {result.get('source', 'N/A')}")
                extracted.append(f"  Link: {result.get('link', 'N/A')}")

        # Extract from related questions (People Also Ask)
        if "related_questions" in data:
            extracted.append("\n\n=== RELATED QUESTIONS ===")
            for i, q in enumerate(data["related_questions"][:3]):
                extracted.append(f"\nQ: {q.get('question', 'N/A')}")
                if "text_blocks" in q:
                    for block in q["text_blocks"]:
                        if block.get("type") == "paragraph":
                            extracted.append(f"A: {block.get('snippet', 'N/A')[:500]}...")
                elif "snippet" in q:
                    extracted.append(f"A: {q.get('snippet', 'N/A')[:500]}...")

        # Extract from knowledge graph if available
        if "knowledge_graph" in data:
            kg = data["knowledge_graph"]
            extracted.append("\n\n=== KNOWLEDGE GRAPH ===")
            extracted.append(f"Title: {kg.get('title', 'N/A')}")
            extracted.append(f"Type: {kg.get('type', 'N/A')}")
            if "description" in kg:
                extracted.append(f"Description: {kg.get('description', 'N/A')}")

        return "\n".join(extracted) if extracted else "No relevant results found"

    except Exception as e:
        return f"Search error: {str(e)}"


def create_product_research_crew(product_name: str) -> Crew:
    """
    Create a CrewAI crew for product research.

    Args:
        product_name: Name of the product to research

    Returns:
        Configured Crew instance
    """

    # Define the Product Research Agent
    researcher = Agent(
        role="Product Research Specialist",
        goal=f"Research and extract comprehensive product information for '{product_name}'",
        backstory="""You are an expert product researcher specializing in beauty, skincare, and consumer products.
        You have years of experience analyzing product information from various sources.
        You are meticulous about accuracy and NEVER make up information.
        You use web search to find accurate, up-to-date product information.
        You may run multiple searches to gather comprehensive data about a product.""",
        verbose=True,
        allow_delegation=False,
        tools=[search_google]
    )

    # Define the research task
    research_task = Task(
        description=f"""
        Research the product "{product_name}" thoroughly and extract the following information:

        1. Product Name - The official/full product name
        2. Brand - The brand that makes this product
        3. Description - A comprehensive description of the product
        4. Price - The typical retail price (find current pricing)
        5. Product Type - What type of product it is (serum, cream, cleanser, etc.)
        6. Main Category - The main category (Skincare, Makeup, Haircare, etc.)
        7. Sub Category - More specific category
        8. What It Does - The main benefits and functions
        9. Target Audience - Who this product is designed for
        10. Key Ingredients - Main active ingredients
        11. Product Claims - Marketing claims made about the product
        12. Main Difference - What makes this product unique/different from competitors

        RESEARCH STRATEGY:
        1. First, search for the product name to get general info and pricing
        2. Search for "[product name] ingredients" to find ingredient information
        3. Search for "[product name] review" to understand benefits and claims
        4. If needed, search for "[product name] vs" to understand differentiators

        IMPORTANT RULES:
        - Use the search_google tool to find information
        - Run multiple searches if needed to gather comprehensive data
        - ONLY use information from the search results
        - If information is not found, use null for that field
        - Do NOT make up or hallucinate any information
        - Be precise and accurate
        """,
        expected_output="""A JSON object with the extracted product information in this exact format:
        {
            "name": "exact product name",
            "brand": "brand name or null",
            "description": "product description or null",
            "ingredients": ["ingredient1", "ingredient2"] or null,
            "claims": ["claim1", "claim2"] or null,
            "price": "price string or null",
            "target_audience": "target audience or null",
            "main_category": "category or null",
            "sub_category": "subcategory or null",
            "product_type": "type or null",
            "what_it_does": "description of what it does or null",
            "main_difference": "unique selling point or null"
        }

        Return ONLY the JSON object, no other text.""",
        agent=researcher
    )

    # Create and return the crew
    crew = Crew(
        agents=[researcher],
        tasks=[research_task],
        process=Process.sequential,
        verbose=True
    )

    return crew


def research_product(product_name: str) -> ProductInfo:
    """
    Research a product using the CrewAI crew.

    Args:
        product_name: Name of the product to research

    Returns:
        ProductInfo with extracted data
    """
    crew = create_product_research_crew(product_name)
    result = crew.kickoff()

    # Parse the result
    try:
        # Get the raw output
        output = str(result)

        # Try to extract JSON from the output
        # Sometimes the LLM wraps it in markdown code blocks
        if "```json" in output:
            output = output.split("```json")[1].split("```")[0]
        elif "```" in output:
            output = output.split("```")[1].split("```")[0]

        # Parse the JSON
        data = json.loads(output.strip())
        return ProductInfo(**data)
    except (json.JSONDecodeError, Exception) as e:
        # Return basic info if parsing fails
        return ProductInfo(
            name=product_name,
            description=f"Error parsing result: {str(e)}"
        )
