"""
MindSupport Backend - Chat Models
Pydantic schemas for Chat/Conversation operations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Enum for message roles."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ==================== Request Models ====================

class ChatMessageRequest(BaseModel):
    """Schema for sending a chat message."""
    content: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None  # If None, creates new session


class NewSessionRequest(BaseModel):
    """Schema for creating a new chat session."""
    title: Optional[str] = None


# ==================== Internal Models ====================

class ChatMessage(BaseModel):
    """Schema for individual chat message."""
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    """Schema for chat session."""
    id: Optional[str] = None
    user_id: str
    session_id: str
    title: str = "Sesi Baru"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatMessage] = []
    
    class Config:
        from_attributes = True


# ==================== Response Models ====================

class ChatMessageResponse(BaseModel):
    """Schema for chat message response."""
    role: MessageRole
    content: str
    timestamp: datetime


class ChatSessionResponse(BaseModel):
    """Schema for chat session list response."""
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: Optional[str] = None


class ChatSessionDetailResponse(BaseModel):
    """Schema for detailed chat session response."""
    session_id: str
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse]


class AIResponse(BaseModel):
    """Schema for AI chatbot response."""
    content: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
