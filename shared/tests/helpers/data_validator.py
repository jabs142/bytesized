"""
Data Structure Validator
========================
Reusable utilities for validating JSON data files in tests.

Used by: Birth Control, PCOS, EDS, Pharmaceutical projects

Usage:
    from shared.tests.helpers.data_validator import DataStructureValidator

    validator = DataStructureValidator()
    validator.validate_structure(data, required_fields=['id', 'title'])
    validator.check_no_duplicates(data, key='id')
    validator.validate_data_types(data[0], {'id': str, 'score': int})
"""

from typing import Any, Dict, List, Optional, Set, Type


class ValidationError(Exception):
    """Custom exception for data validation errors"""
    pass


class DataStructureValidator:
    """Validates JSON data structures for consistency and correctness"""

    def __init__(self, strict_mode: bool = True):
        """
        Initialize validator

        Args:
            strict_mode: If True, raise exceptions on validation failures.
                        If False, collect errors and return them.
        """
        self.strict_mode = strict_mode
        self.errors: List[str] = []

    def validate_structure(
        self,
        data: List[Dict],
        required_fields: List[str],
        optional_fields: Optional[List[str]] = None
    ) -> bool:
        """
        Validate that all items in data have required fields

        Args:
            data: List of dictionaries to validate
            required_fields: Fields that must be present in every item
            optional_fields: Fields that may be present but are not required

        Returns:
            True if valid, False otherwise (or raises ValidationError in strict mode)

        Example:
            validator.validate_structure(
                posts,
                required_fields=['id', 'title', 'created_utc'],
                optional_fields=['score', 'num_comments']
            )
        """
        if not isinstance(data, list):
            return self._handle_error("Data must be a list")

        for i, item in enumerate(data):
            if not isinstance(item, dict):
                return self._handle_error(f"Item {i} is not a dictionary")

            # Check required fields
            missing_fields = set(required_fields) - set(item.keys())
            if missing_fields:
                return self._handle_error(
                    f"Item {i} missing required fields: {missing_fields}"
                )

            # Check for unexpected fields if optional_fields is provided
            if optional_fields is not None:
                allowed_fields = set(required_fields) | set(optional_fields)
                unexpected_fields = set(item.keys()) - allowed_fields
                if unexpected_fields:
                    return self._handle_error(
                        f"Item {i} has unexpected fields: {unexpected_fields}"
                    )

        return True

    def check_no_duplicates(
        self,
        data: List[Dict],
        key: str
    ) -> bool:
        """
        Check that there are no duplicate values for a given key

        Args:
            data: List of dictionaries
            key: Key to check for uniqueness

        Returns:
            True if no duplicates, False otherwise

        Example:
            validator.check_no_duplicates(posts, key='id')
        """
        seen: Set[Any] = set()
        duplicates: List[Any] = []

        for i, item in enumerate(data):
            if key not in item:
                return self._handle_error(f"Item {i} missing key '{key}'")

            value = item[key]
            if value in seen:
                duplicates.append(value)
            seen.add(value)

        if duplicates:
            return self._handle_error(
                f"Found {len(duplicates)} duplicate values for key '{key}': {duplicates[:5]}"
            )

        return True

    def validate_data_types(
        self,
        item: Dict,
        type_map: Dict[str, Type]
    ) -> bool:
        """
        Validate that fields have the expected data types

        Args:
            item: Dictionary to validate
            type_map: Mapping of field names to expected types

        Returns:
            True if types match, False otherwise

        Example:
            validator.validate_data_types(
                post,
                {'id': str, 'score': int, 'created_utc': (int, float)}
            )
        """
        for field, expected_type in type_map.items():
            if field not in item:
                continue  # Skip missing fields (use validate_structure for that)

            value = item[field]

            # Handle None values
            if value is None:
                continue

            # Check type
            if not isinstance(value, expected_type):
                return self._handle_error(
                    f"Field '{field}' has type {type(value).__name__}, "
                    f"expected {expected_type.__name__}"
                )

        return True

    def validate_list_items(
        self,
        data: List[Dict],
        type_map: Dict[str, Type]
    ) -> bool:
        """
        Validate data types for all items in a list

        Args:
            data: List of dictionaries
            type_map: Type mapping to apply to each item

        Returns:
            True if all items pass validation
        """
        for i, item in enumerate(data):
            if not self.validate_data_types(item, type_map):
                return self._handle_error(f"Item {i} failed type validation")

        return True

    def validate_field_range(
        self,
        data: List[Dict],
        field: str,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None
    ) -> bool:
        """
        Validate that numeric field values are within expected range

        Args:
            data: List of dictionaries
            field: Field name to check
            min_value: Minimum acceptable value (inclusive)
            max_value: Maximum acceptable value (inclusive)

        Returns:
            True if all values in range
        """
        for i, item in enumerate(data):
            if field not in item:
                continue

            value = item[field]

            if min_value is not None and value < min_value:
                return self._handle_error(
                    f"Item {i}: field '{field}' value {value} < min {min_value}"
                )

            if max_value is not None and value > max_value:
                return self._handle_error(
                    f"Item {i}: field '{field}' value {value} > max {max_value}"
                )

        return True

    def validate_non_empty(
        self,
        data: List[Dict],
        fields: List[str]
    ) -> bool:
        """
        Validate that specified fields are not empty strings

        Args:
            data: List of dictionaries
            fields: Fields that should not be empty

        Returns:
            True if no empty values found
        """
        for i, item in enumerate(data):
            for field in fields:
                if field not in item:
                    continue

                value = item[field]
                if isinstance(value, str) and not value.strip():
                    return self._handle_error(
                        f"Item {i}: field '{field}' is empty"
                    )

        return True

    def get_errors(self) -> List[str]:
        """Return list of accumulated errors"""
        return self.errors

    def clear_errors(self):
        """Clear accumulated errors"""
        self.errors = []

    def _handle_error(self, message: str) -> bool:
        """Handle validation error based on strict_mode"""
        if self.strict_mode:
            raise ValidationError(message)
        else:
            self.errors.append(message)
            return False


# Convenience functions for common validations

def validate_reddit_posts(posts: List[Dict]) -> bool:
    """
    Validate standard Reddit post structure

    Args:
        posts: List of Reddit post dictionaries

    Returns:
        True if valid
    """
    validator = DataStructureValidator()

    return (
        validator.validate_structure(
            posts,
            required_fields=['id', 'subreddit', 'author', 'created_utc'],
            optional_fields=['title', 'selftext', 'score', 'num_comments', 'url']
        )
        and validator.check_no_duplicates(posts, key='id')
        and validator.validate_list_items(
            posts,
            {
                'id': str,
                'subreddit': str,
                'author': str,
                'created_utc': (int, float),
                'score': int,
                'num_comments': int
            }
        )
    )


def validate_symptom_data(symptoms: List[Dict]) -> bool:
    """
    Validate standard symptom data structure

    Args:
        symptoms: List of symptom dictionaries

    Returns:
        True if valid
    """
    validator = DataStructureValidator()

    return (
        validator.validate_structure(
            symptoms,
            required_fields=['symptom', 'frequency'],
            optional_fields=['category', 'pubmed_papers', 'surprise_score']
        )
        and validator.validate_non_empty(symptoms, fields=['symptom'])
        and validator.validate_field_range(
            symptoms,
            field='frequency',
            min_value=0
        )
    )
