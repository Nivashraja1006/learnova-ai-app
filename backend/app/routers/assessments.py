from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import User, Assessment, AssessmentAnswer, Subject, Question, Topic
from backend.app.schemas.schemas import AssessmentSubmit, AssessmentResultOut, AssessmentHistoryOut
from backend.app.services.auth_service import get_current_user
from backend.app.services.assessment_service import process_assessment_submission

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(
    data: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        answers_dict = [{"question_id": a.question_id, "selected_answer": a.selected_answer} for a in data.answers]
        result = process_assessment_submission(
            db=db,
            student_id=current_user.id,
            subject_id=data.subject_id,
            submitted_answers=answers_dict,
            time_taken_seconds=data.time_taken_seconds
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[AssessmentHistoryOut])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.student_id == current_user.id
    ).order_by(Assessment.completed_at.desc()).all()

    results = []
    for a in assessments:
        subject = db.query(Subject).filter(Subject.id == a.subject_id).first()
        results.append(AssessmentHistoryOut(
            id=a.id,
            subject_id=a.subject_id,
            subject_name=subject.name if subject else "General",
            score=a.score,
            total_questions=a.total_questions,
            percentage=a.percentage,
            completed_at=a.completed_at
        ))
    return results

@router.get("/{assessment_id}", response_model=AssessmentResultOut)
def get_assessment_detail(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.student_id == current_user.id
    ).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    subject = db.query(Subject).filter(Subject.id == a.subject_id).first()

    # Build answers breakdown
    detailed_answers = []
    topic_counts = {}
    for ans in a.answers:
        q = ans.question
        topic = q.topic if q else None
        t_name = topic.name if topic else "General"
        t_id = topic.id if topic else 0

        detailed_answers.append({
            "question_id": ans.question_id,
            "question_text": q.question_text if q else "Question",
            "selected_answer": ans.selected_answer,
            "correct_answer": q.correct_answer if q else "",
            "is_correct": ans.is_correct,
            "explanation": q.explanation if q else "",
            "topic_name": t_name
        })

        if t_id not in topic_counts:
            topic_counts[t_id] = {"total": 0, "correct": 0, "name": t_name}
        topic_counts[t_id]["total"] += 1
        if ans.is_correct:
            topic_counts[t_id]["correct"] += 1

    topic_breakdown = [
        {
            "topic_id": t_id,
            "topic_name": data["name"],
            "correct": data["correct"],
            "total": data["total"],
            "percentage": round((data["correct"] / max(1, data["total"])) * 100, 1),
            "mastery_level": "Proficient" if (data["correct"]/data["total"] >= 0.75) else ("Developing" if (data["correct"]/data["total"] >= 0.5) else "Novice")
        }
        for t_id, data in topic_counts.items()
    ]

    return {
        "id": a.id,
        "subject_id": a.subject_id,
        "subject_name": subject.name if subject else "General",
        "score": a.score,
        "total_questions": a.total_questions,
        "percentage": a.percentage,
        "time_taken_seconds": a.time_taken_seconds,
        "completed_at": a.completed_at,
        "topic_breakdown": topic_breakdown,
        "answers": detailed_answers,
        "ai_feedback": f"Review your {a.percentage}% diagnostic assessment to target growth areas."
    }
