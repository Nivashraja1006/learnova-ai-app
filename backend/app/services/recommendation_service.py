from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.models.models import (
    Recommendation,
    StudentTopicPerformance,
    Topic,
    Subject,
    Quiz,
    LearningMaterial,
    Notification
)
from backend.app.ai.recommender import recommender

def refresh_student_recommendations(db: Session, student_id: int) -> List[Recommendation]:
    """
    Executes AI recommendation algorithm against live student database state,
    stores updated recommendations, and triggers real-time alerts.
    """
    # 1. Fetch all topics with subject name
    topics_raw = db.query(Topic, Subject.name.label("subject_name")).join(Subject, Topic.subject_id == Subject.id).all()
    topics = []
    for t, s_name in topics_raw:
        topics.append({
            "id": t.id,
            "name": t.name,
            "subject_name": s_name,
            "difficulty": t.difficulty,
            "order_index": t.order_index,
            "prerequisites": t.prerequisites
        })

    # 2. Fetch performances
    perfs_raw = db.query(StudentTopicPerformance).filter(
        StudentTopicPerformance.student_id == student_id
    ).all()
    topic_performances = [
        {
            "topic_id": p.topic_id,
            "score": p.score,
            "mastery_level": p.mastery_level,
            "attempts": p.attempts,
            "last_attempt": p.last_attempt
        }
        for p in perfs_raw
    ]

    # 3. Fetch materials & quizzes
    quizzes = [{"id": q.id, "topic_id": q.topic_id, "difficulty": q.difficulty} for q in db.query(Quiz).all()]
    materials = [{"id": m.id, "topic_id": m.topic_id, "difficulty": m.difficulty} for m in db.query(LearningMaterial).all()]

    # 4. Generate recommendations via AI recommender
    generated_recs = recommender.generate_recommendations(
        student_id=student_id,
        topics=topics,
        topic_performances=topic_performances,
        materials=materials,
        quizzes=quizzes
    )

    # 5. Clear old active recommendations for this student and persist new ones
    db.query(Recommendation).filter(
        Recommendation.student_id == student_id,
        Recommendation.status == "active"
    ).delete()

    saved_recs = []
    for rec_data in generated_recs:
        rec_obj = Recommendation(
            student_id=student_id,
            topic_id=rec_data["topic_id"],
            recommendation_type=rec_data["recommendation_type"],
            reason=rec_data["reason"],
            priority=rec_data["priority"],
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(rec_obj)
        saved_recs.append(rec_obj)

    # Create notification if weak topic practice is recommended
    weak_rec = next((r for r in generated_recs if r["recommendation_type"] == "Practice More"), None)
    if weak_rec:
        notif = Notification(
            student_id=student_id,
            title="🔍 AI Recommendation",
            message=f"AI detected that '{weak_rec['topic_name']}' needs more practice. Check your personalized recommendations.",
            notification_type="recommendation",
            is_read=False
        )
        db.add(notif)

    db.commit()

    return saved_recs

def get_student_recommendations(db: Session, student_id: int) -> List[Dict[str, Any]]:
    """
    Returns populated recommendations for the frontend
    """
    recs = db.query(Recommendation).filter(
        Recommendation.student_id == student_id,
        Recommendation.status == "active"
    ).order_by(Recommendation.priority.asc()).all()

    if not recs:
        # Generate them if none exist
        refresh_student_recommendations(db, student_id)
        recs = db.query(Recommendation).filter(
            Recommendation.student_id == student_id,
            Recommendation.status == "active"
        ).order_by(Recommendation.priority.asc()).all()

    results = []
    for r in recs:
        topic = db.query(Topic).filter(Topic.id == r.topic_id).first()
        subject_name = topic.subject.name if topic and topic.subject else "General"
        mat_count = db.query(LearningMaterial).filter(LearningMaterial.topic_id == r.topic_id).count() if topic else 0
        quiz = db.query(Quiz).filter(Quiz.topic_id == r.topic_id).first() if topic else None

        results.append({
            "id": r.id,
            "topic_id": r.topic_id,
            "topic_name": topic.name if topic else "Topic",
            "subject_name": subject_name,
            "recommendation_type": r.recommendation_type,
            "reason": r.reason,
            "priority": r.priority,
            "status": r.status,
            "created_at": r.created_at,
            "difficulty": topic.difficulty if topic else "Beginner",
            "material_count": mat_count,
            "quiz_id": quiz.id if quiz else None
        })

    return results
