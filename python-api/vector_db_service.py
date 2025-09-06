
import configparser, logging, requests, io, uuid
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, VectorParams
from pypdf import PdfReader

# --- Globals ---
qdrant_client = None
openai_client = None
config = None
embed_model = ""

# --- Initialization ---
def initialize(oai_client):
    global qdrant_client, openai_client, config, embed_model
    
    logging.info("Initializing Vector DB Service...")
    openai_client = oai_client
    
    config = configparser.ConfigParser()
    config.read('config.ini')

    qdrant_url = config.get('qdrant', 'QDRANT_URL')
    qdrant_api_key = config.get('qdrant', 'QDRANT_API_KEY')
    embed_model = config.get('qdrant', 'EMBED_MODEL')

    try:
        qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        logging.info("Qdrant client initialized successfully.")
    except Exception as e:
        logging.error(f"Failed to initialize Qdrant client: {e}")
        qdrant_client = None

# --- Core Functions ---

def get_or_create_policy_embeddings(pdf_url):
    """
    Checks if a policy document is already in the vector DB.
    If not, it downloads, chunks, embeds, and stores it.
    """
    if not qdrant_client:
        logging.error("Qdrant client not initialized. Cannot process policy embeddings.")
        return

    collection_name = config.get('qdrant', 'COLLECTION_NAME')
    
    # Check if vectors for this specific PDF URL already exist
    try:
        scroll_response = qdrant_client.scroll(
            collection_name=collection_name,
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="source",
                        match=models.MatchValue(value=pdf_url),
                    ),
                ]
            ),
            limit=1,
            with_payload=False,
            with_vectors=False
        )
        if scroll_response[0]: # If records are found
            logging.info(f"Embeddings for '{pdf_url}' already exist in Qdrant. Skipping ingestion.")
            return
    except Exception as e:
        # This can happen if the collection doesn't exist yet. We'll create it.
        logging.warning(f"Could not check for existing embeddings (collection might not exist yet): {e}")

    logging.info(f"No embeddings found for '{pdf_url}'. Starting ingestion process.")

    # 1. Download and Extract Text
    try:
        response = requests.get(pdf_url, timeout=10)
        response.raise_for_status()
        pdf_stream = io.BytesIO(response.content)
        reader = PdfReader(pdf_stream)
        full_text = "".join(page.extract_text() for page in reader.pages if page.extract_text())
        logging.info(f"Successfully extracted text from {pdf_url}.")
    except Exception as e:
        logging.error(f"Failed to download or parse PDF from {pdf_url}: {e}")
        return

    # 2. Chunk Text
    chunks = [p.strip() for p in full_text.split('\n\n') if p.strip()]
    logging.info(f"Split document into {len(chunks)} chunks.")

    # 3. Embed Chunks
    if not chunks:
        logging.warning("No text chunks to embed.")
        return
        
    try:
        embeddings = openai_client.embeddings.create(input=chunks, model=embed_model)
        vectors = [e.embedding for e in embeddings.data]
        vector_size = len(vectors[0])
        logging.info(f"Successfully created {len(vectors)} embeddings of size {vector_size}.")
    except Exception as e:
        logging.error(f"Failed to create embeddings with OpenAI: {e}")
        return
        
    # 4. Create Collection if it doesn't exist
    try:
        qdrant_client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            on_disk_payload=True
        )
        logging.info(f"Collection '{collection_name}' created or recreated successfully.")
        
        # Create a payload index for the 'source' field to enable filtering
        qdrant_client.create_payload_index(
            collection_name=collection_name,
            field_name="source",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        logging.info("Payload index for 'source' field created successfully.")
    except Exception as e:
        logging.warning(f"Could not recreate collection or index '{collection_name}', it might already exist. Error: {e}")
        
    # 5. Upsert to Qdrant
    try:
        qdrant_client.upsert(
            collection_name=collection_name,
            points=models.Batch(
                ids=[str(uuid.uuid4()) for _ in chunks],
                vectors=vectors,
                payloads=[{"text": chunk, "source": pdf_url} for chunk in chunks]
            ),
            wait=True
        )
        logging.info(f"Successfully upserted {len(chunks)} points to Qdrant collection '{collection_name}'.")
    except Exception as e:
        logging.error(f"Failed to upsert points to Qdrant: {e}")

def search_policy_documents(query, pdf_url, limit=3):
    """
    Performs a semantic search on a specific policy document in the vector DB.
    """
    if not qdrant_client or not openai_client:
        logging.error("Clients not initialized. Cannot perform search.")
        return []

    collection_name = config.get('qdrant', 'COLLECTION_NAME')
    
    try:
        # Create a vector for the user's query
        query_embedding_response = openai_client.embeddings.create(input=[query], model=embed_model)
        query_vector = query_embedding_response.data[0].embedding

        # Perform the search
        search_results = qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="source",
                        match=models.MatchValue(value=pdf_url),
                    )
                ]
            ),
            limit=limit,
            with_payload=True
        )
        logging.info(f"Found {len(search_results)} relevant documents for query '{query}' from '{pdf_url}'.")
        return search_results
    except Exception as e:
        logging.error(f"An error occurred during vector search: {e}")
        return []

    