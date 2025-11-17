"""
Mock LLM Client for Testing
============================
Eliminates need for API keys in tests by providing mock responses.

Supports both OpenAI and Anthropic API patterns used in ByteSized projects.

Usage:
    from shared.tests.helpers.mock_llm_client import MockLLMClient

    # Create mock client with predefined responses
    client = MockLLMClient()
    client.add_response("extract_symptoms", {
        "symptoms": ["anxiety", "headache"],
        "confidence": 0.92
    })

    # Use in tests
    result = client.extract(prompt_type="extract_symptoms", text="...")
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


class MockLLMClient:
    """
    Mock LLM client that returns predefined responses instead of making API calls
    """

    def __init__(self, response_map: Optional[Dict[str, Any]] = None, use_fixtures: bool = True):
        """
        Initialize mock LLM client

        Args:
            response_map: Dictionary mapping prompt types to responses
            use_fixtures: If True, load responses from mock_llm_responses.json fixture
        """
        self.response_map: Dict[str, Any] = response_map or {}
        self.call_count: Dict[str, int] = {}
        self.call_history: List[Dict] = []

        if use_fixtures:
            self._load_fixtures()

    def _load_fixtures(self):
        """Load mock responses from fixtures file"""
        fixtures_path = Path(__file__).parent.parent / 'fixtures' / 'mock_llm_responses.json'

        if fixtures_path.exists():
            with open(fixtures_path, 'r') as f:
                fixtures = json.load(f)
                # Flatten the fixture structure
                for key, value in fixtures.items():
                    if 'response' in value:
                        self.response_map[key] = value['response']

    def add_response(self, prompt_type: str, response: Any):
        """
        Add a mock response for a specific prompt type

        Args:
            prompt_type: Identifier for the type of prompt
            response: The response to return for this prompt type
        """
        self.response_map[prompt_type] = response

    def extract(
        self,
        prompt_type: str,
        text: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Mock extraction method (simulates LLMExtractor.extract)

        Args:
            prompt_type: Type of extraction to perform
            text: Input text (ignored in mock, but kept for API compatibility)
            **kwargs: Additional arguments (ignored)

        Returns:
            Mock response for the given prompt type
        """
        # Track call
        self.call_count[prompt_type] = self.call_count.get(prompt_type, 0) + 1
        self.call_history.append({
            'prompt_type': prompt_type,
            'text_length': len(text),
            'kwargs': kwargs
        })

        # Return mock response
        if prompt_type in self.response_map:
            return self.response_map[prompt_type]
        else:
            # Default response if not found
            return {
                'error': f'No mock response configured for prompt_type: {prompt_type}',
                'text_received': text[:100]  # First 100 chars for debugging
            }

    def batch_extract(
        self,
        prompt_type: str,
        texts: List[str],
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Mock batch extraction (simulates batch processing)

        Args:
            prompt_type: Type of extraction
            texts: List of input texts
            **kwargs: Additional arguments

        Returns:
            List of mock responses
        """
        return [self.extract(prompt_type, text, **kwargs) for text in texts]

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> str:
        """
        Mock OpenAI chat completion

        Args:
            messages: List of chat messages
            **kwargs: Additional arguments (model, temperature, etc.)

        Returns:
            Mock completion text
        """
        # Extract prompt type from last user message if available
        if messages and messages[-1].get('role') == 'user':
            content = messages[-1].get('content', '')

            # Try to infer prompt type from content
            if 'symptom' in content.lower():
                prompt_type = 'symptom_extraction'
            elif 'validate' in content.lower():
                prompt_type = 'side_effect_validation'
            elif 'categorize' in content.lower():
                prompt_type = 'symptom_categorization'
            else:
                prompt_type = 'default'

            if prompt_type in self.response_map:
                return json.dumps(self.response_map[prompt_type])

        # Default response
        return json.dumps({'result': 'mock_response', 'confidence': 0.95})

    def messages_create(
        self,
        model: str,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> Any:
        """
        Mock Anthropic messages.create

        Args:
            model: Model name (ignored in mock)
            messages: List of messages
            **kwargs: Additional arguments

        Returns:
            Mock response object with .content[0].text attribute
        """
        class MockResponse:
            def __init__(self, text):
                self.content = [type('obj', (object,), {'text': text})]

        response_text = self.chat_completion(messages, **kwargs)
        return MockResponse(response_text)

    def get_call_count(self, prompt_type: Optional[str] = None) -> int:
        """
        Get number of times a prompt type was called

        Args:
            prompt_type: Specific prompt type, or None for total calls

        Returns:
            Call count
        """
        if prompt_type:
            return self.call_count.get(prompt_type, 0)
        return sum(self.call_count.values())

    def get_call_history(self) -> List[Dict]:
        """Get full history of calls made to the mock client"""
        return self.call_history

    def reset(self):
        """Reset call counts and history"""
        self.call_count = {}
        self.call_history = []


class MockOpenAIClient(MockLLMClient):
    """
    Mock client specifically for OpenAI API pattern

    Usage:
        client = MockOpenAIClient()
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": "Extract symptoms"}]
        )
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Create nested structure to match OpenAI client pattern
        self.chat = type('obj', (object,), {
            'completions': type('obj', (object,), {
                'create': self._create_completion
            })
        })

    def _create_completion(self, model: str, messages: List[Dict], **kwargs):
        """OpenAI-style completion creation"""
        class MockCompletion:
            def __init__(self, content):
                self.choices = [
                    type('obj', (object,), {
                        'message': type('obj', (object,), {
                            'content': content
                        })
                    })
                ]

        content = self.chat_completion(messages, **kwargs)
        return MockCompletion(content)


class MockAnthropicClient(MockLLMClient):
    """
    Mock client specifically for Anthropic API pattern

    Usage:
        client = MockAnthropicClient()
        response = client.messages.create(
            model="claude-3-opus-20240229",
            messages=[{"role": "user", "content": "Extract symptoms"}]
        )
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Create nested structure to match Anthropic client pattern
        self.messages = type('obj', (object,), {
            'create': self.messages_create
        })


# Convenience function for loading mock responses from file

def load_mock_responses(filepath: str) -> Dict[str, Any]:
    """
    Load mock responses from a JSON file

    Args:
        filepath: Path to JSON file with mock responses

    Returns:
        Dictionary of responses
    """
    with open(filepath, 'r') as f:
        data = json.load(f)

    # Flatten structure if needed
    responses = {}
    for key, value in data.items():
        if isinstance(value, dict) and 'response' in value:
            responses[key] = value['response']
        else:
            responses[key] = value

    return responses
