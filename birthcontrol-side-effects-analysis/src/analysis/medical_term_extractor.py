"""
Medical Term Extraction for Birth Control Side Effect Analysis

This module filters out noise words and focuses on medically relevant terms:
- Mental health symptoms
- Birth control types (4 categories only)
- Multi-word medical phrases (bigrams/trigrams)

Educational focus: Help people understand symptom patterns.
"""

from typing import List, Dict, Set, Tuple
from collections import Counter
import re


class MedicalTermExtractor:
    """
    Extracts medically relevant terms from text, filtering out noise.

    This helps us focus on actual symptoms and birth control types
    instead of generic words like "just", "not", "like".
    """

    def __init__(self):
        # ============================================
        # ENHANCED STOP WORDS
        # ============================================
        # These are the "lame" words that clutter analysis
        self.stop_words = {
            # Generic discourse markers
            'just', 'like', 'really', 'very', 'pretty', 'quite',
            'actually', 'basically', 'honestly', 'literally',

            # Common verbs (not symptom-related)
            'get', 'got', 'getting', 'make', 'made', 'making',
            'know', 'think', 'feel', 'feeling', 'want', 'need',
            'see', 'saw', 'try', 'trying', 'tried', 'use', 'used',
            'using', 'go', 'going', 'went', 'take', 'taking', 'took',

            # Time/quantity (too generic)
            'day', 'days', 'time', 'times', 'year', 'years', 'month',
            'months', 'week', 'weeks', 'now', 'still', 'always', 'never',
            'much', 'many', 'more', 'less', 'lot', 'lots',

            # Pronouns and common words
            'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him',
            'his', 'she', 'her', 'hers', 'it', 'its', 'we', 'us', 'our',
            'ours', 'they', 'them', 'their', 'theirs',

            # Prepositions/conjunctions
            'and', 'or', 'but', 'if', 'so', 'than', 'then', 'when',
            'where', 'why', 'how', 'what', 'which', 'who', 'about',
            'after', 'before', 'during', 'through', 'for', 'from',
            'in', 'into', 'of', 'on', 'to', 'with', 'without', 'by',
            'at', 'as', 'out', 'up', 'down', 'over', 'under',

            # Articles/determiners
            'a', 'an', 'the', 'this', 'that', 'these', 'those',
            'some', 'any', 'all', 'both', 'each', 'every', 'no', 'not',

            # Generic questions/responses
            'been', 'being', 'am', 'is', 'are', 'was', 'were',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'doing',
            'can', 'could', 'will', 'would', 'should', 'may', 'might',

            # Filler words common in Reddit
            'thing', 'things', 'stuff', 'something', 'someone',
            'anyone', 'everyone', 'nobody', 'everything', 'nothing',
            'yeah', 'yes', 'no', 'ok', 'okay', 'sure', 'maybe',
        }

        # ============================================
        # MENTAL HEALTH SYMPTOMS
        # ============================================
        # These are what we WANT to track
        self.mental_health_symptoms = {
            # Depression-related
            'depression': ['depression', 'depressed', 'depressing'],
            'sadness': ['sad', 'sadness', 'unhappy', 'miserable'],
            'hopelessness': ['hopeless', 'hopelessness', 'despair'],
            'worthlessness': ['worthless', 'worthlessness'],

            # Anxiety-related
            'anxiety': ['anxiety', 'anxious', 'worried', 'worrying', 'worry'],
            'panic': ['panic', 'panicking', 'panic attack', 'panic attacks'],
            'nervousness': ['nervous', 'nervousness', 'jittery'],
            'fear': ['scared', 'afraid', 'fearful', 'terrified'],

            # Mood-related
            'mood swings': ['mood swing', 'mood swings', 'moody', 'mood changes'],
            'irritability': ['irritable', 'irritability', 'irritated'],
            'anger': ['angry', 'anger', 'furious', 'rage', 'raging'],
            'emotional': ['emotional', 'emotions', 'emotion'],

            # Crying/sensitivity
            'crying': ['crying', 'cry', 'cried', 'tears', 'tearful'],
            'sensitivity': ['sensitive', 'sensitivity', 'oversensitive'],

            # Severe symptoms
            'suicidal': ['suicidal', 'suicide', 'kill myself', 'end my life'],
            'self harm': ['self harm', 'self-harm', 'cutting', 'hurt myself'],

            # Cognitive symptoms
            'brain fog': ['brain fog', 'foggy', 'mental fog'],
            'confusion': ['confused', 'confusion', 'disoriented'],
            'memory': ['memory loss', 'forgetful', 'cant remember'],

            # Energy/motivation
            'fatigue': ['fatigue', 'fatigued', 'exhausted', 'exhaustion'],
            'apathy': ['apathy', 'apathetic', 'dont care', 'unmotivated'],
            'numbness': ['numb', 'numbness', 'emotionless', 'empty'],
        }

        # ============================================
        # PHYSICAL SYMPTOMS
        # ============================================
        # Physical side effects beyond mental health
        self.physical_symptoms = {
            # Skin/acne
            'acne': ['acne', 'breakout', 'breakouts', 'pimples', 'zits', 'cystic acne'],
            'skin_dryness': ['dry skin', 'skin dryness', 'flaky skin', 'skin peeling'],
            'oily_skin': ['oily skin', 'greasy skin', 'oily face'],
            'skin_rash': ['rash', 'rashes', 'hives', 'skin irritation'],

            # Vaginal health
            'yeast_infection': ['yeast infection', 'yeast infections', 'candida', 'thrush', 'yeast'],
            'vaginal_dryness': ['vaginal dryness', 'vagina dry', 'dryness down there', 'lack of lubrication'],
            'uti': ['uti', 'utis', 'urinary tract infection', 'bladder infection'],
            'discharge': ['discharge', 'vaginal discharge', 'abnormal discharge'],
            'ph_imbalance': ['ph imbalance', 'ph off', 'bacterial vaginosis', 'bv'],

            # Hair
            'hair_loss': ['hair loss', 'losing hair', 'hair falling out', 'thinning hair', 'balding'],
            'hair_growth': ['excess hair', 'excessive hair growth', 'unwanted hair', 'hirsutism'],

            # Weight/body
            'weight_gain': ['weight gain', 'gained weight', 'putting on weight', 'getting heavier'],
            'weight_loss': ['weight loss', 'losing weight', 'lost weight'],
            'bloating': ['bloating', 'bloated', 'water retention', 'swelling', 'puffy'],
            'appetite_change': ['appetite', 'hungry', 'hunger', 'increased appetite', 'decreased appetite'],

            # Sexual/reproductive
            'low_libido': ['low libido', 'no sex drive', 'lost libido', 'decreased libido', 'sex drive gone'],
            'painful_sex': ['painful sex', 'pain during sex', 'sex hurts', 'dyspareunia'],
            'spotting': ['spotting', 'breakthrough bleeding', 'bleeding between periods'],
            'heavy_bleeding': ['heavy bleeding', 'heavy period', 'heavy periods', 'menorrhagia'],
            'irregular_periods': ['irregular periods', 'irregular cycle', 'missed period', 'late period'],
            'cramps': ['cramps', 'cramping', 'menstrual cramps', 'period pain'],

            # Breast changes
            'breast_tenderness': ['breast tenderness', 'sore breasts', 'breast pain', 'tender breasts'],
            'breast_size': ['breast size', 'breast growth', 'breasts bigger', 'breasts smaller'],

            # Digestive
            'nausea': ['nausea', 'nauseous', 'feeling sick', 'queasy'],
            'headaches': ['headache', 'headaches', 'migraine', 'migraines'],

            # Post-pill specific
            'post_pill_acne': ['post pill acne', 'acne after stopping', 'acne after pill'],
            'post_pill_hair_loss': ['post pill hair loss', 'hair loss after stopping', 'hair shedding after pill'],
        }

        # ============================================
        # TEMPORAL CONTEXT MARKERS
        # ============================================
        # Phrases that indicate timeline/duration
        self.temporal_markers = {
            # Duration on birth control
            'long_term_use': ['been on for', 'on for', 'using for', 'been taking for'],
            'just_started': ['just started', 'first week', 'first month', 'just got'],
            'stopped': ['stopped', 'came off', 'went off', 'quit', 'removal', 'removed'],

            # Time periods
            'weeks': ['week', 'weeks'],
            'months': ['month', 'months'],
            'years': ['year', 'years'],

            # Post-pill timeline
            'after_stopping': ['after stopping', 'after quitting', 'since stopping', 'post pill', 'post-pill'],
        }

        # ============================================
        # USER CONTEXT
        # ============================================
        # User profile/context indicators
        self.user_context = {
            'long_term_user': ['long time user', 'been on for years', '5 years', '10 years', 'decade'],
            'switcher': ['switching from', 'switched from', 'changed from', 'trying different'],
            'first_time': ['first time', 'never been on', 'first birth control'],
        }

        # ============================================
        # BIRTH CONTROL CATEGORIES (4 types only)
        # ============================================
        self.birth_control_types = {
            'COC_pill': {
                'name': 'Combined Oral Contraceptive (Pill)',
                'terms': [
                    # Brand names
                    'yasmin', 'yaz', 'beyaz', 'safyral',
                    'ortho tri-cyclen', 'ortho-cyclen', 'tri-cyclen',
                    'lo loestrin', 'loestrin', 'microgestin',
                    'alesse', 'aviane', 'lessina',
                    'apri', 'desogen', 'reclipsen',
                    'junel', 'blisovi', 'tarina',
                    'sprintec', 'mononessa', 'estarylla',
                    'seasonale', 'seasonique', 'loseasonique',
                    'natazia', 'qlaira',
                    # Generic terms
                    'combination pill', 'combined pill', 'combo pill',
                    'birth control pill', 'the pill', 'oral contraceptive',
                ]
            },

            'progestin_only_pill': {
                'name': 'Progestin-Only Pill (Mini Pill)',
                'terms': [
                    # Brand names
                    'norethindrone', 'camila', 'errin', 'jolivette',
                    'nora-be', 'heather', 'sharobel',
                    'desogestrel', 'cerazette', 'cerelle',
                    'slynd', 'drospirenone',
                    # Generic terms
                    'mini pill', 'minipill', 'progestin only',
                    'progestin-only', 'progesterone only',
                ]
            },

            'hormonal_IUD': {
                'name': 'Hormonal IUD',
                'terms': [
                    # Brand names (most common)
                    'mirena', 'kyleena', 'skyla', 'liletta',
                    # Generic terms
                    'hormonal iud', 'hormone iud', 'levonorgestrel iud',
                    'lng-iud', 'lng iud',
                ]
            },

            'copper_IUD': {
                'name': 'Copper IUD',
                'terms': [
                    # Brand name (main one in US)
                    'paragard',
                    # Generic terms
                    'copper iud', 'copper coil', 'non-hormonal iud',
                    'hormone-free iud', 'cu-iud',
                ]
            },
        }

        # ============================================
        # COMPILE PATTERNS
        # ============================================
        self._compile_patterns()

    def _compile_patterns(self):
        """Pre-compile regex patterns for faster matching."""
        # Compile mental health symptom patterns
        self.mental_symptom_patterns = {}
        for symptom_type, variants in self.mental_health_symptoms.items():
            pattern = '|'.join(re.escape(v) for v in variants)
            self.mental_symptom_patterns[symptom_type] = re.compile(
                r'\b(' + pattern + r')\b',
                re.IGNORECASE
            )

        # Compile physical symptom patterns
        self.physical_symptom_patterns = {}
        for symptom_type, variants in self.physical_symptoms.items():
            pattern = '|'.join(re.escape(v) for v in variants)
            self.physical_symptom_patterns[symptom_type] = re.compile(
                r'\b(' + pattern + r')\b',
                re.IGNORECASE
            )

        # Compile ALL symptoms together (for convenience)
        self.all_symptom_patterns = {**self.mental_symptom_patterns, **self.physical_symptom_patterns}

        # Compile birth control patterns
        self.bc_patterns = {}
        for bc_type, bc_info in self.birth_control_types.items():
            pattern = '|'.join(re.escape(term) for term in bc_info['terms'])
            self.bc_patterns[bc_type] = re.compile(
                r'\b(' + pattern + r')\b',
                re.IGNORECASE
            )

        # Compile temporal marker patterns
        self.temporal_patterns = {}
        for marker_type, variants in self.temporal_markers.items():
            pattern = '|'.join(re.escape(v) for v in variants)
            self.temporal_patterns[marker_type] = re.compile(
                r'\b(' + pattern + r')\b',
                re.IGNORECASE
            )

        # Compile user context patterns
        self.context_patterns = {}
        for context_type, variants in self.user_context.items():
            pattern = '|'.join(re.escape(v) for v in variants)
            self.context_patterns[context_type] = re.compile(
                r'\b(' + pattern + r')\b',
                re.IGNORECASE
            )

    def extract_symptoms(self, text: str, category: str = 'all') -> Dict[str, int]:
        """
        Extract symptoms from text (mental health AND/OR physical).

        Args:
            text: Input text
            category: 'all', 'mental', or 'physical'

        Returns:
            Dict mapping symptom type to count
            Example: {'depression': 2, 'acne': 1, 'yeast_infection': 1}
        """
        symptom_counts = {}

        # Choose which patterns to use
        if category == 'mental':
            patterns = self.mental_symptom_patterns
        elif category == 'physical':
            patterns = self.physical_symptom_patterns
        else:  # 'all'
            patterns = self.all_symptom_patterns

        for symptom_type, pattern in patterns.items():
            matches = pattern.findall(text)
            if matches:
                symptom_counts[symptom_type] = len(matches)

        return symptom_counts

    def extract_temporal_context(self, text: str) -> List[str]:
        """
        Extract temporal markers indicating timeline/duration.

        Returns:
            List of temporal contexts found
            Example: ['long_term_use', 'stopped']
        """
        found_contexts = []

        for marker_type, pattern in self.temporal_patterns.items():
            if pattern.search(text):
                found_contexts.append(marker_type)

        return found_contexts

    def extract_user_context(self, text: str) -> List[str]:
        """
        Extract user context indicators (long-term user, switcher, etc.).

        Returns:
            List of user contexts found
            Example: ['long_term_user', 'switcher']
        """
        found_contexts = []

        for context_type, pattern in self.context_patterns.items():
            if pattern.search(text):
                found_contexts.append(context_type)

        return found_contexts

    def extract_birth_control_type(self, text: str) -> List[str]:
        """
        Identify which birth control type(s) are mentioned.

        Returns:
            List of birth control types found
            Example: ['COC_pill', 'hormonal_IUD']
        """
        found_types = []

        for bc_type, pattern in self.bc_patterns.items():
            if pattern.search(text):
                found_types.append(bc_type)

        return found_types

    def get_clean_words(self, text: str, min_length: int = 3) -> List[str]:
        """
        Extract words that aren't stop words.

        This is for general word frequency analysis after filtering noise.

        Args:
            text: Input text
            min_length: Minimum word length to keep

        Returns:
            List of clean words (lowercase)
        """
        # Remove punctuation and split
        words = re.findall(r'\b[a-z]+\b', text.lower())

        # Filter: not stop word, meets length requirement
        clean = [
            w for w in words
            if w not in self.stop_words and len(w) >= min_length
        ]

        return clean

    def extract_bigrams(self, text: str) -> List[str]:
        """
        Extract two-word phrases (useful for "mood swings", "panic attack").

        Returns:
            List of bigrams as strings: "mood swings"
        """
        words = re.findall(r'\b[a-z]+\b', text.lower())

        bigrams = []
        for i in range(len(words) - 1):
            # Skip if either word is a stop word
            if words[i] not in self.stop_words and words[i+1] not in self.stop_words:
                bigram = f"{words[i]} {words[i+1]}"
                bigrams.append(bigram)

        return bigrams

    def analyze_post(self, post: Dict) -> Dict:
        """
        Full analysis of a single post - COMPREHENSIVE extraction.

        Returns enriched post data with:
        - symptoms: Dict of ALL symptom counts (mental + physical)
        - mental_symptoms: Dict of mental health symptoms only
        - physical_symptoms: Dict of physical symptoms only
        - birth_control_types: List of BC types mentioned
        - temporal_context: List of timeline markers (e.g., 'long_term_use', 'stopped')
        - user_context: List of user profile indicators
        - clean_words: List of non-stop words
        - bigrams: List of two-word phrases
        """
        # Combine title and body text
        title = post.get('title', '')
        body = post.get('selftext', '') or post.get('body', '')  # Handle both formats
        full_text = f"{title} {body}"

        # Extract ALL features for pattern mining
        analysis = {
            'post_id': post.get('id', ''),
            'subreddit': post.get('subreddit', ''),

            # Symptoms (comprehensive)
            'symptoms': self.extract_symptoms(full_text, category='all'),
            'mental_symptoms': self.extract_symptoms(full_text, category='mental'),
            'physical_symptoms': self.extract_symptoms(full_text, category='physical'),

            # Birth control & context
            'birth_control_types': self.extract_birth_control_type(full_text),
            'temporal_context': self.extract_temporal_context(full_text),
            'user_context': self.extract_user_context(full_text),

            # Text analysis
            'clean_words': self.get_clean_words(full_text),
            'bigrams': self.extract_bigrams(full_text),
        }

        return analysis

    def analyze_dataset(self, posts: List[Dict]) -> Dict:
        """
        Analyze entire dataset and return aggregate statistics.

        Returns:
            - symptom_frequencies: Counter of symptoms across all posts
            - bc_type_counts: Counter of birth control types mentioned
            - word_frequencies: Counter of clean words
            - bigram_frequencies: Counter of bigrams
            - post_analyses: List of per-post analyses
        """
        all_symptoms = Counter()
        all_bc_types = Counter()
        all_words = Counter()
        all_bigrams = Counter()
        post_analyses = []

        for post in posts:
            analysis = self.analyze_post(post)
            post_analyses.append(analysis)

            # Aggregate symptoms
            for symptom, count in analysis['symptoms'].items():
                all_symptoms[symptom] += count

            # Aggregate BC types
            for bc_type in analysis['birth_control_types']:
                all_bc_types[bc_type] += 1

            # Aggregate words
            all_words.update(analysis['clean_words'])

            # Aggregate bigrams
            all_bigrams.update(analysis['bigrams'])

        return {
            'symptom_frequencies': all_symptoms,
            'bc_type_counts': all_bc_types,
            'word_frequencies': all_words,
            'bigram_frequencies': all_bigrams,
            'post_analyses': post_analyses,
            'total_posts': len(posts),
        }


# ============================================
# EDUCATIONAL EXAMPLES
# ============================================

def example_usage():
    """
    Examples showing how to use this extractor.
    Run this file directly to see examples.
    """
    extractor = MedicalTermExtractor()

    # Example 1: Extract symptoms from text
    print("=" * 60)
    print("EXAMPLE 1: Symptom Extraction")
    print("=" * 60)

    example_text = """
    I've been on Yasmin for 3 months and I'm experiencing terrible
    anxiety and mood swings. I feel depressed and cry all the time.
    My doctor suggested switching to a copper IUD instead.
    """

    symptoms = extractor.extract_symptoms(example_text)
    print(f"Text: {example_text.strip()}")
    print(f"\nSymptoms found: {symptoms}")

    # Example 2: Identify birth control type
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Birth Control Type Detection")
    print("=" * 60)

    bc_types = extractor.extract_birth_control_type(example_text)
    print(f"Birth control types mentioned: {bc_types}")

    # Example 3: Clean word extraction (without noise)
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Clean Words (No Stop Words)")
    print("=" * 60)

    clean_words = extractor.get_clean_words(example_text)
    print(f"Clean words: {clean_words[:20]}")  # First 20

    # Example 4: Full post analysis
    print("\n" + "=" * 60)
    print("EXAMPLE 4: Full Post Analysis")
    print("=" * 60)

    mock_post = {
        'id': 'abc123',
        'subreddit': 'birthcontrol',
        'title': 'Anxiety on Mirena?',
        'body': 'Has anyone experienced panic attacks after getting Mirena? I feel anxious all the time.'
    }

    analysis = extractor.analyze_post(mock_post)
    print(f"Post: {mock_post['title']}")
    print(f"Symptoms: {analysis['symptoms']}")
    print(f"BC types: {analysis['birth_control_types']}")
    print(f"Clean words: {analysis['clean_words'][:10]}")


if __name__ == '__main__':
    print("\n🔬 MEDICAL TERM EXTRACTOR - Educational Examples\n")
    example_usage()
    print("\n✅ Examples complete! Now you can use this in the Jupyter notebook.\n")
