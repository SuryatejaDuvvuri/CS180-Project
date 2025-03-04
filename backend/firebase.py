import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
load_dotenv()

#  Get the absolute path to the project directory
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # This is backend/
# AUTH_ACCOUNTS_DIR = os.path.join(BASE_DIR, "auth_project")  # Navigate to accounts folder

# # Define the path to the Firebase credentials file
# CRED_PATH = os.path.join(AUTH_ACCOUNTS_DIR, "firebase_key.json")


# #  Check if the key exists before loading
# if not os.path.exists(CRED_PATH):
#     raise FileNotFoundError(f"Firebase credentials not found: {CRED_PATH}")

# #  Initialize Firebase with the correct key
CRED_PATH = os.getenv('CRED_PATH')
if not CRED_PATH:
    raise ValueError("CRED_PATH environment variable is not set")

if not os.path.exists(CRED_PATH):
    raise FileNotFoundError(f"Firebase credentials file not found at: {CRED_PATH}")

try:
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print(f"Firebase initialized successfully with credentials from: {CRED_PATH}")
except Exception as e:
    print(f"Error initializing Firebase: {str(e)}")
    raise