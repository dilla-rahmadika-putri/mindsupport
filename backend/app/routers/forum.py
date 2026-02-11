"""
MindSupport Backend - Forum Router
Handles anonymous forum posts and comments
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import uuid

from app.routers.users import get_current_user
from app.db.mongodb import get_posts_collection, get_reports_collection
from app.models.forum import (
    PostCreate, 
    PostResponse, 
    PostListResponse,
    CommentCreate,
    CommentResponse,
    ReportCreate,
    MoodType
)

router = APIRouter(prefix="/forum", tags=["Forum Anonim"])


@router.get("/posts", response_model=PostListResponse)
async def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    mood: Optional[MoodType] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Mendapatkan daftar postingan forum.
    
    - **page**: Nomor halaman (default 1)
    - **page_size**: Jumlah item per halaman (default 20, maks 50)
    - **mood**: Filter opsional berdasarkan kategori mood
    """
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    # Build query
    query = {"is_deleted": {"$ne": True}}
    if mood:
        query["mood"] = mood.value
    
    # Get total count
    total = await posts_collection.count_documents(query)
    
    # Get paginated posts
    skip = (page - 1) * page_size
    cursor = posts_collection.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    posts = await cursor.to_list(page_size)
    
    # Format response
    result_posts = []
    for post in posts:
        comments = post.get("comments", [])
        result_posts.append(PostResponse(
            id=str(post["_id"]),
            anonymous_id=post["anonymous_id"],
            mood=MoodType(post["mood"]),
            content=post["content"],
            created_at=post["created_at"],
            like_count=len(post.get("likes", [])),
            is_liked=user_id in post.get("likes", []),
            comment_count=len(comments),
            comments=[
                CommentResponse(
                    comment_id=c["comment_id"],
                    anonymous_id=c["anonymous_id"],
                    content=c["content"],
                    created_at=c["created_at"]
                )
                for c in comments[:3]  # Only return first 3 comments in list
            ]
        ))
    
    return PostListResponse(
        posts=result_posts,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Membuat postingan forum baru secara anonim.
    
    - **mood**: Kategori mood postingan (Sedih, Butuh Saran, Curhat, Kesal, Sukses)
    - **content**: Isi postingan (10-2000 karakter)
    """
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    post_doc = {
        "user_id": user_id,
        "anonymous_id": current_user["anonymous_id"],
        "mood": post_data.mood.value,
        "content": post_data.content,
        "created_at": datetime.utcnow(),
        "likes": [],
        "comments": [],
        "is_deleted": False
    }
    
    result = await posts_collection.insert_one(post_doc)
    
    return PostResponse(
        id=str(result.inserted_id),
        anonymous_id=post_doc["anonymous_id"],
        mood=post_data.mood,
        content=post_doc["content"],
        created_at=post_doc["created_at"],
        like_count=0,
        is_liked=False,
        comment_count=0,
        comments=[]
    )


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mendapatkan detail satu postingan beserta semua komentar."""
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    try:
        post = await posts_collection.find_one({
            "_id": ObjectId(post_id),
            "is_deleted": {"$ne": True}
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    comments = post.get("comments", [])
    
    return PostResponse(
        id=str(post["_id"]),
        anonymous_id=post["anonymous_id"],
        mood=MoodType(post["mood"]),
        content=post["content"],
        created_at=post["created_at"],
        like_count=len(post.get("likes", [])),
        is_liked=user_id in post.get("likes", []),
        comment_count=len(comments),
        comments=[
            CommentResponse(
                comment_id=c["comment_id"],
                anonymous_id=c["anonymous_id"],
                content=c["content"],
                created_at=c["created_at"]
            )
            for c in comments
        ]
    )


@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle like/unlike pada postingan."""
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    try:
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    likes = post.get("likes", [])
    
    if user_id in likes:
        # Unlike
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"likes": user_id}}
        )
        return {"liked": False, "like_count": len(likes) - 1}
    else:
        # Like
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"likes": user_id}}
        )
        return {"liked": True, "like_count": len(likes) + 1}


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def add_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Menambahkan komentar pada postingan."""
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    try:
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    comment = {
        "comment_id": str(uuid.uuid4()),
        "user_id": user_id,
        "anonymous_id": current_user["anonymous_id"],
        "content": comment_data.content,
        "created_at": datetime.utcnow()
    }
    
    await posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment}}
    )
    
    return CommentResponse(
        comment_id=comment["comment_id"],
        anonymous_id=comment["anonymous_id"],
        content=comment["content"],
        created_at=comment["created_at"]
    )


@router.post("/posts/{post_id}/report")
async def report_post(
    post_id: str,
    report_data: ReportCreate,
    current_user: dict = Depends(get_current_user)
):
    """Melaporkan postingan yang tidak pantas untuk ditinjau."""
    posts_collection = get_posts_collection()
    reports_collection = get_reports_collection()
    user_id = str(current_user["_id"])
    
    # Verify post exists
    try:
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    # Check if already reported by this user
    existing_report = await reports_collection.find_one({
        "post_id": post_id,
        "reporter_id": user_id
    })
    
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kamu sudah melaporkan post ini"
        )
    
    report_doc = {
        "post_id": post_id,
        "reporter_id": user_id,
        "reason": report_data.reason,
        "note": report_data.note,
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    await reports_collection.insert_one(report_doc)
    
    return {"message": "Laporan berhasil dikirim. Tim kami akan meninjau laporan ini."}


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Menghapus postingan sendiri (soft delete)."""
    posts_collection = get_posts_collection()
    user_id = str(current_user["_id"])
    
    try:
        post = await posts_collection.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post tidak ditemukan")
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post tidak ditemukan atau bukan milikmu"
        )
    
    await posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"is_deleted": True}}
    )
    
    return {"message": "Post berhasil dihapus"}
