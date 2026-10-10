from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from backend.app.models.models import (
    StudentTopicPerformance,
    Topic,
    Achievement,
    StudentAchievement,
    Notification,
    User,
    StudentProfile,
    Assessment,
    QuizAttempt
)

def determine_mastery_level(score: float) -> str:
    if score >= 90.0:
        return "Mastered"
    elif score >= 75.0:
        return "Proficient"
    elif score >= 50.0:
        return "Developing"
    else:
        return "Novice"

def update_topic_performance(
    db: Session,
    student_id: int,
    topic_id: int,
    session_percentage: float
) -> StudentTopicPerformance:
    """
    Updates student mastery for a topic using moving average weighting:
    New Score = 0.6 * Session Score + 0.4 * Previous Score
    """
    perf = db.query(StudentTopicPerformance).filter(
        StudentTopicPerformance.student_id == student_id,
        StudentTopicPerformance.topic_id == topic_id
    ).first()

    if not perf:
        perf = StudentTopicPerformance(
            student_id=student_id,
            topic_id=topic_id,
            score=round(session_percentage, 1),
            mastery_level=determine_mastery_level(session_percentage),
            attempts=1,
            last_attempt=datetime.utcnow()
        )
        db.add(perf)
    else:
        # Weighted update
        new_score = round((0.65 * session_percentage) + (0.35 * perf.score), 1)
        perf.score = new_score
        perf.mastery_level = determine_mastery_level(new_score)
        perf.attempts += 1
        perf.last_attempt = datetime.utcnow()

    db.commit()
    db.refresh(perf)
    return perf

def check_and_award_achievements(db: Session, student_id: int) -> List[str]:
    """
    Evaluates student performance criteria and unlocks badges dynamically.
    Returns list of newly unlocked badge names.
    """
    newly_unlocked = []

    # Get unlocked achievement IDs
    unlocked_ids = {
        sa.achievement_id
        for sa in db.query(StudentAchievement).filter(StudentAchievement.student_id == student_id).all()
    }

    assessments_count = db.query(Assessment).filter(Assessment.student_id == student_id).count()
    quizzes_count = db.query(QuizAttempt).filter(QuizAttempt.student_id == student_id).count()
    mastered_count = db.query(StudentTopicPerformance).filter(
        StudentTopicPerformance.student_id == student_id,
        StudentTopicPerformance.score >= 85.0
    ).count()

    all_achievements = db.query(Achievement).all()

    for ach in all_achievements:
        if ach.id in unlocked_ids:
            continue

        unlock = False
        if ach.code == "first_assessment" and assessments_count >= 1:
            unlock = True
        elif ach.code == "quiz_master" and quizzes_count >= 3:
            unlock = True
        elif ach.code == "fast_learner" and quizzes_count >= 1 and assessments_count >= 1:
            unlock = True
        elif ach.code == "topic_master" and mastered_count >= 2:
            unlock = True
        elif ach.code == "streak_7":
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
            if profile and profile.streak_days >= 7:
                unlock = True
        elif ach.code == "improvement_champion":
            recent_attempts = db.query(QuizAttempt).filter(
                QuizAttempt.student_id == student_id
            ).order_by(QuizAttempt.completed_at.desc()).limit(3).all()
            if len(recent_attempts) >= 2 and (recent_attempts[0].percentage - recent_attempts[-1].percentage) >= 15:
                unlock = True

        if unlock:
            sa = StudentAchievement(
                student_id=student_id,
                achievement_id=ach.id,
                unlocked_at=datetime.utcnow()
            )
            db.add(sa)
            newly_unlocked.append(ach.name)

            # Add notification
            notif = Notification(
                student_id=student_id,
                title="🏆 Badge Unlocked!",
                message=f"Congratulations! You unlocked the '{ach.name}' achievement badge.",
                notification_type="milestone",
                is_read=False
            )
            db.add(notif)

    if newly_unlocked:
        db.commit()

    return newly_unlocked

def record_activity_and_streak(db: Session, student_id: int):
    """
    Updates streak and last active date
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    if profile:
        now = datetime.utcnow()
        if profile.last_active_date:
            days_diff = (now.date() - profile.last_active_date.date()).days
            if days_diff == 1:
                profile.streak_days += 1
            elif days_diff > 1:
                profile.streak_days = 1
        profile.last_active_date = now
        profile.total_study_minutes += 15
        db.commit()
