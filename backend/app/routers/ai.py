from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import AIAnalysisOut, RecommendationOut, LearningPathOut
from backend.app.services.auth_service import get_current_user
from backend.app.services.ai_analysis_service import run_ai_student_analysis
from backend.app.services.recommendation_service import (
    get_student_recommendations,
    refresh_student_recommendations
)
from backend.app.services.learning_path_service import generate_personalized_learning_path

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

@router.get("/analysis", response_model=AIAnalysisOut)
def get_ai_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes real-time ML-backed student knowledge classification,
    learning pace, strength & weakness detection, and trend analysis.
    """
    analysis = run_ai_student_analysis(db, current_user.id)
    return analysis

@router.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches the student's active tailored recommendations.
    """
    return get_student_recommendations(db, current_user.id)

@router.post("/recommendations/refresh", response_model=List[RecommendationOut])
def refresh_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Forces an immediate re-evaluation of the AI recommendation algorithm.
    """
    refresh_student_recommendations(db, current_user.id)
    return get_student_recommendations(db, current_user.id)

@router.get("/learning-path", response_model=LearningPathOut)
def get_learning_path(
    subject_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a personalized, prerequisite-aware learning path with difficulty adaptation.
    """
    return generate_personalized_learning_path(db, current_user.id, subject_id)
