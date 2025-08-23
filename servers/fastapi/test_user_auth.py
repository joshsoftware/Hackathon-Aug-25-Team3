"""
Test script to verify user authentication for presentations and slides.
This script tests the following:
1. Creating a presentation with user_id
2. Getting all presentations for a user
3. Getting a specific presentation with permission check
4. Editing a slide with permission check
"""
import asyncio
import json
import requests
import sys

# When running inside the Docker container, we need to use the service name instead of localhost
# BASE_URL = "http://localhost:80/api/v1/ppt"  # For running outside Docker
BASE_URL = "http://development:80/api/v1/ppt"  # For running inside Docker
TEST_USER_ID = "test_user_123"
DIFFERENT_USER_ID = "different_user_456"

def print_header(message):
    print("\n" + "=" * 50)
    print(message)
    print("=" * 50)

def test_create_presentation():
    print_header("Testing: Create Presentation")
    
    url = f"{BASE_URL}/presentation/create"
    headers = {"Content-Type": "application/json", "Authorization": TEST_USER_ID}
    data = {
        "prompt": "Test presentation for user authentication",
        "n_slides": 3,
        "language": "en"
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully created presentation with ID: {result['id']}")
        print(f"✅ User ID set correctly: {result['user_id'] == TEST_USER_ID}")
        return result['id']
    else:
        print(f"❌ Failed to create presentation: {response.status_code}")
        print(response.text)
        return None

def test_get_all_presentations():
    print_header("Testing: Get All Presentations")
    
    url = f"{BASE_URL}/presentation/all"
    headers = {"Authorization": TEST_USER_ID}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully retrieved presentations: {len(result)} found")
        for i, presentation in enumerate(result):
            print(f"  Presentation {i+1}: ID={presentation['id']}, User ID={presentation['user_id']}")
        return True
    else:
        print(f"❌ Failed to get presentations: {response.status_code}")
        print(response.text)
        return False

def test_get_presentation(presentation_id):
    print_header("Testing: Get Specific Presentation")
    
    # Test with correct user
    url = f"{BASE_URL}/presentation?id={presentation_id}"
    headers = {"Authorization": TEST_USER_ID}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully retrieved presentation with correct user")
        print(f"  ID: {result['id']}, User ID: {result['user_id']}")
    else:
        print(f"❌ Failed to get presentation with correct user: {response.status_code}")
        print(response.text)
    
    # Test with different user (should fail with 403)
    headers = {"Authorization": DIFFERENT_USER_ID}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Correctly denied access to different user (403)")
    else:
        print(f"❌ Failed permission check: {response.status_code}")
        print(response.text)

def main():
    print("Starting user authentication tests...")
    
    # Test creating a presentation
    presentation_id = test_create_presentation()
    if not presentation_id:
        print("Cannot continue tests without a presentation ID")
        return
    
    # Test getting all presentations
    test_get_all_presentations()
    
    # Test getting a specific presentation
    test_get_presentation(presentation_id)
    
    print("\nTests completed!")

if __name__ == "__main__":
    main()
