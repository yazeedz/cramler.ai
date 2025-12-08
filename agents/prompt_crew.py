"""
Prompt Generation Crew - Generates research topics and prompts for AI visibility tracking
"""
import os
import json
from typing import Optional
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process


class GeneratedPrompt(BaseModel):
    """A single generated prompt for visibility tracking"""
    prompt_text: str
    intent: str  # what this prompt is trying to measure
    expected_mentions: list[str] = []  # brands expected to be mentioned


class GeneratedTopic(BaseModel):
    """A generated topic with its prompts"""
    name: str
    slug: str
    description: str
    prompts: list[GeneratedPrompt] = []


class PromptGenerationResult(BaseModel):
    """Complete result of prompt generation"""
    brand_name: str
    industry: str
    topics: list[GeneratedTopic] = []
    total_prompts: int = 0


def generate_prompts_for_brand(
    brand_name: str,
    brand_description: str,
    topics: list[str],
    competitors: list[str] = [],
    num_topics: int = 5,
    prompts_per_topic: int = 5
) -> PromptGenerationResult:
    """
    Generate research topics and brand-agnostic prompts using CrewAI.

    The prompts are designed to be neutral/generic questions that:
    1. Don't mention any specific brand names
    2. Don't mention competitors
    3. Ask general category/topic questions that reveal which brands AI recommends
    4. Sound like natural consumer questions

    Args:
        brand_name: Name of the brand (used for context only, not in prompts)
        brand_description: Description of what the brand does (used for topic generation)
        topics: List of relevant topics/categories
        competitors: List of competitor names (ignored - prompts are brand-agnostic)
        num_topics: Number of topics to generate (default 5)
        prompts_per_topic: Number of prompts per topic (default 5)

    Returns:
        PromptGenerationResult with generated topics and brand-agnostic prompts
    """

    topics_str = ", ".join(topics) if topics else "general"

    # Create the prompt strategist agent
    prompt_strategist = Agent(
        role="AI Visibility Prompt Strategist",
        goal="Generate brand-agnostic prompts to measure AI shopping assistant recommendations",
        backstory="""You are an expert in AI visibility and brand monitoring. You understand how
        consumers ask AI assistants like ChatGPT, Claude, Perplexity, and Gemini for product
        recommendations.

        Your specialty is creating NEUTRAL, BRAND-AGNOSTIC questions - questions that:
        - NEVER mention any specific brand names
        - NEVER ask about comparisons between named brands
        - Ask general "what's the best..." or "what do you recommend..." style questions
        - Let the AI assistant naturally reveal which brands it recommends

        This approach gives unbiased results showing which brands AI assistants organically recommend.""",
        verbose=True,
        allow_delegation=False
    )

    # Create the task
    generation_task = Task(
        description=f"""Generate {num_topics} research topics and {prompts_per_topic} BRAND-AGNOSTIC prompts per topic.

CONTEXT (for understanding the industry - DO NOT use brand names in prompts):
- Industry Description: {brand_description}
- Industry Topics: {topics_str}

CRITICAL REQUIREMENTS:

1. TOPICS: Create {num_topics} distinct topics relevant to this industry.
   Topics should be specific product categories or use cases.
   Examples for skincare: "Anti-aging skincare", "Acne treatment", "Daily moisturizers", "Vitamin C serums"
   Examples for medical education: "USMLE Step 1 prep", "Medical flashcard apps", "Clinical rotation resources"

2. PROMPTS: For each topic, create {prompts_per_topic} BRAND-AGNOSTIC prompts.

   IMPORTANT - Prompts must be NEUTRAL and GENERIC:
   ✓ GOOD: "What's the best moisturizer for dry skin?"
   ✓ GOOD: "Which skincare brand do dermatologists recommend?"
   ✓ GOOD: "What are the top-rated anti-aging serums?"
   ✓ GOOD: "Best affordable sunscreen for daily use?"

   ✗ BAD: "How does CeraVe compare to other brands?" (mentions specific brand)
   ✗ BAD: "Is La Roche-Posay good for sensitive skin?" (mentions specific brand)
   ✗ BAD: "Compare Neutrogena vs Cetaphil" (mentions specific brands)

   Prompt categories to cover:
   - Best/Top recommendations: "What's the best X for Y?"
   - Category leaders: "Which brands make the best X?"
   - Use case specific: "What should I use for [specific problem]?"
   - Budget-conscious: "Best affordable X for Y?"
   - Expert recommendations: "What do dermatologists/doctors/experts recommend for X?"
   - Beginner questions: "What X should a beginner start with?"

3. Each prompt MUST:
   - Sound like a natural consumer question
   - NOT contain ANY brand names
   - Be generic enough to get unbiased recommendations
   - Be specific to the topic/category

RETURN FORMAT: Return a valid JSON object with this exact structure:
{{
    "brand_name": "{brand_name}",
    "industry": "{topics_str}",
    "topics": [
        {{
            "name": "Topic Name",
            "slug": "topic-name",
            "description": "Brief description of this topic area",
            "prompts": [
                {{
                    "prompt_text": "The brand-agnostic question a consumer would ask",
                    "intent": "visibility|recommendation|sentiment",
                    "expected_mentions": []
                }}
            ]
        }}
    ],
    "total_prompts": {num_topics * prompts_per_topic}
}}

Generate diverse, high-quality BRAND-AGNOSTIC prompts that will reveal organic AI recommendations.""",
        expected_output=f"A JSON object containing {num_topics} topics with {prompts_per_topic} brand-agnostic prompts each",
        agent=prompt_strategist
    )

    # Create and run the crew
    crew = Crew(
        agents=[prompt_strategist],
        tasks=[generation_task],
        process=Process.sequential,
        verbose=True
    )

    try:
        result = crew.kickoff()

        # Parse the result
        output = str(result)

        # Extract JSON from the response
        if "```json" in output:
            output = output.split("```json")[1].split("```")[0]
        elif "```" in output:
            output = output.split("```")[1].split("```")[0]

        data = json.loads(output.strip())

        # Convert to Pydantic models
        generated_topics = []
        total_prompts = 0

        for topic_data in data.get("topics", []):
            prompts = []
            for prompt_data in topic_data.get("prompts", []):
                prompts.append(GeneratedPrompt(
                    prompt_text=prompt_data.get("prompt_text", ""),
                    intent=prompt_data.get("intent", "visibility"),
                    expected_mentions=prompt_data.get("expected_mentions", [])
                ))
                total_prompts += 1

            # Generate slug from name if not provided
            slug = topic_data.get("slug", "")
            if not slug:
                slug = topic_data.get("name", "").lower().replace(" ", "-").replace("/", "-")

            generated_topics.append(GeneratedTopic(
                name=topic_data.get("name", ""),
                slug=slug,
                description=topic_data.get("description", ""),
                prompts=prompts
            ))

        return PromptGenerationResult(
            brand_name=brand_name,
            industry=topics_str,
            topics=generated_topics,
            total_prompts=total_prompts
        )

    except json.JSONDecodeError as e:
        print(f"[Prompt Generation] JSON parsing error: {e}")
        print(f"[Prompt Generation] Raw output: {output[:500]}...")
        return PromptGenerationResult(
            brand_name=brand_name,
            industry=topics_str,
            topics=[],
            total_prompts=0
        )
    except Exception as e:
        print(f"[Prompt Generation] Error: {e}")
        return PromptGenerationResult(
            brand_name=brand_name,
            industry=topics_str,
            topics=[],
            total_prompts=0
        )


def generate_prompts_fast(
    brand_name: str,
    brand_description: str,
    topics: list[str],
    competitors: list[str] = [],
    num_topics: int = 5,
    prompts_per_topic: int = 5
) -> PromptGenerationResult:
    """
    Fast prompt generation using direct OpenAI API call instead of CrewAI.
    Generates BRAND-AGNOSTIC prompts that don't mention any specific brands.
    """
    import openai

    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    topics_str = ", ".join(topics) if topics else "general"

    system_prompt = """You are an AI visibility expert who creates BRAND-AGNOSTIC prompts to test AI shopping assistant recommendations.

Your prompts must be NEUTRAL and GENERIC:
- NEVER mention any specific brand names
- NEVER ask about comparisons between named brands
- Ask general "what's the best..." or "what do you recommend..." style questions
- Let the AI assistant naturally reveal which brands it recommends

This approach gives unbiased results showing which brands AI assistants organically recommend."""

    user_prompt = f"""Generate {num_topics} research topics and {prompts_per_topic} BRAND-AGNOSTIC prompts per topic.

CONTEXT (for understanding the industry only - DO NOT use any brand names in prompts):
- Industry Description: {brand_description}
- Industry Topics: {topics_str}

Create topics specific to this industry. For each topic, create NEUTRAL consumer questions like:
✓ GOOD: "What's the best moisturizer for dry skin?"
✓ GOOD: "Which skincare brands do dermatologists recommend?"
✓ GOOD: "What are the top-rated anti-aging serums?"
✓ GOOD: "Best affordable sunscreen for daily use?"

✗ BAD: "How does CeraVe compare to others?" (mentions brand)
✗ BAD: "Is Brand X good?" (mentions brand)

Categories to cover:
- "What's the best X for Y?"
- "Which brands make the best X?"
- "What do experts recommend for X?"
- "Best affordable X?"
- "What X should a beginner use?"

Return ONLY valid JSON (no markdown) with this structure:
{{
    "brand_name": "{brand_name}",
    "industry": "{topics_str}",
    "topics": [
        {{
            "name": "Topic Name",
            "slug": "topic-name",
            "description": "Brief description",
            "prompts": [
                {{
                    "prompt_text": "Brand-agnostic consumer question (NO brand names)",
                    "intent": "visibility|recommendation|sentiment",
                    "expected_mentions": []
                }}
            ]
        }}
    ],
    "total_prompts": {num_topics * prompts_per_topic}
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )

        output = response.choices[0].message.content

        # Clean up the response
        if output.startswith("```"):
            if "```json" in output:
                output = output.split("```json")[1].split("```")[0]
            else:
                output = output.split("```")[1].split("```")[0]

        data = json.loads(output.strip())

        # Convert to Pydantic models
        generated_topics = []
        total_prompts = 0

        for topic_data in data.get("topics", []):
            prompts = []
            for prompt_data in topic_data.get("prompts", []):
                prompts.append(GeneratedPrompt(
                    prompt_text=prompt_data.get("prompt_text", ""),
                    intent=prompt_data.get("intent", "visibility"),
                    expected_mentions=prompt_data.get("expected_mentions", [])
                ))
                total_prompts += 1

            slug = topic_data.get("slug", "")
            if not slug:
                slug = topic_data.get("name", "").lower().replace(" ", "-").replace("/", "-")

            generated_topics.append(GeneratedTopic(
                name=topic_data.get("name", ""),
                slug=slug,
                description=topic_data.get("description", ""),
                prompts=prompts
            ))

        return PromptGenerationResult(
            brand_name=brand_name,
            industry=topics_str,
            topics=generated_topics,
            total_prompts=total_prompts
        )

    except Exception as e:
        print(f"[Fast Prompt Generation] Error: {e}")
        return PromptGenerationResult(
            brand_name=brand_name,
            industry=topics_str,
            topics=[],
            total_prompts=0
        )
