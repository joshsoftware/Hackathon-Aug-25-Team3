"""
Script to check if the user has a password field
"""
import asyncio
from sqlmodel import select
from services.database import get_async_session
from models.sql.user import User

async def main():
    async for session in get_async_session():
        try:
            # Get all users
            query = select(User)
            result = await session.execute(query)
            users = result.all()
            
            print(f"Found {len(users)} users")
            
            # Check if users have a password field
            for user in users:
                user_dict = user[0].__dict__
                print(f"User ID: {user_dict.get('id')}")
                print(f"User email: {user_dict.get('email')}")
                print(f"User has password field: {'password' in user_dict}")
                if 'password' in user_dict:
                    # Don't print the actual password, just the first few characters
                    print(f"Password starts with: {user_dict['password'][:10]}...")
                print("-" * 50)
            
            # Break after first session
            break
        finally:
            await session.close()

if __name__ == "__main__":
    asyncio.run(main())
