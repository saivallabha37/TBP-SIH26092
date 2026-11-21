import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("loan-saathi-ml")

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
model: Optional[SentenceTransformer] = None


# ---------------------------------------------------------
# Lifespan Management (Load Hugging Face Model at Startup)
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    logger.info(f"Loading Hugging Face model: {MODEL_NAME}...")
    try:
        model = SentenceTransformer(MODEL_NAME)
        logger.info(f"Successfully loaded {MODEL_NAME} on device: {model.device}")
    except Exception as e:
        logger.error(f"Failed to load model {MODEL_NAME}: {str(e)}", exc_info=True)
        raise e
    yield
    logger.info("Shutting down Loan Saathi ML Microservice...")


# ---------------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------------
app = FastAPI(
    title="Loan Saathi - Hugging Face Semantic Ranking Microservice",
    description=(
        "Multilingual semantic ranking microservice for Loan Saathi (SIH26092). "
        "Computes 384-dimensional dense vector embeddings using Hugging Face Transformer "
        "to semantically score and rank government welfare schemes against user business queries."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------
origins = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class SchemeItem(BaseModel):
    id: str = Field(..., description="Unique scheme identifier")
    name: str = Field(..., description="Official scheme name")
    description: str = Field(..., description="Scheme summary/guidelines")
    issuing_authority: Optional[str] = Field(
        default="", description="Issuing agency (e.g., NSFDC, NBCFDC, NSKFDC)"
    )


class RankRequest(BaseModel):
    user_query: str = Field(
        ...,
        description="Natural language statement or prompt provided by the entrepreneur",
        examples=["I run a small handloom weaving shop in Hyderabad and need a loan for buying raw yarn."]
    )
    purpose: Optional[str] = Field(
        default=None,
        description="Explicit business category or purpose (e.g., Handicrafts, Agriculture, MSME)",
        examples=["Handloom weaving equipment and yarn purchase"]
    )
    schemes: List[SchemeItem] = Field(
        ...,
        description="List of candidate government schemes to rank"
    )


class RankedSchemeItem(BaseModel):
    id: str
    name: str
    description: str
    issuing_authority: Optional[str] = ""
    semantic_score: float = Field(
        ...,
        description="Normalized relevance score from 0.0 to 100.0 percentage"
    )
    similarity_score: float = Field(
        ...,
        description="Raw cosine similarity score (-1.0 to 1.0)"
    )


class RankResponse(BaseModel):
    success: bool
    user_query: str
    model_used: str
    ranked_schemes: List[RankedSchemeItem]
    total: int


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.get("/", tags=["General"])
def root():
    return {
        "service": "Loan Saathi - Hugging Face ML Semantic Ranking Microservice",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "model_info": "/model-info",
            "rank_schemes": "/rank-schemes",
            "docs": "/docs",
        },
    }


@app.get("/health", tags=["Monitoring"])
def health():
    """
    Health check endpoint returning service status, loaded model name, and device.
    """
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hugging Face model is not yet loaded",
        )
    return {
        "status": "healthy",
        "service": "Loan Saathi ML Microservice",
        "model": MODEL_NAME,
        "device": str(model.device),
        "embedding_dim": 384,
    }


@app.get("/model-info", tags=["Audit & Transparency"])
def model_info():
    """
    Audit and transparency endpoint detailing model architecture, embeddings, and capabilities.
    """
    return {
        "model_name": MODEL_NAME,
        "architecture": "Transformer (MiniLM-L12) - Dense Vector Sentence Embeddings",
        "embedding_dimension": 384,
        "similarity_method": "Cosine Similarity (Normalized Dot Product)",
        "score_scaling": "Percentage scale: max(0.0, cosine_similarity) * 100",
        "supported_languages": [
            "English",
            "Hindi",
            "Telugu",
            "Tamil",
            "Kannada",
            "Malayalam",
            "Marathi",
            "Bengali",
            "Gujarati",
            "Punjabi",
            "Urdu",
            "Odia",
            "Assamese",
            "50+ Global and Indic Languages",
        ],
        "purpose": (
            "Multilingual semantic matching and ranking of government welfare loan schemes "
            "strictly for marginalized entrepreneurs (SC/ST/OBC/Safai Karamcharis/Women)."
        ),
        "license": "Apache 2.0 (Hugging Face / sentence-transformers)",
    }


@app.post("/rank-schemes", response_model=RankResponse, tags=["Semantic Ranking"])
def rank_schemes(payload: RankRequest):
    """
    Ranks schemes semantically by generating dense 384-dimensional vector embeddings
    for the user's natural language business profile and candidate schemes, then
    computing normalized cosine similarity scores.
    """
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model not initialized",
        )

    user_query = payload.user_query.strip()
    if not user_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_query cannot be empty",
        )

    # If no schemes are provided, return empty ranking
    if not payload.schemes:
        return RankResponse(
            success=True,
            user_query=user_query,
            model_used=MODEL_NAME,
            ranked_schemes=[],
            total=0,
        )

    # 1. Prepare user embedding input (combine query + explicit purpose if available)
    if payload.purpose and payload.purpose.strip():
        combined_user_text = f"{user_query} Purpose: {payload.purpose.strip()}"
    else:
        combined_user_text = user_query

    # 2. Prepare scheme texts (name + issuing authority + description)
    scheme_texts: List[str] = []
    for s in payload.schemes:
        authority = f"[{s.issuing_authority}] " if s.issuing_authority else ""
        text = f"{authority}{s.name}. {s.description}"
        scheme_texts.append(text)

    # 3. Generate dense vector embeddings (normalized for cosine similarity via dot product)
    try:
        user_embedding = model.encode(
            combined_user_text,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

        scheme_embeddings = model.encode(
            scheme_texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
    except Exception as e:
        logger.error(f"Error computing embeddings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute embeddings: {str(e)}",
        )

    # 4. Compute cosine similarity (dot product of L2-normalized vectors)
    # user_embedding: shape (384,)
    # scheme_embeddings: shape (N, 384)
    # cosine_similarities: shape (N,)
    raw_similarities = np.dot(scheme_embeddings, user_embedding)

    # 5. Format and compute percentage semantic_score
    ranked: List[RankedSchemeItem] = []
    for s, raw_sim in zip(payload.schemes, raw_similarities):
        raw_float = float(raw_sim)
        # Scale to 0 - 100 percentage: non-negative similarity clipped to [0, 1] * 100
        score_percent = round(max(0.0, min(1.0, raw_float)) * 100, 2)

        ranked.append(
            RankedSchemeItem(
                id=s.id,
                name=s.name,
                description=s.description,
                issuing_authority=s.issuing_authority,
                semantic_score=score_percent,
                similarity_score=round(raw_float, 4),
            )
        )

    # 6. Sort descending by semantic_score
    ranked.sort(key=lambda item: item.semantic_score, reverse=True)

    return RankResponse(
        success=True,
        user_query=user_query,
        model_used=MODEL_NAME,
        ranked_schemes=ranked,
        total=len(ranked),
    )


# ---------------------------------------------------------
# CLI entrypoint for running via `python main.py`
# ---------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
