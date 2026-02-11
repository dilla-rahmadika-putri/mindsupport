"""
MindSupport Backend - Authentication Router
Handles user registration and login
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import random

from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.db.mongodb import get_users_collection
from app.models.user import UserCreate, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Autentikasi"])


def generate_anonymous_id() -> str:
    """Generate a random anonymous ID."""
    return f"Anonim#{random.randint(100, 9999)}"


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Registrasi pengguna baru.
    
    - **email**: Alamat email yang valid (diutamakan email kampus)
    - **password**: Minimal 8 karakter
    - **full_name**: Nama lengkap pengguna
    - **nim**: Nomor Induk Mahasiswa
    
    Mengembalikan access token dan data pengguna.
    """
    users = get_users_collection()
    
    # Check if email already exists
    existing_user = await users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    # Check if NIM already exists
    existing_nim = await users.find_one({"nim": user_data.nim})
    if existing_nim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIM sudah terdaftar"
        )
    
    # Create new user document
    user_doc = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "nim": user_data.nim,
        "anonymous_id": generate_anonymous_id(),
        "created_at": datetime.utcnow(),
        "is_active": True,
        "is_superuser": False
    }
    
    result = await users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(result.inserted_id),
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            nim=user_doc["nim"],
            anonymous_id=user_doc["anonymous_id"],
            created_at=user_doc["created_at"],
            is_active=user_doc["is_active"]
        )
    )


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login untuk mendapatkan access token.
    
    - **username**: Alamat email
    - **password**: Password pengguna
    
    Token berlaku selama 24 jam.
    """
    users = get_users_collection()
    
    # Find user by email
    user = await users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun dinonaktifkan"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            nim=user["nim"],
            anonymous_id=user["anonymous_id"],
            created_at=user["created_at"],
            is_active=user.get("is_active", True)
        )
    )
