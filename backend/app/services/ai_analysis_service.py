from typing import Dict, List, Any
from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.models.models import (
    User,
    StudentProfile,
    Assessment,
    QuizAttempt,
    StudentTopicPerformance,
    Topic,
    Subject
)
from backend.app.ai.ml_engine import ml_engine

def run_ai_student_analysis(db: Session, student_id: int) -> Dict[str, Any]:
    """
    Executes comprehensive AI analytical assessment of a student.
    Uses ML algorithms to synthesize knowledge depth, weakness hotspots,
    learning speed, and trajectory.
    """
    student = db.query(User).filter(User.id == student_id).first()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    target_subject_name = profile.target_subject if profile and profile.target_subject else "Python Programming"

    # 1. Fetch assessments and quiz attempts
    assessments = db.query(Assessment).filter(Assessment.student_id == student_id).order_by(Assessment.completed_at.asc()).all()
    quizzes = db.query(QuizAttempt).filter(QuizAttempt.student_id == student_id).order_by(QuizAttempt.completed_at.asc()).all()

    # 2. Fetch topic performances
    perfs = db.query(
        StudentTopicPerformance,
        Topic.name.label("topic_name"),
        Subject.name.label("subject_name")
    ).join(Topic, StudentTopicPerformance.topic_id == Topic.id)\
     .join(Subject, Topic.subject_id == Subject.id)\
     .filter(StudentTopicPerformance.student_id == student_id).all()

    topic_perf_list = []
    total_score_sum = 0.0
    for p, t_name, s_name in perfs:
        topic_perf_list.append({
            "topic_id": p.topic_id,
            "topic_name": t_name,
            "subject_name": s_name,
            "score": p.score,
            "mastery_level": p.mastery_level,
            "attempts": p.attempts,
            "last_attempt": p.last_attempt
        })
        total_score_sum += p.score

    avg_score = (total_score_sum / len(topic_perf_list)) if topic_perf_list else 50.0

    # If assessments exist, factor their average score
    if assessments:
        assessment_avg = sum(a.percentage for a in assessments) / len(assessments)
        avg_score = round(0.5 * avg_score + 0.5 * assessment_avg, 1)

    # Completion rate estimation
    total_topics_count = db.query(Topic).count()
    completed_topics_count = sum(1 for p in topic_perf_list if p["score"] >= 75.0)
    completion_rate = completed_topics_count / max(1, total_topics_count)

    # Advanced accuracy estimation
    adv_perfs = [p["score"] for p in topic_perf_list if p.get("mastery_level") in ["Proficient", "Mastered"]]
    adv_acc = (sum(adv_perfs) / (len(adv_perfs) * 100)) if adv_perfs else 0.3

    # 3. ML Knowledge Level Classification
    knowledge_level_data = ml_engine.classify_knowledge_level(
        avg_score=avg_score,
        completion_rate=completion_rate,
        advanced_accuracy=adv_acc,
        consistency_factor=2.0 + (len(quizzes) * 0.2)
    )

    # Update profile knowledge level in DB
    if profile:
        profile.knowledge_level = knowledge_level_data["level"]
        db.commit()

    # 4. Strength & Weakness Detection
    strengths_weaknesses = ml_engine.detect_strengths_and_weaknesses(topic_perf_list)

    # 5. Learning Pace Analysis
    assessment_dicts = [{"percentage": a.percentage, "time_taken_seconds": a.time_taken_seconds, "total_questions": a.total_questions, "completed_at": a.completed_at} for a in assessments]
    quiz_dicts = [{"percentage": q.percentage, "time_taken_seconds": q.time_taken_seconds, "total_questions": q.total_questions, "completed_at": q.completed_at} for q in quizzes]
    learning_pace = ml_engine.compute_learning_pace(quiz_dicts, assessment_dicts)

    # 6. Performance Trends (Timeline)
    trend_points = []
    for a in assessments:
        subj = db.query(Subject).filter(Subject.id == a.subject_id).first()
        trend_points.append({
            "date": a.completed_at.strftime("%b %d, %H:%M"),
            "score": a.percentage,
            "activity_name": f"Assessment: {subj.name if subj else 'Diagnostic'}",
            "activity_type": "Assessment"
        })
    for q in quizzes:
        quiz_obj = q.quiz
        trend_points.append({
            "date": q.completed_at.strftime("%b %d, %H:%M"),
            "score": q.percentage,
            "activity_name": f"Quiz: {quiz_obj.title if quiz_obj else 'Topic Quiz'}",
            "activity_type": "Quiz"
        })

    # Sort trend by date
    trend_points = trend_points[-10:]  # Last 10 points

    # 7. AI Generated Natural Language Insights
    insights = []
    strong_topics = strengths_weaknesses["strong_topics"]
    weak_topics = strengths_weaknesses["weak_topics"]

    if strong_topics and weak_topics:
        insights.append(
            f"Your {strong_topics[0]['topic_name']} is strong ({strong_topics[0]['score']}%), but {weak_topics[0]['topic_name']} ({weak_topics[0]['score']}%) requires targeted practice."
        )
    elif strong_topics:
        insights.append(
            f"Excellent foundation in {strong_topics[0]['topic_name']}. You are primed to advance to higher-difficulty algorithmic challenges."
        )
    elif weak_topics:
        insights.append(
            f"AI detected learning friction in {weak_topics[0]['topic_name']}. Reviewing foundational notes before the next quiz will reinforce retention."
        )
    else:
        insights.append(
            "Complete your initial subject diagnostic assessment to generate precision AI strength & weakness insights."
        )

    if learning_pace["pace"] == "Fast":
        insights.append("Your response latency demonstrates high problem-solving agility. Difficulty adapted upwards to maintain cognitive flow.")
    elif learning_pace["pace"] == "Needs Assistance":
        insights.append("Slower pacing detected in recent attempts. Interactive micro-lessons have been prioritized in your learning path.")
    else:
        insights.append("Steady learning cadence observed. Maintaining consistent daily practice will unlock key milestone badges.")

    insights.append(
        f"Overall proficiency classified as {knowledge_level_data['level']} level with {int(knowledge_level_data['confidence_score']*100)}% predictive confidence."
    )

    return {
        "student_id": student_id,
        "student_name": student.name if student else "Student",
        "target_subject": target_subject_name,
        "overall_knowledge_level": knowledge_level_data,
        "strengths_and_weaknesses": strengths_weaknesses,
        "learning_pace": learning_pace,
        "performance_trends": trend_points,
        "ai_generated_insights": insights,
        "recommended_difficulty": ml_engine.adapt_difficulty(avg_score),
        "total_mastered_topics": completed_topics_count,
        "total_topics_tracked": len(topic_perf_list)
    }
