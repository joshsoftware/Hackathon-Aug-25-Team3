"""
Test script to verify JWT token authentication with User and Organization models.
This script tests the following:
1. Creating an organization with an admin user
2. Logging in to get a JWT token
3. Using the JWT token to access a protected endpoint
"""
import asyncio
import json
import requests
import sys

# When running inside Docker, we need to use the service name instead of localhost
BASE_URL = "http://localhost:3001/api/v1"  # For running on host
# BASE_URL = "http://localhost:80/api/v1"  # For running inside Docker container
TEST_ORG_NAME = "Test Organization"
TEST_ADMIN_NAME = "Test Admin"
TEST_ADMIN_EMAIL = "admin@testorg.com"
TEST_ADMIN_PASSWORD = "securepassword123"

def print_header(message):
    print("\n" + "=" * 50)
    print(message)
    print("=" * 50)

def test_create_organization_with_admin():
    print_header("Testing: Create Organization with Admin")
    
    url = f"{BASE_URL}/organisations/onboard-with-admin"
    headers = {"Content-Type": "application/json"}
    data = {
        "organisation_name": TEST_ORG_NAME,
        "admin_full_name": TEST_ADMIN_NAME,
        "admin_email": TEST_ADMIN_EMAIL,
        "admin_password": TEST_ADMIN_PASSWORD
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully created organization with ID: {result['organisation_id']}")
        return result['organisation_id']
    else:
        print(f"❌ Failed to create organization: {response.status_code}")
        print(response.text)
        return None

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
        return result['access_token']
    else:
        print(f"❌ Failed to login: {response.status_code}")
        print(response.text)
        return None

def test_get_current_user(token):
    print_header("Testing: Get Current User with JWT Token")
    
    url = f"{BASE_URL}/organisations/me"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully retrieved current user: {result['full_name']}")
        print(f"✅ User ID: {result['id']}")
        print(f"✅ Organization ID: {result['organisation_id']}")
        return result['id']
    else:
        print(f"❌ Failed to get current user: {response.status_code}")
        print(response.text)
        return None

def test_get_presentations(token):
    print_header("Testing: Get Presentations with JWT Token")
    
    url = f"{BASE_URL}/ppt/presentation/all"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully retrieved presentations: {len(result)} found")
        return True
    else:
        print(f"❌ Failed to get presentations: {response.status_code}")
        print(response.text)
        return False

def main():
    print("Starting JWT authentication tests...")
    
    # Test creating an organization with an admin user
    org_id = test_create_organization_with_admin()
    if not org_id:
        print("Cannot continue tests without an organization ID")
        return
    
    # Test logging in to get a JWT token
    token = test_login()
    if not token:
        print("Cannot continue tests without a JWT token")
        return
    
    # Test getting the current user with the JWT token
    user_id = test_get_current_user(token)
    if not user_id:
        print("Cannot continue tests without a user ID")
        return
    
    # Test getting presentations with the JWT token
    test_get_presentations(token)
    
    print("\nTests completed!")

if __name__ == "__main__":
    main()
