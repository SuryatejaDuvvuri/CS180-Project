import firebase_admin
from firebase_admin import credentials, firestore
import os

#  Get the absolute path to the project directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # This is backend/
AUTH_ACCOUNTS_DIR = os.path.join(BASE_DIR, "auth_project")  # Navigate to accounts folder

# Define the path to the Firebase credentials file
CRED_PATH = os.path.join(AUTH_ACCOUNTS_DIR, "firebase_key.json")

#  Check if the key exists before loading
if not os.path.exists(CRED_PATH):
    raise FileNotFoundError(f"Firebase credentials not found: {CRED_PATH}")

#  Initialize Firebase with the correct key
cred = credentials.Certificate(CRED_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

print(f" Using Firebase credentials from: {CRED_PATH}")
