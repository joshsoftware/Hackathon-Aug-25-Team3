"""
Test script to verify the organization update API endpoint.
This script tests the following:
1. Logging in to get a JWT token
2. Getting organization details
3. Updating organization details with a new name and logo
"""
import asyncio
import json
import requests
import sys
import os
from pathlib import Path

# When running inside Docker, we need to use the service name instead of localhost
# BASE_URL = "http://localhost:3001/api/v1"  # For running on host
BASE_URL = "http://development:80/api/v1"  # For running inside Docker container
TEST_ADMIN_EMAIL = "admin@testorg.com"
TEST_ADMIN_PASSWORD = "securepassword123"
TEST_LOGO_PATH = Path(__file__).parent / "test_logo.png"

def print_header(message):
    print("\n" + "=" * 50)
    print(message)
    print("=" * 50)

def create_test_logo():
    """Create a simple test logo file if it doesn't exist"""
    if not TEST_LOGO_PATH.exists():
        # Create a simple 100x100 black square as a test logo
        try:
            from PIL import Image
            img = Image.new('RGB', (100, 100), color = (0, 0, 0))
            img.save(TEST_LOGO_PATH)
            print(f"Created test logo at {TEST_LOGO_PATH}")
        except ImportError:
            print("PIL not installed, cannot create test logo")
            print("Please create a test logo manually at", TEST_LOGO_PATH)
            sys.exit(1)

def test_login():
    print_header("Testing: Login with Admin User")
    
    url = f"{BASE_URL}/organisations/login"
    headers = {"Content-Type": "application/json"}
    data = {
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully logged in as {result['user']['full_name']}")
        print(f"✅ JWT Token: {result['access_token'][:20]}...")
        return result['access_token'], result['user']['organisation_id']
    else:
        print(f"❌ Failed to login: {response.status_code}")
        print(response.text)
        return None, None

def test_get_organisation(token, org_id):
    print_header("Testing: Get Organization Details")
    
    url = f"{BASE_URL}/organisations/{org_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully retrieved organization: {result['name']}")
        print(f"✅ Organization ID: {result['id']}")
        print(f"✅ Current Logo URL: {result['logo_url']}")
        return True
    else:
        print(f"❌ Failed to get organization: {response.status_code}")
        print(response.text)
        return False

def test_update_organisation(token, org_id):
    print_header("Testing: Update Organization Details")
    
    url = f"{BASE_URL}/organisations/update"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Prepare multipart form data
    files = {
        'logo': ('logo.png', open(TEST_LOGO_PATH, 'rb'), 'image/png')
    }
    data = {
        'name': f"Updated Test Organization {os.urandom(4).hex()}"
    }
    
    response = requests.put(url, headers=headers, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully updated organization: {result['organisation']['name']}")
        print(f"✅ New Logo URL: {result['organisation']['logo_url']}")
        return True
    else:
        print(f"❌ Failed to update organization: {response.status_code}")
        print(response.text)
        return False

def main():
    print("Starting organization update API tests...")
    
    # Create test logo if it doesn't exist
    create_test_logo()
    
    # Test logging in to get a JWT token
    token, org_id = test_login()
    if not token or not org_id:
        print("Cannot continue tests without a JWT token and organization ID")
        return
    
    # Test getting organization details
    if not test_get_organisation(token, org_id):
        print("Cannot continue tests without organization details")
        return
    
    # Test updating organization details
    test_update_organisation(token, org_id)
    
    # Test getting updated organization details
    test_get_organisation(token, org_id)
    
    print("\nTests completed!")

if __name__ == "__main__":
    main()
