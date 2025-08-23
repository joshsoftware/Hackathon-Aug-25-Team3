"""
Script to check the database schema
"""
import asyncio
from sqlalchemy import inspect
from services.database import get_async_session

async def main():
    async for session in get_async_session():
        try:
            engine = session.get_bind()
            inspector = inspect(engine)
            
            # Get all tables
            tables = await inspector.get_table_names()
            print("Tables:", tables)
            
            # Check users table
            if 'users' in tables:
                columns = await inspector.get_columns('users')
                print("\nUsers table columns:")
                for column in columns:
                    print(f"  {column['name']}: {column['type']}")
            
            # Check organisations table
            if 'organisations' in tables:
                columns = await inspector.get_columns('organisations')
                print("\nOrganisations table columns:")
                for column in columns:
                    print(f"  {column['name']}: {column['type']}")
            
            # Break after first session
            break
        finally:
            await session.close()

if __name__ == "__main__":
    asyncio.run(main())
