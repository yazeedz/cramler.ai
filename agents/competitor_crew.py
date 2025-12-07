"""
Competitor Research - Fast competitor discovery using smart search strategies
"""
import os
import re
import json
import httpx
import asyncio
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from pydantic import BaseModel


class CompetitorInfo(BaseModel):
    """Information about a single competitor"""
    name: str
    website: Optional[str] = None
    description: str = ""
    similarity_reason: str = ""
    strengths: Optional[list[str]] = None
    target_audience: Optional[str] = None


class CompetitorAnalysis(BaseModel):
    """Complete competitor analysis result"""
    brand_name: str = ""
    industry: str = ""
    competitors: list[CompetitorInfo] = []
    market_position: Optional[str] = None
    competitive_landscape: Optional[str] = None


def extract_keywords_from_description(description: str) -> list[str]:
    """
    Extract important keywords from the brand description that can be used
    for more targeted competitor searches.

    Examples:
    - "USMLE Step 1 preparation" -> ["USMLE", "Step 1", "medical board exam"]
    - "AI-powered skincare recommendations" -> ["AI skincare", "skincare app"]
    """
    # Common patterns to look for
    keywords = []

    # Medical/test prep patterns
    medical_terms = re.findall(r'\b(USMLE|MCAT|NCLEX|Step [123]|COMLEX|NBME|board exam|medical school|QBank|question bank)\b', description, re.IGNORECASE)
    keywords.extend([t.upper() if t.upper() in ['USMLE', 'MCAT', 'NCLEX', 'COMLEX', 'NBME'] else t for t in medical_terms])

    # Tech/SaaS patterns
    tech_terms = re.findall(r'\b(AI[- ]powered|machine learning|SaaS|B2B|B2C|API|platform|app|software)\b', description, re.IGNORECASE)
    keywords.extend(tech_terms)

    # E-commerce patterns
    ecom_terms = re.findall(r'\b(e-commerce|marketplace|DTC|direct-to-consumer|subscription|retail)\b', description, re.IGNORECASE)
    keywords.extend(ecom_terms)

    # Extract quoted phrases
    quoted = re.findall(r'"([^"]+)"', description)
    keywords.extend(quoted)

    # Extract capitalized multi-word terms (likely proper nouns/brands)
    caps_terms = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b', description)
    keywords.extend(caps_terms)

    return list(set(keywords))


def generate_smart_queries(
    brand_name: str,
    brand_description: str,
    industry: str,
    topics: list[str]
) -> list[str]:
    """
    Generate smart search queries based on the brand context.
    Returns a list of targeted queries that will find relevant competitors.
    """
    queries = []

    # Extract keywords from description
    keywords = extract_keywords_from_description(brand_description)

    # Add keyword-based queries (most specific, likely to find direct competitors)
    for keyword in keywords[:3]:  # Limit to top 3 keywords
        queries.append(f"best {keyword} apps 2024")
        queries.append(f"{keyword} alternatives")

    # Add topic-based queries
    for topic in topics[:3]:  # Limit to top 3 topics
        queries.append(f"top {topic} companies")
        queries.append(f"best {topic} platforms 2024")

    # Add industry-specific queries
    queries.append(f"{industry} market leaders 2024")
    queries.append(f"top {industry} startups")

    # Add "alternatives to" queries if brand is somewhat known
    # This often surfaces competitor lists
    if len(brand_name) > 3:
        queries.append(f"{brand_name} alternatives")
        queries.append(f"apps like {brand_name}")

    # Deduplicate while preserving order
    seen = set()
    unique_queries = []
    for q in queries:
        q_lower = q.lower()
        if q_lower not in seen:
            seen.add(q_lower)
            unique_queries.append(q)

    return unique_queries[:8]  # Limit to 8 queries max


def search_serpapi(query: str) -> dict:
    """
    Execute a single SerpAPI search and return extracted results.
    """
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return {"query": query, "error": "SERPAPI_API_KEY not configured", "results": []}

    try:
        url = "https://serpapi.com/search.json"
        params = {
            "q": query,
            "api_key": api_key,
            "engine": "google",
            "num": 10
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        results = []

        # Extract from organic results
        if "organic_results" in data:
            for result in data["organic_results"][:10]:
                results.append({
                    "title": result.get("title", ""),
                    "link": result.get("link", ""),
                    "snippet": result.get("snippet", ""),
                    "source": result.get("source", "")
                })

        # Extract from knowledge graph if available
        if "knowledge_graph" in data:
            kg = data["knowledge_graph"]
            if kg.get("title"):
                results.insert(0, {
                    "title": kg.get("title", ""),
                    "link": kg.get("website", ""),
                    "snippet": kg.get("description", ""),
                    "source": "knowledge_graph"
                })

        return {"query": query, "results": results, "error": None}

    except Exception as e:
        return {"query": query, "error": str(e), "results": []}


def parallel_search(queries: list[str], max_workers: int = 4) -> list[dict]:
    """
    Execute multiple searches in parallel for speed.
    """
    results = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_query = {executor.submit(search_serpapi, q): q for q in queries}

        for future in as_completed(future_to_query):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                query = future_to_query[future]
                results.append({"query": query, "error": str(e), "results": []})

    return results


def extract_companies_from_results(
    search_results: list[dict],
    brand_name: str,
    topics: list[str]
) -> list[CompetitorInfo]:
    """
    Extract unique companies from search results and deduplicate.
    """
    # Common company indicators
    company_patterns = [
        r'\b(\w+(?:\s+\w+)?)\s+(?:is|offers|provides|helps|enables)',
        r'\b(\w+(?:\.\w+)?\.(?:com|io|ai|co|app))\b',
        r'^(\w+(?:\s+\w+)?)\s*[-–—:]',
    ]

    # Known test prep companies (for medical/education context)
    known_competitors = {
        "uworld": {"name": "UWorld", "website": "https://www.uworld.com", "category": "test preparation"},
        "amboss": {"name": "Amboss", "website": "https://www.amboss.com", "category": "medical education"},
        "kaplan": {"name": "Kaplan", "website": "https://www.kaplan.com", "category": "test preparation"},
        "lecturio": {"name": "Lecturio", "website": "https://www.lecturio.com", "category": "medical education"},
        "boards and beyond": {"name": "Boards and Beyond", "website": "https://www.boardsbeyond.com", "category": "medical education"},
        "sketchy": {"name": "Sketchy", "website": "https://www.sketchy.com", "category": "medical education"},
        "pathoma": {"name": "Pathoma", "website": "https://www.pathoma.com", "category": "medical education"},
        "first aid": {"name": "First Aid for USMLE", "website": "https://www.firstaidteam.com", "category": "medical education"},
        "anki": {"name": "Anki", "website": "https://apps.ankiweb.net", "category": "flashcard learning"},
        "osmosis": {"name": "Osmosis", "website": "https://www.osmosis.org", "category": "medical education"},
        "quizlet": {"name": "Quizlet", "website": "https://www.quizlet.com", "category": "study tools"},
        "princeton review": {"name": "The Princeton Review", "website": "https://www.princetonreview.com", "category": "test preparation"},
        "magoosh": {"name": "Magoosh", "website": "https://magoosh.com", "category": "test preparation"},
    }

    found_companies = {}
    brand_name_lower = brand_name.lower()

    # Sites to exclude (not actual competitors - these are aggregators, review sites, social media)
    excluded_domains = {
        # Social media
        "quora", "reddit", "youtube", "facebook", "twitter", "linkedin",
        "wikipedia", "medium", "instagram", "tiktok", "pinterest",
        # Review/comparison sites
        "yelp", "glassdoor", "indeed", "trustpilot", "g2", "capterra",
        "intelligent", "bestcolleges", "usnews", "nerdwallet", "forbes",
        "businessinsider", "techcrunch", "theverge", "cnet", "zdnet",
        "testprepinsight", "collegerover", "beyondthestates", "thematchguy",
        "crushtheusmleexam", "medschoolinsiders", "studentdoctor",
        # Tech giants
        "google", "apple", "amazon", "microsoft", "play"
    }

    # First pass: look for known competitors in results
    for search_result in search_results:
        for result in search_result.get("results", []):
            title_lower = result.get("title", "").lower()
            snippet_lower = result.get("snippet", "").lower()
            combined = f"{title_lower} {snippet_lower}"

            for key, company_info in known_competitors.items():
                if key in combined and key != brand_name_lower:
                    if company_info["name"] not in found_companies:
                        found_companies[company_info["name"]] = {
                            "name": company_info["name"],
                            "website": company_info["website"] or result.get("link"),
                            "description": "",
                            "similarity_reason": company_info["category"],
                            "snippet": result.get("snippet", ""),
                            "mentions": 1
                        }
                    else:
                        found_companies[company_info["name"]]["mentions"] += 1

    # Second pass: extract companies from titles and snippets
    for search_result in search_results:
        for result in search_result.get("results", []):
            title = result.get("title", "")
            link = result.get("link", "")
            snippet = result.get("snippet", "")

            # Extract domain name as potential company
            if link:
                domain_match = re.search(r'https?://(?:www\.)?([^/]+)', link)
                if domain_match:
                    domain = domain_match.group(1)
                    # Extract company name from domain
                    company_from_domain = domain.split('.')[0]

                    # Skip excluded domains
                    if company_from_domain.lower() in excluded_domains:
                        continue

                    if len(company_from_domain) > 2 and company_from_domain.lower() != brand_name_lower:
                        # Capitalize properly
                        company_name = company_from_domain.title()

                        if company_name not in found_companies:
                            # Determine relevance based on topics
                            relevance = []
                            for topic in topics:
                                if topic.lower() in title.lower() or topic.lower() in snippet.lower():
                                    relevance.append(topic)

                            if relevance:
                                found_companies[company_name] = {
                                    "name": company_name,
                                    "website": f"https://{domain}",
                                    "description": "",
                                    "similarity_reason": ", ".join(relevance[:2]),
                                    "snippet": snippet,
                                    "mentions": 1
                                }
                        else:
                            found_companies[company_name]["mentions"] += 1

    # Convert to CompetitorInfo objects, sorted by mentions
    competitors = []
    sorted_companies = sorted(found_companies.values(), key=lambda x: x.get("mentions", 0), reverse=True)

    for company in sorted_companies[:10]:  # Limit to top 10
        # Create description from snippet if available
        description = company.get("snippet", "")
        if description and len(description) > 150:
            description = description[:147] + "..."

        competitors.append(CompetitorInfo(
            name=company["name"],
            website=company.get("website"),
            description=description,
            similarity_reason=company.get("similarity_reason", "Same industry"),
            strengths=None,
            target_audience=None
        ))

    return competitors


def research_competitors(
    brand_name: str,
    brand_description: str,
    industry: str,
    topics: list[str]
) -> CompetitorAnalysis:
    """
    Research competitors for a brand using parallel web searches.
    This is a fast, direct approach without CrewAI overhead.

    Args:
        brand_name: Name of the brand
        brand_description: Description of what the brand does
        industry: The industry/sector
        topics: List of relevant topics

    Returns:
        CompetitorAnalysis with competitor data
    """
    try:
        # Generate smart queries based on context
        queries = generate_smart_queries(brand_name, brand_description, industry, topics)

        print(f"[Competitor Research] Generated {len(queries)} search queries:")
        for q in queries:
            print(f"  - {q}")

        # Execute searches in parallel
        print(f"[Competitor Research] Executing parallel searches...")
        search_results = parallel_search(queries, max_workers=4)

        # Count successful searches
        successful = sum(1 for r in search_results if not r.get("error"))
        print(f"[Competitor Research] {successful}/{len(queries)} searches completed successfully")

        # Extract companies from results
        competitors = extract_companies_from_results(search_results, brand_name, topics)

        print(f"[Competitor Research] Found {len(competitors)} potential competitors")

        # Determine market position based on competitor count
        if len(competitors) > 7:
            market_position = "Competitive market with many established players"
        elif len(competitors) > 3:
            market_position = "Moderately competitive market"
        else:
            market_position = "Emerging market with limited competition"

        return CompetitorAnalysis(
            brand_name=brand_name,
            industry=industry,
            competitors=competitors,
            market_position=market_position,
            competitive_landscape=f"Found {len(competitors)} competitors in {industry} space across topics: {', '.join(topics[:3])}"
        )

    except Exception as e:
        print(f"[Competitor Research] Error: {str(e)}")
        return CompetitorAnalysis(
            brand_name=brand_name,
            industry=industry,
            competitors=[],
            market_position=f"Error analyzing competitors: {str(e)}"
        )


# Keep CrewAI version for more thorough research if needed
def research_competitors_with_crewai(
    brand_name: str,
    brand_description: str,
    industry: str,
    topics: list[str]
) -> CompetitorAnalysis:
    """
    Research competitors using CrewAI for more thorough analysis.
    This is slower but may provide more detailed results.
    """
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import tool

    @tool
    def search_competitors_tool(query: str) -> str:
        """Search the web for competitor information."""
        result = search_serpapi(query)
        if result.get("error"):
            return f"Error: {result['error']}"

        output = []
        for r in result.get("results", []):
            output.append(f"Title: {r.get('title')}")
            output.append(f"Link: {r.get('link')}")
            output.append(f"Snippet: {r.get('snippet')}")
            output.append("---")

        return "\n".join(output) if output else "No results found"

    topics_str = ", ".join(topics) if topics else "N/A"
    keywords = extract_keywords_from_description(brand_description)
    keywords_str = ", ".join(keywords) if keywords else "N/A"

    researcher = Agent(
        role="Competitor Research Specialist",
        goal=f"Find the top competitors for {brand_name} in the {industry} space",
        backstory="""You are an expert market researcher who quickly identifies
        competitors by searching for companies in the same space. You use specific
        keywords from the brand description to find direct competitors.""",
        verbose=True,
        allow_delegation=False,
        tools=[search_competitors_tool]
    )

    research_task = Task(
        description=f"""
        Find competitors for {brand_name}.

        BRAND DESCRIPTION: {brand_description}
        INDUSTRY: {industry}
        TOPICS: {topics_str}
        KEY TERMS FROM DESCRIPTION: {keywords_str}

        SEARCH STRATEGY:
        1. Search for "{keywords[0]} alternatives" if keywords available
        2. Search for "best {topics[0]} apps 2024" for top topic
        3. Search for "{industry} market leaders"

        Find 5-8 real competitors. Return JSON with this format:
        {{
            "brand_name": "{brand_name}",
            "industry": "{industry}",
            "competitors": [
                {{
                    "name": "Competitor Name",
                    "website": "https://example.com",
                    "description": "What they do",
                    "similarity_reason": "Why they compete"
                }}
            ],
            "market_position": "Market overview"
        }}
        """,
        expected_output="JSON object with competitors",
        agent=researcher
    )

    crew = Crew(
        agents=[researcher],
        tasks=[research_task],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()

    try:
        output = str(result)
        if "```json" in output:
            output = output.split("```json")[1].split("```")[0]
        elif "```" in output:
            output = output.split("```")[1].split("```")[0]

        data = json.loads(output.strip())

        competitors = []
        for comp in data.get("competitors", []):
            filtered_comp = {k: v for k, v in comp.items() if v is not None}
            competitors.append(CompetitorInfo(**filtered_comp))

        return CompetitorAnalysis(
            brand_name=data.get("brand_name", brand_name),
            industry=data.get("industry", industry),
            competitors=competitors,
            market_position=data.get("market_position"),
            competitive_landscape=data.get("competitive_landscape")
        )

    except (json.JSONDecodeError, Exception) as e:
        return CompetitorAnalysis(
            brand_name=brand_name,
            industry=industry,
            competitors=[],
            market_position=f"Error analyzing competitors: {str(e)}"
        )
