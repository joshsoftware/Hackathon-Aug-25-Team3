import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from utils.db_utils import get_database_url_and_connect_args

async def run_migration():
    """
    Add user_id column to presentationmodel and slidemodel tables if they don't already exist.
    Also update existing records to set a default user_id if it's NULL.
    """
    print("Starting migration to add user_id columns...")
    
    # Get database connection
    database_url, connect_args = get_database_url_and_connect_args()
    engine = create_async_engine(database_url, connect_args=connect_args)
    
    async with engine.begin() as conn:
        # Check if user_id column exists in presentationmodel
        result = await conn.execute(text(
            "SELECT COUNT(*) FROM pragma_table_info('presentationmodel') WHERE name='user_id'"
        ))
        presentation_has_column = result.scalar() > 0
        
        # Check if user_id column exists in slidemodel
        result = await conn.execute(text(
            "SELECT COUNT(*) FROM pragma_table_info('slidemodel') WHERE name='user_id'"
        ))
        slide_has_column = result.scalar() > 0
        
        # Add user_id column to presentationmodel if it doesn't exist
        if not presentation_has_column:
            print("Adding user_id column to presentationmodel table...")
            await conn.execute(text(
                "ALTER TABLE presentationmodel ADD COLUMN user_id VARCHAR(255)"
            ))
            print("Successfully added user_id column to presentationmodel table.")
        else:
            print("user_id column already exists in presentationmodel table.")
        
        # Add user_id column to slidemodel if it doesn't exist
        if not slide_has_column:
            print("Adding user_id column to slidemodel table...")
            await conn.execute(text(
                "ALTER TABLE slidemodel ADD COLUMN user_id VARCHAR(255)"
            ))
            print("Successfully added user_id column to slidemodel table.")
        else:
            print("user_id column already exists in slidemodel table.")
        
        # Update existing records with NULL user_id to set a default value
        print("Updating existing records with NULL user_id...")
        await conn.execute(text(
            "UPDATE presentationmodel SET user_id = 'default_user' WHERE user_id IS NULL"
        ))
        await conn.execute(text(
            "UPDATE slidemodel SET user_id = 'default_user' WHERE user_id IS NULL"
        ))
        print("Successfully updated existing records.")
    
    print("Migration completed successfully.")

if __name__ == "__main__":
    asyncio.run(run_migration())
