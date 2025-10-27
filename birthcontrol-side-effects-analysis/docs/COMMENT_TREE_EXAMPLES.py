"""
Understanding Reddit Comment Trees

This explains what we're actually collecting and what we're missing.
"""

# What Reddit's Comment Structure Looks Like:
# ============================================

"""
Visual representation:

Post: "Has anyone experienced depression on IUD?"
│
├── Comment 1 (top-level, score: 25)
│   "Yes! I had terrible depression on Mirena..."
│   │
│   ├── Reply 1.1 (score: 10)
│   │   "How long did it take to improve after removal?"
│   │   │
│   │   └── Reply 1.1.1 (score: 5)
│   │       "About 2 weeks for me"
│   │
│   └── Reply 1.2 (score: 3)
│       "Same experience here"
│
├── Comment 2 (top-level, score: 15)
│   "Talk to your doctor about this..."
│   │
│   └── Reply 2.1 (score: 8)
│       "I agree, don't wait"
│
└── Comment 3 (top-level, score: 2)
    "I switched to copper IUD and felt better"
"""


# What Our Current Code Gets:
# ============================

def what_we_currently_get(post):
    """
    Current implementation: ONLY top-level comments
    """
    post.comments.replace_more(limit=0)
    top_comments = post.comments[:5]  # First 5 TOP-LEVEL only

    # We GET:
    # - Comment 1 (score: 25)
    # - Comment 2 (score: 15)
    # - Comment 3 (score: 2)

    # We DON'T GET:
    # - Reply 1.1 (score: 10) ← Even though it's high quality!
    # - Reply 1.1.1 (score: 5)
    # - Reply 1.2 (score: 3)
    # - Reply 2.1 (score: 8)

    return [
        {"text": "Yes! I had terrible depression...", "score": 25},
        {"text": "Talk to your doctor...", "score": 15},
        {"text": "I switched to copper IUD...", "score": 2}
    ]


# What a Full Tree Traversal Would Get:
# ======================================

def full_tree_traversal(post):
    """
    If we wanted ALL comments (including replies)
    """
    all_comments = []

    post.comments.replace_more(limit=None)  # Load everything!

    # Flatten the entire tree using recursion
    def extract_all(comment):
        all_comments.append({
            "text": comment.body,
            "score": comment.score,
            "depth": comment.depth  # How nested it is (0 = top-level)
        })

        # Recursively get all replies
        for reply in comment.replies:
            extract_all(reply)

    # Start with top-level comments
    for comment in post.comments:
        extract_all(comment)

    return all_comments
    # Returns: ALL 7 comments from the tree above!


# What a Smart Approach Would Be:
# ================================

def smart_comment_extraction(post, min_score=5):
    """
    Get top-level comments + high-quality replies

    This balances:
    - Speed (don't load everything)
    - Quality (get valuable nested discussions)
    """
    comments = []

    post.comments.replace_more(limit=0)  # Don't fully expand

    for top_comment in post.comments[:10]:
        # Get the top-level comment
        if top_comment.score >= min_score:
            comments.append({
                "text": top_comment.body,
                "score": top_comment.score,
                "depth": 0,
                "type": "top_level"
            })

            # Also get high-quality DIRECT replies
            for reply in top_comment.replies[:3]:  # Max 3 replies
                if reply.score >= min_score:
                    comments.append({
                        "text": reply.body,
                        "score": reply.score,
                        "depth": 1,
                        "type": "reply"
                    })

    return comments
    # Gets: Comment 1 (25), Reply 1.1 (10), Comment 2 (15), Reply 2.1 (8)
    # Skips: Low-scored replies


# Why We Only Get Top-Level Comments Right Now:
# ==============================================

"""
Reasons for current approach:

1. SPEED ⚡
   - Loading full comment trees is SLOW
   - Each nested level = more API calls
   - Could take 60+ seconds per post

2. SIMPLICITY 📝
   - Top-level comments are usually the main discussion
   - Replies are often tangential
   - Easier to analyze flat structure

3. RATE LIMITING 🚦
   - Reddit API has strict limits
   - Loading all comments = more requests
   - Risk of getting rate-limited

4. GOOD ENOUGH ✅
   - Top comments often have the most valuable info
   - For learning NLP, top-level is sufficient
   - Can always enhance later
"""


# Answer to Your Question:
# =========================

"""
Q: "If a comment's comment (grandchild node) has fewer comments than
    its parent, will it be shown?"

A: NO - we don't see ANY nested comments (replies) right now!

We only see:
- Top-level comments (depth 0)
- NOT replies (depth 1+)

So even if a reply has a HIGHER score than its parent, we don't get it.

Example:
  Comment: "Try talking to your doctor" (score: 5)
  └── Reply: "This saved my life, here's a detailed guide..." (score: 100)

We'd get the parent (score: 5) but MISS the amazing reply (score: 100)!

This is a limitation of our current simple approach.
"""


# How to Improve This Later:
# ===========================

"""
Phase 2 Enhancement Ideas:

1. Get top 3 replies for each top comment
2. Flatten and sort ALL comments by score (get top 10 globally)
3. Use depth parameter to preserve context
4. Filter replies: only include if score > parent_score
5. Smart traversal: stop at depth 2 (grandparent → parent → child only)

For now, top-level comments are good enough for learning!
"""
