"""
MindSupport Backend - User Models
Pydantic schemas for User operations
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom ObjectId type for Pydantic."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ==================== Request Models ====================

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    nim: str = Field(..., min_length=5, max_length=20)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    

class PasswordChange(BaseModel):
    """Schema for password change."""
    old_password: str
    new_password: str = Field(..., min_length=8)


# ==================== Response Models ====================

class UserResponse(BaseModel):
    """Schema for user response (public data)."""
    id: str
    email: EmailStr
    full_name: str
    nim: str
    anonymous_id: str
    created_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True


class UserInDB(BaseModel):
    """Schema for user in database (internal)."""
    id: Optional[str] = None
    email: EmailStr
    hashed_password: str
    full_name: str
    nim: str
    anonymous_id: str
    created_at: datetime
    is_active: bool = True
    is_superuser: bool = False
    
    class Config:
        from_attributes = True


# ==================== Token Models ====================

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: str  # user_id
    exp: datetime
