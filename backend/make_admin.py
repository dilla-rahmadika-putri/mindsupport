"""
MindSupport - Script untuk menjadikan user sebagai admin
Jalankan dengan: python make_admin.py email@contoh.com
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "mindsupport"


async def make_admin(email: str):
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users = db["users"]
    
    # Find user by email
    user = await users.find_one({"email": email})
    
    if not user:
        print(f"❌ User dengan email '{email}' tidak ditemukan!")
        print("\nPastikan user sudah mendaftar terlebih dahulu.")
        return False
    
    # Update to superuser
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_superuser": True}}
    )
    
    print(f"✅ User '{user['full_name']}' ({email}) berhasil dijadikan admin!")
    print(f"   Anonymous ID: {user.get('anonymous_id', 'N/A')}")
    return True


async def list_admins():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users = db["users"]
    
    admins = await users.find({"is_superuser": True}).to_list(100)
    
    if not admins:
        print("📭 Belum ada admin yang terdaftar.")
        return
    
    print(f"\n👑 Daftar Admin ({len(admins)} orang):")
    print("-" * 50)
    for admin in admins:
        print(f"   • {admin['full_name']} ({admin['email']})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("       python make_admin.py --list")
        print("\nContoh: python make_admin.py admin@kampus.ac.id")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        asyncio.run(list_admins())
    else:
        email = sys.argv[1]
        asyncio.run(make_admin(email))
