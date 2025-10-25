import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ChromaDB Configuration
CHROMA_API_KEY = os.getenv(
    "CHROMA_API_KEY"
)
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")

# Application Configuration
IS_LOCAL = os.getenv("IS_LOCAL", "true").lower() == "true"
