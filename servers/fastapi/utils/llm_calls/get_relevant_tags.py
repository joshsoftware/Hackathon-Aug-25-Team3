from typing import List
from services.llm_client import LLMClient, LLMMessage
from typing import Tuple
import json

def get_active_llm_config() -> Tuple[str, str]:
    """Read the active LLM provider and model directly from userConfig.json."""
    path = "/app_data/userConfig.json"
    with open(path, "r") as f:
        config = json.load(f)

    provider = config.get("LLM")
    model = None

    if provider == "openai":
        model = config.get("OPENAI_MODEL")
    elif provider == "google":
        model = config.get("GOOGLE_MODEL")
    elif provider == "anthropic":
        model = config.get("ANTHROPIC_MODEL")
    elif provider == "ollama":
        model = config.get("OLLAMA_MODEL")
    elif provider == "custom":
        model = config.get("CUSTOM_MODEL")

    if not provider or not model:
        raise ValueError(f"Invalid LLM config: provider={provider}, model={model}")

    return provider, model

async def get_relevant_tags_from_prompt(prompt: str, available_tags: list[str]) -> list[str]:
    if not available_tags:
        return []

    provider, model = get_active_llm_config()
    llm_client = LLMClient()

    system_prompt = f"""You are an expert classifier. Your task is to select the most relevant tags for a user's request from a given list of tags. 
    The user wants to create a presentation. Based on their prompt, identify which of the following available tags are most relevant to their request.
    Available tags: {', '.join(available_tags)}
    Respond with a comma-separated list of the relevant tags. For example: 'sales,q4,marketing'.
    If no tags seem relevant, respond with an empty string."""

    if provider == "openai" or provider == "ollama" or provider == "custom":
        # OpenAI-style expects {"role": ..., "content": ...}
        messages_to_send = [
            {"role": msg.role, "content": msg.content} for msg in [
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=prompt),
            ]]
    else:
        # For other providers, keep as LLMMessage objects
        messages_to_send = [
            LLMMessage(role="system", content=system_prompt),
            LLMMessage(role="user", content=prompt),
        ]

    response = await llm_client.generate(
        model=model,
        messages=messages,
        max_tokens=256,
    )

    if not response:
        return []

    relevant_tags = [tag.strip() for tag in response.split(",") if tag.strip()]
    return [tag for tag in relevant_tags if tag in available_tags]


# async def get_relevant_tags_from_prompt(
#     prompt: str, available_tags: List[str]
# ) -> List[str]:
#     """
#     Uses an LLM to determine which of the available tags are relevant to the user's prompt.

#     Args:
#         prompt: The user's input prompt for the presentation.
#         available_tags: A list of all unique tags available for the organization.

#     Returns:
#         A list of tags deemed relevant by the LLM.
#     """
#     if not available_tags:
#         return []

#     llm_client = LLMClient()

#     system_prompt = f"""You are an expert classifier. Your task is to select the most relevant tags for a user's request from a given list of tags. 
#     The user wants to create a presentation. Based on their prompt, identify which of the following available tags are most relevant to their request.
#     Available tags: {', '.join(available_tags)}
#     Respond with a comma-separated list of the relevant tags. For example: 'sales,q4,marketing'.
#     If no tags seem relevant, respond with an empty string."""

#     response = await llm_client.generate_text(prompt, system_prompt)

#     if not response:
#         return []

#     # Clean up the response and split into a list
#     relevant_tags = [tag.strip() for tag in response.split(',') if tag.strip()]

#     # Filter the list to only include tags that were actually available
#     return [tag for tag in relevant_tags if tag in available_tags]
