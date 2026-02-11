"""
MindSupport Backend - MongoDB Database Connection
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from app.core.config import settings


class MongoDB:
    """MongoDB connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db = MongoDB()


async def connect_to_mongo():
    """Connect to MongoDB."""
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.database = db.client[settings.DATABASE_NAME]
    
    # Ping to verify connection
    try:
        await db.client.admin.command('ping')
        print(f"✅ Connected to MongoDB database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close MongoDB connection."""
    if db.client:
        db.client.close()
        print("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    return db.database


# Collection helpers
def get_users_collection():
    return db.database["users"]


def get_chats_collection():
    return db.database["chats"]


def get_posts_collection():
    return db.database["posts"]


def get_reports_collection():
    return db.database["reports"]
