"""
Examples of Different Comment Filtering Approaches

This shows you three ways to filter comments by quality (score).
"""

# Approach 1: Filter during extraction (most efficient)
# =====================================================
def extract_comments_approach1(post, min_score=5):
    """Extract only comments with score >= min_score"""
    comments = []
    post.comments.replace_more(limit=0)

    for comment in post.comments[:20]:  # Check top 20
        # Filter right here - only keep high-quality comments
        if (hasattr(comment, 'body') and
            comment.body not in ['[deleted]', '[removed]'] and
            comment.score >= min_score):  # ← THE FILTER

            comments.append({
                'text': comment.body,
                'score': comment.score
            })

    return comments


# Approach 2: Extract all, filter later (more flexible)
# ======================================================
def extract_comments_approach2(post):
    """Extract ALL comments, filter later in analysis"""
    comments = []
    post.comments.replace_more(limit=0)

    for comment in post.comments[:20]:
        if hasattr(comment, 'body') and comment.body not in ['[deleted]', '[removed]']:
            comments.append({
                'text': comment.body,
                'score': comment.score
            })

    return comments

def filter_by_score(comments, min_score=5):
    """Filter comments after extraction"""
    return [c for c in comments if c['score'] >= min_score]

# Usage:
# all_comments = extract_comments_approach2(post)
# good_comments = filter_by_score(all_comments, min_score=10)


# Approach 3: Sort by score, take top N (best approach!)
# =======================================================
def extract_comments_approach3(post, top_n=5):
    """Get the TOP N highest-scored comments"""
    comments = []
    post.comments.replace_more(limit=0)

    # Extract all valid comments
    for comment in post.comments:
        if hasattr(comment, 'body') and comment.body not in ['[deleted]', '[removed]']:
            comments.append({
                'text': comment.body,
                'score': comment.score,
                'created_utc': comment.created_utc
            })

    # Sort by score (highest first)
    comments.sort(key=lambda x: x['score'], reverse=True)

    # Return top N
    return comments[:top_n]


# Example outputs:
# ================
"""
Approach 1 (min_score=5):
  Returns: [comment1(score=10), comment2(score=7)]
  Skips: comment3(score=2), comment4(score=1)

Approach 2 (filter later):
  Returns: [comment1(score=10), comment2(score=7), comment3(score=2), comment4(score=1)]
  Then filter: filter_by_score(comments, min_score=5) → [comment1, comment2]

Approach 3 (top N by score):
  Returns: Top 5 highest-scored comments regardless of actual score
  [comment1(score=100), comment2(score=50), comment3(score=10), comment4(score=5), comment5(score=2)]
"""
