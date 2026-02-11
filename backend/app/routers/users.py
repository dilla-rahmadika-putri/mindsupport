"""
MindSupport Backend - Users Router
Handles user profile operations
"""
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
import random

from app.core.security import oauth2_scheme, decode_access_token, get_password_hash, verify_password
from app.db.mongodb import get_users_collection
from app.models.user import UserResponse, UserUpdate, PasswordChange

router = APIRouter(prefix="/users", tags=["Pengguna"])


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current authenticated user from token."""
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau kadaluwarsa",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid"
        )
    
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Mendapatkan profil pengguna yang sedang login."""
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        nim=current_user["nim"],
        anonymous_id=current_user["anonymous_id"],
        created_at=current_user["created_at"],
        is_active=current_user.get("is_active", True)
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Memperbarui profil pengguna yang sedang login."""
    users = get_users_collection()
    
    update_fields = {}
    if update_data.full_name:
        update_fields["full_name"] = update_data.full_name
    
    if update_fields:
        await users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_fields}
        )
        current_user.update(update_fields)
    
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user.get("full_name", update_data.full_name or current_user["full_name"]),
        nim=current_user["nim"],
        anonymous_id=current_user["anonymous_id"],
        created_at=current_user["created_at"],
        is_active=current_user.get("is_active", True)
    )


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Mengubah password pengguna yang sedang login."""
    # Verify old password
    if not verify_password(password_data.old_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password lama salah"
        )
    
    # Update password
    users = get_users_collection()
    await users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": get_password_hash(password_data.new_password)}}
    )
    
    return {"message": "Password berhasil diubah"}


@router.post("/me/regenerate-anonymous-id", response_model=UserResponse)
async def regenerate_anonymous_id(current_user: dict = Depends(get_current_user)):
    """Generate ID Anonim baru untuk pengguna di forum."""
    users = get_users_collection()
    
    new_anonymous_id = f"Anonim#{random.randint(100, 9999)}"
    
    await users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"anonymous_id": new_anonymous_id}}
    )
    
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        nim=current_user["nim"],
        anonymous_id=new_anonymous_id,
        created_at=current_user["created_at"],
        is_active=current_user.get("is_active", True)
    )
