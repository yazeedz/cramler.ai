"""
Brand Research Crew - CrewAI agent for understanding brands from their websites
"""
import os
import re
import json
import httpx
from typing import Optional
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from pydantic import BaseModel


class BrandInfo(BaseModel):
    """Structured brand information"""
    name: str = "Unknown"
    description: str = ""
    tagline: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    key_products: Optional[list[str]] = None
    brand_values: Optional[list[str]] = None
    unique_selling_points: Optional[list[str]] = None
    tone_of_voice: Optional[str] = None
    suggested_topics: Optional[list[str]] = None


def _fallback_http_fetch(url: str) -> str:
    """Fallback method using direct HTTP request when Firecrawl fails."""
    try:
        with httpx.Client(timeout=30.0, follow_redirects=True) as client:
            response = client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            response.raise_for_status()
            html = response.text

        # Extract title
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else ""

        # Extract meta description
        desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if not desc_match:
            desc_match = re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
        description = desc_match.group(1).strip() if desc_match else ""

        # Extract OG tags
        og_title_match = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        og_title = og_title_match.group(1).strip() if og_title_match else ""

        og_desc_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        og_description = og_desc_match.group(1).strip() if og_desc_match else ""

        # Remove script and style tags
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<nav[^>]*>.*?</nav>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<footer[^>]*>.*?</footer>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<header[^>]*>.*?</header>', '', html, flags=re.DOTALL | re.IGNORECASE)

        # Remove HTML tags and get text
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'\s+', ' ', text).strip()

        # Truncate if too long
        if len(text) > 15000:
            text = text[:15000] + "..."

        # Build result
        content_parts = []
        if title:
            content_parts.append(f"# {title}")
        if description:
            content_parts.append(f"\n**Description:** {description}")
        if og_title and og_title != title:
            content_parts.append(f"**OG Title:** {og_title}")
        if og_description and og_description != description:
            content_parts.append(f"**OG Description:** {og_description}")
        if text:
            content_parts.append(f"\n## Website Content\n\n{text}")

        return "\n".join(content_parts) if content_parts else "Could not extract content from website"

    except Exception as e:
        return f"Fallback HTTP error: {str(e)}"


@tool
def fetch_website_content(url: str) -> str:
    """
    Fetch and extract text content from a website URL using Firecrawl.
    Falls back to direct HTTP request if Firecrawl fails.

    Args:
        url: The website URL to fetch content from

    Returns:
        Clean markdown content from the website optimized for LLM analysis
    """
    # Ensure URL has protocol
    if not url.startswith(('http://', 'https://')):
        url = f'https://{url}'

    firecrawl_error = None

    # Try Firecrawl first
    try:
        firecrawl_url = os.getenv("FIRECRAWL_URL", "http://localhost:3002")

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{firecrawl_url}/v1/scrape",
                json={
                    "url": url,
                    "formats": ["markdown"],
                    "onlyMainContent": True
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()

        if data.get("success") and data.get("data"):
            result = data["data"]
            content_parts = []

            metadata = result.get("metadata", {})
            if metadata.get("title"):
                content_parts.append(f"# {metadata['title']}")
            if metadata.get("description"):
                content_parts.append(f"\n**Description:** {metadata['description']}")
            if metadata.get("ogTitle") and metadata.get("ogTitle") != metadata.get("title"):
                content_parts.append(f"**OG Title:** {metadata['ogTitle']}")
            if metadata.get("ogDescription") and metadata.get("ogDescription") != metadata.get("description"):
                content_parts.append(f"**OG Description:** {metadata['ogDescription']}")

            markdown = result.get("markdown", "")
            if markdown:
                content_parts.append(f"\n## Website Content\n\n{markdown}")

            if content_parts:
                return "\n".join(content_parts)

        # Firecrawl returned but no content
        firecrawl_error = data.get("error", "No content returned")

    except httpx.TimeoutException:
        firecrawl_error = "Firecrawl timeout"
    except Exception as e:
        firecrawl_error = str(e)

    # Fallback to direct HTTP request
    print(f"Firecrawl failed ({firecrawl_error}), falling back to HTTP request...")
    return _fallback_http_fetch(url)


@tool
def search_brand_info(query: str) -> str:
    """
    Search Google for additional brand information.

    Args:
        query: The search query about the brand

    Returns:
        Search results with brand information
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

        # Extract from knowledge graph if available
        if "knowledge_graph" in data:
            kg = data["knowledge_graph"]
            extracted.append("=== KNOWLEDGE GRAPH ===")
            extracted.append(f"Title: {kg.get('title', 'N/A')}")
            extracted.append(f"Type: {kg.get('type', 'N/A')}")
            if "description" in kg:
                extracted.append(f"Description: {kg.get('description', 'N/A')}")

        # Extract from organic results
        if "organic_results" in data:
            extracted.append("\n=== SEARCH RESULTS ===")
            for i, result in enumerate(data["organic_results"][:5]):
                extracted.append(f"\nResult {i+1}:")
                extracted.append(f"  Title: {result.get('title', 'N/A')}")
                extracted.append(f"  Snippet: {result.get('snippet', 'N/A')}")

        return "\n".join(extracted) if extracted else "No relevant results found"

    except Exception as e:
        return f"Search error: {str(e)}"


def create_brand_research_crew(website_url: str, brand_name: Optional[str] = None) -> Crew:
    """
    Create a CrewAI crew for brand research from website.

    Args:
        website_url: URL of the brand's website
        brand_name: Optional brand name if already known

    Returns:
        Configured Crew instance
    """

    brand_context = f"for brand '{brand_name}'" if brand_name else ""

    # Define the Brand Research Agent
    researcher = Agent(
        role="Brand Analyst",
        goal=f"Analyze and understand the brand {brand_context} from their website {website_url}",
        backstory="""You are an expert brand strategist and analyst with years of experience
        understanding brands, their positioning, and their value propositions.
        You excel at extracting brand essence from website content and marketing materials.
        You are meticulous and always base your analysis on actual content found.
        You NEVER make up information - you only report what you can verify from the sources.""",
        verbose=True,
        allow_delegation=False,
        tools=[fetch_website_content, search_brand_info]
    )

    # Define the research task
    research_task = Task(
        description=f"""
        Analyze the brand from their website: {website_url}

        Your task is to understand this brand thoroughly and extract key information.

        RESEARCH STEPS:
        1. First, fetch and analyze the website content using fetch_website_content
        2. If needed, search for additional brand information using search_brand_info

        EXTRACT THE FOLLOWING:
        1. Brand Name - The official brand name
        2. Description - A SINGLE concise paragraph (2-4 sentences max) describing what this brand
           is and what they do. Keep it brief and factual. NO multiple paragraphs, NO newlines
           within the description. Written in third person.
        3. Tagline - Their slogan or tagline if they have one
        4. Industry - What industry/sector they operate in (be specific, e.g., "Medical Education Technology")
        5. Target Audience - Who their customers/users are (one sentence)
        6. Key Products/Services - Their main offerings (list up to 5)
        7. Brand Values - Core values the brand embodies (list 3-5)
        8. Unique Selling Points - What makes them different from competitors (list 3-5)
        9. Tone of Voice - How they communicate (e.g., professional, friendly, luxurious, playful)
        10. Suggested Topics - Based on what this brand does, suggest 5-8 relevant topic areas
            they might want to track for AI visibility (e.g., for a skincare brand:
            "anti-aging skincare", "natural ingredients", "sensitive skin solutions")

        IMPORTANT RULES:
        - Base your analysis ONLY on content found from the website and search results
        - If information is not available, use null for that field
        - The description MUST be a single paragraph with NO line breaks or \\n characters
        - Be accurate, professional, and CONCISE
        - The suggested_topics should be specific enough to be useful for tracking AI mentions
        """,
        expected_output="""A JSON object with the brand information in this exact format:
        {
            "name": "brand name",
            "description": "Single concise paragraph, 2-4 sentences, no newlines",
            "tagline": "brand tagline or null",
            "industry": "specific industry/sector",
            "target_audience": "one sentence describing target customers",
            "key_products": ["product1", "product2"] or null,
            "brand_values": ["value1", "value2"] or null,
            "unique_selling_points": ["usp1", "usp2"] or null,
            "tone_of_voice": "description of brand voice",
            "suggested_topics": ["topic1", "topic2", "topic3"]
        }

        CRITICAL: The description field must be a single paragraph with NO \\n or newline characters.
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


def research_brand(website_url: str, brand_name: Optional[str] = None) -> BrandInfo:
    """
    Research a brand from their website using the CrewAI crew.

    Args:
        website_url: URL of the brand's website
        brand_name: Optional brand name if already known

    Returns:
        BrandInfo with extracted data
    """
    crew = create_brand_research_crew(website_url, brand_name)
    result = crew.kickoff()

    # Parse the result
    try:
        # Get the raw output
        output = str(result)

        # Try to extract JSON from the output
        if "```json" in output:
            output = output.split("```json")[1].split("```")[0]
        elif "```" in output:
            output = output.split("```")[1].split("```")[0]

        # Parse the JSON
        data = json.loads(output.strip())
        # Filter out None values so Pydantic uses defaults
        filtered_data = {k: v for k, v in data.items() if v is not None}

        # Clean up description - remove any newlines and make it a single paragraph
        if 'description' in filtered_data and filtered_data['description']:
            desc = filtered_data['description']
            # Replace literal \n and actual newlines with spaces
            desc = desc.replace('\\n', ' ').replace('\n', ' ')
            # Collapse multiple spaces
            desc = re.sub(r'\s+', ' ', desc).strip()
            filtered_data['description'] = desc

        return BrandInfo(**filtered_data)
    except (json.JSONDecodeError, Exception) as e:
        # Return basic info if parsing fails
        return BrandInfo(
            name=brand_name or "Unknown",
            description=f"Error parsing result: {str(e)}"
        )
