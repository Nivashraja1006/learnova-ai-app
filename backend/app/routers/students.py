from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import (
    User,
    StudentProfile,
    StudentTopicPerformance,
    Achievement,
    StudentAchievement,
    Notification,
    Topic,
    Subject,
    Assessment,
    QuizAttempt
)
from backend.app.schemas.schemas import (
    StudentProfileOut,
    StudentProfileUpdate,
    AchievementOut,
    NotificationOut
)
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("/profile", response_model=StudentProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=StudentProfileOut)
def update_profile(
    data: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    if data.education_level is not None:
        profile.education_level = data.education_level
    if data.preferred_learning_style is not None:
        profile.preferred_learning_style = data.preferred_learning_style
    if data.target_subject is not None:
        profile.target_subject = data.target_subject
    if data.learning_goal is not None:
        profile.learning_goal = data.learning_goal

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/performance")
def get_student_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    assessments = db.query(Assessment).filter(Assessment.student_id == current_user.id).all()
    quizzes = db.query(QuizAttempt).filter(QuizAttempt.student_id == current_user.id).all()

    perfs = db.query(
        StudentTopicPerformance,
        Topic.name.label("topic_name"),
        Subject.name.label("subject_name")
    ).join(Topic, StudentTopicPerformance.topic_id == Topic.id)\
     .join(Subject, Topic.subject_id == Subject.id)\
     .filter(StudentTopicPerformance.student_id == current_user.id).all()

    topic_items = []
    total_score = 0.0
    for p, t_name, s_name in perfs:
        topic_items.append({
            "topic_id": p.topic_id,
            "topic_name": t_name,
            "subject_name": s_name,
            "score": p.score,
            "mastery_level": p.mastery_level,
            "attempts": p.attempts,
            "last_attempt": p.last_attempt
        })
        total_score += p.score

    avg_score = round(total_score / len(topic_items), 1) if topic_items else 0.0
    mastered_count = sum(1 for item in topic_items if item["mastery_level"] in ["Proficient", "Mastered"])

    # Subject-wise breakdown
    subject_map = {}
    for item in topic_items:
        s_name = item["subject_name"]
        if s_name not in subject_map:
            subject_map[s_name] = {"scores": [], "attempts": 0}
        subject_map[s_name]["scores"].append(item["score"])
        subject_map[s_name]["attempts"] += item["attempts"]

    subject_breakdown = [
        {
            "subject_name": s_name,
            "average_score": round(sum(val["scores"]) / max(1, len(val["scores"])), 1),
            "topics_count": len(val["scores"]),
            "total_attempts": val["attempts"]
        }
        for s_name, val in subject_map.items()
    ]

    return {
        "overall": {
            "average_score": avg_score,
            "topics_mastered": mastered_count,
            "total_topics_tracked": len(topic_items),
            "learning_streak": profile.streak_days if profile else 1,
            "total_study_minutes": profile.total_study_minutes if profile else 45,
            "assessments_completed": len(assessments),
            "quizzes_completed": len(quizzes)
        },
        "subject_breakdown": subject_breakdown,
        "topic_performances": topic_items
    }

@router.get("/achievements", response_model=List[AchievementOut])
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_achievements = db.query(Achievement).all()
    unlocked_map = {
        sa.achievement_id: sa.unlocked_at
        for sa in db.query(StudentAchievement).filter(StudentAchievement.student_id == current_user.id).all()
    }

    results = []
    for ach in all_achievements:
        is_unlocked = ach.id in unlocked_map
        results.append({
            "id": ach.id,
            "name": ach.name,
            "code": ach.code,
            "description": ach.description,
            "icon": ach.icon,
            "badge_color": ach.badge_color,
            "is_unlocked": is_unlocked,
            "unlocked_at": unlocked_map.get(ach.id)
        })

    return results

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.student_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(15).all()
    return notifs

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.student_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
