"""
MindSupport Backend - Admin Router
Handles admin dashboard, reports, and moderation
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

from app.routers.users import get_current_user
from app.db.mongodb import get_users_collection, get_posts_collection, get_reports_collection, get_chats_collection

router = APIRouter(prefix="/admin", tags=["Admin"])


async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Check if current user is admin."""
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya admin yang dapat mengakses."
        )
    return current_user


# ==================== STATISTICS ====================

@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Mendapatkan statistik dashboard admin."""
    users = get_users_collection()
    posts = get_posts_collection()
    reports = get_reports_collection()
    chats = get_chats_collection()
    
    # Count totals
    total_users = await users.count_documents({})
    total_posts = await posts.count_documents({"is_deleted": {"$ne": True}})
    pending_reports = await reports.count_documents({"status": "pending"})
    
    # Count today's active sessions (approximation)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    active_sessions = await chats.count_documents({"updated_at": {"$gte": today}})
    
    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "pending_reports": pending_reports,
        "active_sessions": active_sessions
    }


# ==================== REPORTS ====================

@router.get("/reports")
async def get_reports(
    status_filter: Optional[str] = Query("pending", description="Filter by status: pending, resolved, dismissed"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    admin: dict = Depends(get_admin_user)
):
    """Mendapatkan daftar laporan."""
    reports = get_reports_collection()
    posts = get_posts_collection()
    
    # Build query
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    # Get paginated reports
    skip = (page - 1) * page_size
    cursor = reports.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    report_list = await cursor.to_list(page_size)
    
    # Enrich with post content
    result = []
    for report in report_list:
        post = None
        try:
            post = await posts.find_one({"_id": ObjectId(report["post_id"])})
        except:
            pass
        
        result.append({
            "id": str(report["_id"]),
            "post_id": report["post_id"],
            "post_content": post["content"][:200] if post else "[Post dihapus]",
            "post_author": post.get("anonymous_id", "Unknown") if post else "Unknown",
            "reason": report["reason"],
            "note": report.get("note", ""),
            "reporter_id": report["reporter_id"],
            "status": report["status"],
            "created_at": report["created_at"].isoformat()
        })
    
    total = await reports.count_documents(query)
    
    return {
        "reports": result,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.put("/reports/{report_id}")
async def handle_report(
    report_id: str,
    action: str = Query(..., description="Action: resolve, dismiss"),
    delete_post: bool = Query(False, description="Also delete the reported post"),
    admin: dict = Depends(get_admin_user)
):
    """Menangani laporan (resolve atau dismiss)."""
    reports = get_reports_collection()
    posts = get_posts_collection()
    
    try:
        report = await reports.find_one({"_id": ObjectId(report_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
    
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
    
    # Update report status
    new_status = "resolved" if action == "resolve" else "dismissed"
    await reports.update_one(
        {"_id": ObjectId(report_id)},
        {
            "$set": {
                "status": new_status,
                "handled_by": str(admin["_id"]),
                "handled_at": datetime.utcnow()
            }
        }
    )
    
    # Optionally delete the post
    if delete_post and action == "resolve":
        await posts.update_one(
            {"_id": ObjectId(report["post_id"])},
            {"$set": {"is_deleted": True}}
        )
    
    return {"message": f"Laporan berhasil di-{new_status}", "status": new_status}


# ==================== USERS ====================

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    search: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Mendapatkan daftar semua pengguna."""
    users = get_users_collection()
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
            {"nim": {"$regex": search, "$options": "i"}}
        ]
    
    # Get paginated users
    skip = (page - 1) * page_size
    cursor = users.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    user_list = await cursor.to_list(page_size)
    
    result = []
    for user in user_list:
        result.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "nim": user["nim"],
            "anonymous_id": user.get("anonymous_id", ""),
            "is_active": user.get("is_active", True),
            "is_superuser": user.get("is_superuser", False),
            "created_at": user["created_at"].isoformat()
        })
    
    total = await users.count_documents(query)
    
    return {
        "users": result,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Toggle status aktif pengguna."""
    users = get_users_collection()
    
    try:
        user = await users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    # Cannot deactivate yourself
    if str(user["_id"]) == str(admin["_id"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tidak dapat menonaktifkan akun sendiri")
    
    new_status = not user.get("is_active", True)
    await users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status}}
    )
    
    return {
        "message": f"Pengguna berhasil {'diaktifkan' if new_status else 'dinonaktifkan'}",
        "is_active": new_status
    }


@router.put("/users/{user_id}/make-admin")
async def make_user_admin(
    user_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Jadikan pengguna sebagai admin."""
    users = get_users_collection()
    
    try:
        user = await users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    new_status = not user.get("is_superuser", False)
    await users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_superuser": new_status}}
    )
    
    return {
        "message": f"Pengguna berhasil {'dijadikan admin' if new_status else 'dicopot dari admin'}",
        "is_superuser": new_status
    }


# ==================== POSTS ====================

@router.get("/posts")
async def get_all_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    include_deleted: bool = Query(False),
    admin: dict = Depends(get_admin_user)
):
    """Mendapatkan semua postingan (termasuk yang dihapus jika diminta)."""
    posts = get_posts_collection()
    
    query = {}
    if not include_deleted:
        query["is_deleted"] = {"$ne": True}
    
    skip = (page - 1) * page_size
    cursor = posts.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    post_list = await cursor.to_list(page_size)
    
    result = []
    for post in post_list:
        result.append({
            "id": str(post["_id"]),
            "anonymous_id": post["anonymous_id"],
            "mood": post["mood"],
            "content": post["content"],
            "like_count": len(post.get("likes", [])),
            "comment_count": len(post.get("comments", [])),
            "is_deleted": post.get("is_deleted", False),
            "created_at": post["created_at"].isoformat()
        })
    
    total = await posts.count_documents(query)
    
    return {
        "posts": result,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.delete("/posts/{post_id}")
async def admin_delete_post(
    post_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Hapus postingan sebagai admin (soft delete)."""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    await posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "is_deleted": True,
                "deleted_by": str(admin["_id"]),
                "deleted_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Postingan berhasil dihapus"}
