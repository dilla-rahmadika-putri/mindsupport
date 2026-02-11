"""
MindSupport Backend - Chat Router
Handles AI chatbot interactions and chat history
"""
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from typing import List
import uuid

from app.routers.users import get_current_user
from app.db.mongodb import get_chats_collection
from app.models.chat import (
    ChatMessageRequest, 
    ChatSessionResponse, 
    ChatSessionDetailResponse,
    ChatMessageResponse,
    AIResponse,
    MessageRole
)
from app.services.openai_service import openai_service

router = APIRouter(prefix="/chat", tags=["Chat AI"])


@router.post("/message", response_model=AIResponse)
async def send_message(
    message: ChatMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Mengirim pesan ke chatbot AI.
    
    - **content**: Isi pesan (maksimal 4000 karakter)
    - **session_id**: ID sesi (opsional, jika kosong akan membuat sesi baru)
    
    Mengembalikan respons AI dan session_id.
    """
    chats = get_chats_collection()
    user_id = str(current_user["_id"])
    
    # Get or create session
    if message.session_id:
        session = await chats.find_one({
            "session_id": message.session_id,
            "user_id": user_id
        })
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesi tidak ditemukan"
            )
    else:
        # Create new session
        session_id = str(uuid.uuid4())
        session = {
            "user_id": user_id,
            "session_id": session_id,
            "title": message.content[:50] + "..." if len(message.content) > 50 else message.content,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "messages": []
        }
        await chats.insert_one(session)
        session["session_id"] = session_id
    
    # Build chat history for context
    chat_history = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in session.get("messages", [])
    ]
    
    # Get AI response
    ai_response = await openai_service.get_response(
        user_message=message.content,
        chat_history=chat_history
    )
    
    # Save messages to session
    now = datetime.utcnow()
    user_msg = {
        "role": MessageRole.USER.value,
        "content": message.content,
        "timestamp": now
    }
    ai_msg = {
        "role": MessageRole.ASSISTANT.value,
        "content": ai_response,
        "timestamp": now
    }
    
    await chats.update_one(
        {"session_id": session["session_id"]},
        {
            "$push": {"messages": {"$each": [user_msg, ai_msg]}},
            "$set": {"updated_at": now}
        }
    )
    
    return AIResponse(
        content=ai_response,
        session_id=session["session_id"],
        timestamp=now
    )


@router.get("/history", response_model=List[ChatSessionResponse])
async def get_chat_history(
    current_user: dict = Depends(get_current_user)
):
    """Mendapatkan daftar sesi chat pengguna."""
    chats = get_chats_collection()
    user_id = str(current_user["_id"])
    
    sessions = await chats.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).to_list(100)
    
    result = []
    for session in sessions:
        messages = session.get("messages", [])
        last_message = messages[-1]["content"] if messages else None
        
        result.append(ChatSessionResponse(
            session_id=session["session_id"],
            title=session.get("title", "Sesi Tanpa Judul"),
            created_at=session["created_at"],
            updated_at=session.get("updated_at", session["created_at"]),
            message_count=len(messages),
            last_message=last_message[:100] if last_message else None
        ))
    
    return result


@router.get("/history/{session_id}", response_model=ChatSessionDetailResponse)
async def get_session_detail(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mendapatkan detail sesi chat beserta semua pesan."""
    chats = get_chats_collection()
    user_id = str(current_user["_id"])
    
    session = await chats.find_one({
        "session_id": session_id,
        "user_id": user_id
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi tidak ditemukan"
        )
    
    messages = [
        ChatMessageResponse(
            role=MessageRole(msg["role"]),
            content=msg["content"],
            timestamp=msg.get("timestamp", session["created_at"])
        )
        for msg in session.get("messages", [])
    ]
    
    return ChatSessionDetailResponse(
        session_id=session["session_id"],
        title=session.get("title", "Sesi Tanpa Judul"),
        created_at=session["created_at"],
        messages=messages
    )


@router.delete("/history/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Menghapus satu sesi chat."""
    chats = get_chats_collection()
    user_id = str(current_user["_id"])
    
    result = await chats.delete_one({
        "session_id": session_id,
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi tidak ditemukan"
        )
    
    return {"message": "Sesi berhasil dihapus"}


@router.delete("/history")
async def delete_all_history(
    current_user: dict = Depends(get_current_user)
):
    """Menghapus semua sesi chat pengguna."""
    chats = get_chats_collection()
    user_id = str(current_user["_id"])
    
    result = await chats.delete_many({"user_id": user_id})
    
    return {"message": f"{result.deleted_count} sesi berhasil dihapus"}
