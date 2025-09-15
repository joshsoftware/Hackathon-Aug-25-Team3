import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5431/presenton"
PRESENTATION_ID = "83e6d9ae-ad17-4d41-b5b4-3f971412e81c"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        await conn.execute(
            text(
                f"""DELETE FROM slide WHERE presentation = '{PRESENTATION_ID}'"""
            )
        )
        await conn.execute(
            text(
                f"""DELETE FROM presentationmodel WHERE id = '{PRESENTATION_ID}'"""
            )
        )
        await conn.commit()

if __name__ == "__main__":
    asyncio.run(main())
