from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import (
    Quiz,
    QuizAttempt,
    QuizAttemptAnswer,
    Question,
    Topic,
    Subject,
    User,
    Notification
)
from backend.app.schemas.schemas import (
    QuizOut,
    QuizSubmit,
    QuizResultOut,
    QuestionOut
)
from backend.app.services.auth_service import get_current_user
from backend.app.services.performance_service import (
    update_topic_performance,
    check_and_award_achievements,
    record_activity_and_streak
)
from backend.app.services.recommendation_service import refresh_student_recommendations

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

@router.get("", response_model=List[QuizOut])
def list_quizzes(
    topic_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Quiz)
    if topic_id:
        query = query.filter(Quiz.topic_id == topic_id)
    if subject_id:
        query = query.join(Topic, Quiz.topic_id == Topic.id).filter(Topic.subject_id == subject_id)

    quizzes = query.all()
    results = []
    for q in quizzes:
        topic = q.topic
        subject = topic.subject if topic else None
        q_count = db.query(Question).filter(Question.topic_id == q.topic_id).count()
        results.append(QuizOut(
            id=q.id,
            topic_id=q.topic_id,
            title=q.title,
            difficulty=q.difficulty,
            time_limit=q.time_limit,
            topic_name=topic.name if topic else "Topic",
            subject_name=subject.name if subject else "General",
            question_count=q_count
        ))
    return results

@router.get("/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    topic = quiz.topic
    subject = topic.subject if topic else None

    # Fetch questions for this topic
    questions = db.query(Question).filter(Question.topic_id == quiz.topic_id).all()
    question_outs = [
        QuestionOut(
            id=q.id,
            topic_id=q.topic_id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            difficulty=q.difficulty
        )
        for q in questions
    ]

    return QuizOut(
        id=quiz.id,
        topic_id=quiz.topic_id,
        title=quiz.title,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        topic_name=topic.name if topic else "Topic",
        subject_name=subject.name if subject else "General",
        question_count=len(questions),
        questions=question_outs
    )

@router.post("/{quiz_id}/submit", response_model=QuizResultOut)
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    topic = quiz.topic
    topic_name = topic.name if topic else "Topic"

    total_q = len(submission.answers)
    if total_q == 0:
        raise HTTPException(status_code=400, detail="No answers submitted")

    correct_count = 0
    detailed_answers = []

    for item in submission.answers:
        q = db.query(Question).filter(Question.id == item.question_id).first()
        if not q:
            continue
        is_corr = (item.selected_answer.strip().upper() == q.correct_answer.strip().upper())
        if is_corr:
            correct_count += 1

        detailed_answers.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_answer": item.selected_answer.strip().upper(),
            "correct_answer": q.correct_answer,
            "is_correct": is_corr,
            "explanation": q.explanation,
            "topic_name": topic_name
        })

    percentage = round((correct_count / max(1, total_q)) * 100, 1)

    # 1. Save Quiz Attempt
    attempt = QuizAttempt(
        student_id=current_user.id,
        quiz_id=quiz.id,
        score=correct_count,
        total_questions=total_q,
        percentage=percentage,
        time_taken_seconds=submission.time_taken_seconds or 0,
        completed_at=datetime.utcnow()
    )
    db.add(attempt)
    db.flush()

    # 2. Save Answers
    for ans in detailed_answers:
        db.add(QuizAttemptAnswer(
            quiz_attempt_id=attempt.id,
            question_id=ans["question_id"],
            selected_answer=ans["selected_answer"],
            is_correct=ans["is_correct"]
        ))

    # 3. Update Student Topic Performance
    update_topic_performance(db, current_user.id, quiz.topic_id, percentage)

    # 4. Trigger AI recommendation refresh
    refresh_student_recommendations(db, current_user.id)

    # 5. Check achievements & update streak
    check_and_award_achievements(db, current_user.id)
    record_activity_and_streak(db, current_user.id)

    # 6. Add notification
    notif = Notification(
        student_id=current_user.id,
        title="🎯 Quiz Completed",
        message=f"You scored {percentage}% in '{quiz.title}'. Keep up the momentum!",
        notification_type="success" if percentage >= 75 else "info",
        is_read=False
    )
    db.add(notif)
    db.commit()

    note = "Mastery demonstrated! Ready for next curriculum milestone." if percentage >= 75 else "Review the detailed explanations below to reinforce weak points before retesting."

    return {
        "id": attempt.id,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "topic_name": topic_name,
        "score": correct_count,
        "total_questions": total_q,
        "percentage": percentage,
        "time_taken_seconds": submission.time_taken_seconds or 0,
        "completed_at": attempt.completed_at,
        "answers": detailed_answers,
        "recommendation_note": note
    }
