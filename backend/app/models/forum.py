"""
MindSupport Backend - Forum Models
Pydantic schemas for Forum/Post operations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MoodType(str, Enum):
    """Enum for post mood types."""
    SEDIH = "Sedih"
    BUTUH_SARAN = "Butuh Saran"
    CURHAT = "Curhat"
    KESAL = "Kesal"
    SUKSES = "Sukses"


# ==================== Request Models ====================

class PostCreate(BaseModel):
    """Schema for creating a new post."""
    mood: MoodType
    content: str = Field(..., min_length=10, max_length=2000)


class CommentCreate(BaseModel):
    """Schema for adding a comment."""
    content: str = Field(..., min_length=1, max_length=500)


class ReportCreate(BaseModel):
    """Schema for reporting a post."""
    reason: str
    note: Optional[str] = None


# ==================== Internal Models ====================

class Comment(BaseModel):
    """Schema for post comment."""
    comment_id: str
    user_id: str
    anonymous_id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Post(BaseModel):
    """Schema for forum post in database."""
    id: Optional[str] = None
    user_id: str
    anonymous_id: str
    mood: MoodType
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: List[str] = []  # List of user_ids
    comments: List[Comment] = []
    is_deleted: bool = False
    
    class Config:
        from_attributes = True


# ==================== Response Models ====================

class CommentResponse(BaseModel):
    """Schema for comment response."""
    comment_id: str
    anonymous_id: str
    content: str
    created_at: datetime


class PostResponse(BaseModel):
    """Schema for post response."""
    id: str
    anonymous_id: str
    mood: MoodType
    content: str
    created_at: datetime
    like_count: int
    is_liked: bool = False  # Whether current user liked it
    comment_count: int
    comments: List[CommentResponse] = []
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """Schema for list of posts with pagination."""
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int


# ==================== Report Models ====================

class Report(BaseModel):
    """Schema for content report."""
    id: Optional[str] = None
    post_id: str
    reporter_id: str
    reason: str
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, reviewed, resolved
    
    class Config:
        from_attributes = True
