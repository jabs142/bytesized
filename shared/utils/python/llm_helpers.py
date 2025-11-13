"""
LLM Helpers
===========
Shared utilities for LLM-based extraction and validation.

Usage:
    from shared.utils.python.llm_helpers import LLMExtractor, batch_extract

    extractor = LLMExtractor(api_key=api_key, model="gpt-4o-mini")
    result = extractor.extract(prompt, text)
"""

import os
import time
import json
from typing import Dict, List, Optional, Any
from openai import OpenAI
from anthropic import Anthropic


class LLMExtractor:
    """
    Base class for LLM-based extraction tasks.

    Supports OpenAI and Anthropic models.
    """

    def __init__(
        self,
        provider: str = "openai",
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 2000
    ):
        """
        Initialize LLM client.

        Args:
            provider: "openai" or "anthropic"
            api_key: API key (defaults to env vars)
            model: Model name (defaults based on provider)
            temperature: Sampling temperature
            max_tokens: Maximum output tokens
        """
        self.provider = provider.lower()
        self.temperature = temperature
        self.max_tokens = max_tokens

        if self.provider == "openai":
            self.api_key = api_key or os.getenv("OPENAI_API_KEY")
            self.model = model or "gpt-4o-mini"
            self.client = OpenAI(api_key=self.api_key)

        elif self.provider == "anthropic":
            self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
            self.model = model or "claude-sonnet-4-5-20250929"
            self.client = Anthropic(api_key=self.api_key)

        else:
            raise ValueError(f"Unsupported provider: {provider}")

    def extract(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = True
    ) -> Dict:
        """
        Extract structured data using LLM.

        Args:
            system_prompt: System instruction
            user_prompt: User input
            json_mode: Enforce JSON output

        Returns:
            Extracted data as dictionary
        """
        try:
            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    response_format={"type": "json_object"} if json_mode else {"type": "text"}
                )
                content = response.choices[0].message.content

            elif self.provider == "anthropic":
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ]
                )
                content = response.content[0].text

            # Parse JSON if json_mode enabled
            if json_mode:
                return json.loads(content)
            else:
                return {"text": content}

        except Exception as e:
            print(f"Extraction error: {str(e)}")
            return {"error": str(e)}

    def batch_extract(
        self,
        system_prompt: str,
        items: List[str],
        delay: float = 1.0,
        show_progress: bool = True
    ) -> List[Dict]:
        """
        Extract from multiple items with rate limiting.

        Args:
            system_prompt: System instruction
            items: List of user prompts
            delay: Delay between requests (seconds)
            show_progress: Show progress bar

        Returns:
            List of extraction results
        """
        results = []

        iterator = items
        if show_progress:
            try:
                from tqdm import tqdm
                iterator = tqdm(items, desc="Extracting")
            except ImportError:
                pass

        for item in iterator:
            result = self.extract(system_prompt, item)
            results.append(result)
            time.sleep(delay)

        return results


class PubMedRelevanceChecker(LLMExtractor):
    """
    Specialized extractor for PubMed paper relevance checking.
    """

    def check_relevance(
        self,
        topic: str,
        paper_title: str,
        paper_abstract: str
    ) -> Dict:
        """
        Check if paper is relevant to topic.

        Args:
            topic: Research topic (e.g., "birth control anxiety")
            paper_title: Paper title
            paper_abstract: Paper abstract

        Returns:
            {
                "is_relevant": bool,
                "relevance_score": float,
                "reason": str
            }
        """
        system_prompt = """You are a research paper relevance assessor.
Evaluate if a paper is relevant to a specific medical topic.
Return JSON with: is_relevant (bool), relevance_score (0-1), reason (str)."""

        user_prompt = f"""Topic: {topic}

Title: {paper_title}

Abstract: {paper_abstract[:1000]}

Is this paper relevant to the topic?"""

        return self.extract(system_prompt, user_prompt, json_mode=True)


class SymptomExtractor(LLMExtractor):
    """
    Specialized extractor for extracting symptoms from text.
    """

    def extract_symptoms(
        self,
        text: str,
        context: Optional[str] = None
    ) -> Dict:
        """
        Extract symptoms mentioned in text.

        Args:
            text: Input text (e.g., Reddit post)
            context: Optional context (e.g., medical condition)

        Returns:
            {
                "symptoms": [
                    {"symptom": str, "category": str, "quote": str}
                ]
            }
        """
        system_prompt = f"""You are a medical symptom extractor.
Extract all symptoms mentioned in the text.
{f'Context: {context}' if context else ''}
Return JSON with array of symptoms, each with: symptom, category, quote."""

        user_prompt = f"Extract symptoms from this text:\n\n{text}"

        return self.extract(system_prompt, user_prompt, json_mode=True)


def batch_with_retry(
    func,
    items: List[Any],
    max_retries: int = 3,
    delay: float = 1.0
) -> List[Any]:
    """
    Execute function on items with retry logic.

    Args:
        func: Function to call on each item
        items: List of items to process
        max_retries: Maximum retry attempts
        delay: Delay between retries

    Returns:
        List of results
    """
    results = []

    for item in items:
        for attempt in range(max_retries):
            try:
                result = func(item)
                results.append(result)
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"Failed after {max_retries} attempts: {str(e)}")
                    results.append({"error": str(e)})
                else:
                    time.sleep(delay * (attempt + 1))

    return results
