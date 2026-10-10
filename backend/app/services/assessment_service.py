from datetime import datetime
from typing import Dict, Any, List
from collections import defaultdict
from sqlalchemy.orm import Session
from backend.app.models.models import (
    Assessment,
    AssessmentAnswer,
    Question,
    Subject,
    Topic,
    Notification
)
from backend.app.services.performance_service import (
    update_topic_performance,
    check_and_award_achievements,
    record_activity_and_streak
)
from backend.app.services.recommendation_service import refresh_student_recommendations

def process_assessment_submission(
    db: Session,
    student_id: int,
    subject_id: int,
    submitted_answers: List[Dict[str, Any]],
    time_taken_seconds: int = 0
) -> Dict[str, Any]:
    """
    Evaluates assessment answers, updates database records, performs
    topic-level scoring, triggers AI knowledge updates, and awards achievements.
    """
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise ValueError("Subject not found")

    total_questions = len(submitted_answers)
    if total_questions == 0:
        raise ValueError("No answers submitted")

    correct_count = 0
    detailed_answers = []
    topic_question_counts = defaultdict(lambda: {"total": 0, "correct": 0, "topic_name": ""})

    for item in submitted_answers:
        q_id = item["question_id"]
        selected_opt = item["selected_answer"].strip().upper()

        q = db.query(Question).filter(Question.id == q_id).first()
        if not q:
            continue

        is_corr = (selected_opt == q.correct_answer.strip().upper())
        if is_corr:
            correct_count += 1

        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
        t_name = topic.name if topic else "General Topic"

        topic_question_counts[q.topic_id]["total"] += 1
        if is_corr:
            topic_question_counts[q.topic_id]["correct"] += 1
        topic_question_counts[q.topic_id]["topic_name"] = t_name

        detailed_answers.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_answer": selected_opt,
            "correct_answer": q.correct_answer,
            "is_correct": is_corr,
            "explanation": q.explanation,
            "topic_name": t_name
        })

    percentage = round((correct_count / max(1, total_questions)) * 100, 1)

    # 1. Save Assessment
    assessment = Assessment(
        student_id=student_id,
        subject_id=subject_id,
        score=correct_count,
        total_questions=total_questions,
        percentage=percentage,
        time_taken_seconds=time_taken_seconds,
        completed_at=datetime.utcnow()
    )
    db.add(assessment)
    db.flush()

    # 2. Save Assessment Answers
    for ans in detailed_answers:
        db.add(AssessmentAnswer(
            assessment_id=assessment.id,
            question_id=ans["question_id"],
            selected_answer=ans["selected_answer"],
            is_correct=ans["is_correct"]
        ))

    # 3. Update Topic Performances
    topic_breakdown = []
    weak_topic_names = []
    for t_id, data in topic_question_counts.items():
        t_pct = round((data["correct"] / max(1, data["total"])) * 100, 1)
        perf = update_topic_performance(db, student_id, t_id, t_pct)
        topic_breakdown.append({
            "topic_id": t_id,
            "topic_name": data["topic_name"],
            "correct": data["correct"],
            "total": data["total"],
            "percentage": t_pct,
            "mastery_level": perf.mastery_level
        })
        if t_pct < 60:
            weak_topic_names.append(data["topic_name"])

    # 4. Trigger AI recommendation refresh
    refresh_student_recommendations(db, student_id)

    # 5. Check achievements & update streak
    check_and_award_achievements(db, student_id)
    record_activity_and_streak(db, student_id)

    # 6. Add notification
    notif = Notification(
        student_id=student_id,
        title="📊 Assessment Completed",
        message=f"You scored {percentage}% in {subject.name}. AI has updated your personalized learning path.",
        notification_type="success" if percentage >= 70 else "info",
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(assessment)

    # Generate AI Feedback note
    if percentage >= 80:
        feedback = f"Superb performance ({percentage}%)! You displayed strong conceptual mastery in {subject.name}. Advanced challenges have been prioritized for you."
    elif percentage >= 60:
        feedback = f"Good solid foundation ({percentage}%). While your general comprehension is sound, targeting {', '.join(weak_topic_names) if weak_topic_names else 'practice problems'} will elevate your level."
    else:
        feedback = f"Assessment score: {percentage}%. AI has adjusted your learning path to start from core foundations with step-by-step notes and guided exercises."

    return {
        "id": assessment.id,
        "subject_id": subject.id,
        "subject_name": subject.name,
        "score": correct_count,
        "total_questions": total_questions,
        "percentage": percentage,
        "time_taken_seconds": time_taken_seconds,
        "completed_at": assessment.completed_at,
        "topic_breakdown": topic_breakdown,
        "answers": detailed_answers,
        "ai_feedback": feedback
    }
