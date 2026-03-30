import os
import firebase_admin
from firebase_admin import credentials, firestore

# Path to the downloaded Firebase service account key JSON file
SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'serviceAccountKey.json')

def initialize_firebase():
    """Initializes the Firebase Admin SDK and returns the Firestore client."""
    
    # Check if we've already initialized to avoid re-init errors
    if not firebase_admin._apps:
        if not os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
            raise FileNotFoundError(
                f"Firebase credentials not found at {SERVICE_ACCOUNT_KEY_PATH}. "
                "Please download your 'serviceAccountKey.json' from Firebase Console "
                "(Settings -> Service Accounts) and place it in the 'backend' folder."
            )
        
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    
    return firestore.client()

# Create a lazily initialized db client that you can import in views
class FirebaseClient:
    _db = None
    
    @classmethod
    def get_db(cls):
        if cls._db is None:
            cls._db = initialize_firebase()
        return cls._db

# Export a simple alias
def get_firestore_db():
    return FirebaseClient.get_db()
