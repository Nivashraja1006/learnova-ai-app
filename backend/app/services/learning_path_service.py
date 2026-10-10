from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import (
    Topic,
    Subject,
    StudentTopicPerformance,
    StudentProfile,
    LearningMaterial,
    Quiz
)
from backend.app.ai.ml_engine import ml_engine

def generate_personalized_learning_path(
    db: Session,
    student_id: int,
    subject_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Constructs a dynamically adaptive learning pathway.
    Steps unlock automatically upon prerequisite mastery,
    re-orienting the sequence based on live performance data.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()

    # Determine which subject to target
    subject = None
    if subject_id:
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
    elif profile and profile.target_subject:
        subject = db.query(Subject).filter(Subject.name == profile.target_subject).first()

    if not subject:
        subject = db.query(Subject).first()

    if not subject:
        return {
            "subject_id": 0,
            "subject_name": "No Subject Found",
            "target_goal": "Configure topics in admin panel",
            "current_knowledge_level": "Beginner",
            "completion_percentage": 0.0,
            "steps": []
        }

    # Fetch topics for this subject ordered by sequence
    topics = db.query(Topic).filter(Topic.subject_id == subject.id).order_by(Topic.order_index.asc()).all()

    # Fetch student performances for this student
    perfs = db.query(StudentTopicPerformance).filter(
        StudentTopicPerformance.student_id == student_id
    ).all()
    perf_map = {p.topic_id: p for p in perfs}

    steps = []
    completed_steps_count = 0
    found_first_recommended = False

    for idx, topic in enumerate(topics):
        perf = perf_map.get(topic.id)
        score = perf.score if perf else 0.0
        attempts = perf.attempts if perf else 0
        mastery_level = perf.mastery_level if perf else "Novice"

        # Check prerequisites
        prereq_satisfied = True
        if topic.prerequisites:
            prereq_names = [p.strip().lower() for p in topic.prerequisites.split(",") if p.strip()]
            for p_name in prereq_names:
                # Find topic by name
                pr_top = next((t for t in topics if t.name.lower() == p_name), None)
                if pr_top:
                    pr_perf = perf_map.get(pr_top.id)
                    if not pr_perf or pr_perf.score < 65.0:
                        prereq_satisfied = False
                        break
        elif idx > 0:
            # If no explicit prereqs, check if previous topic has at least been attempted
            prev_perf = perf_map.get(topics[idx - 1].id)
            if not prev_perf or prev_perf.score < 50.0:
                prereq_satisfied = False

        # Status assignment
        if score >= 75.0:
            status = "completed"
            completed_steps_count += 1
            reason = f"Mastered with {score:.1f}% proficiency. Concept solidified."
        elif not prereq_satisfied:
            status = "locked"
            reason = f"Locked until prerequisite concepts are mastered (Requires: {topic.prerequisites or topics[idx-1].name if idx > 0 else 'Initial Assessment'})."
        else:
            if not found_first_recommended:
                status = "recommended"
                found_first_recommended = True
                if attempts > 0:
                    reason = f"Currently in progress ({score:.1f}%). Focus on weak areas to reach 75% mastery."
                else:
                    reason = "Prerequisites satisfied. AI recommends beginning this module next."
            else:
                status = "in_progress" if attempts > 0 else "upcoming"
                reason = "Unlocked module ready for study after current priority."

        # Fetch action details (material or quiz)
        material = db.query(LearningMaterial).filter(LearningMaterial.topic_id == topic.id).first()
        quiz = db.query(Quiz).filter(Quiz.topic_id == topic.id).first()

        if status == "completed":
            action_type = "review"
            action_id = quiz.id if quiz else (material.id if material else None)
        elif score > 0 and score < 75.0:
            action_type = "practice"
            action_id = quiz.id if quiz else (material.id if material else None)
        else:
            action_type = "study"
            action_id = material.id if material else (quiz.id if quiz else None)

        steps.append({
            "step_number": idx + 1,
            "topic_id": topic.id,
            "topic_name": topic.name,
            "subject_name": subject.name,
            "difficulty": ml_engine.adapt_difficulty(score) if attempts > 0 else topic.difficulty,
            "status": status,
            "mastery_score": score,
            "mastery_level": mastery_level,
            "prerequisites": topic.prerequisites,
            "action_type": action_type,
            "action_id": action_id,
            "reason": reason
        })

    completion_pct = round((completed_steps_count / max(1, len(topics))) * 100, 1)

    return {
        "subject_id": subject.id,
        "subject_name": subject.name,
        "target_goal": profile.learning_goal if profile else "Master core concepts",
        "current_knowledge_level": profile.knowledge_level if profile else "Beginner",
        "completion_percentage": completion_pct,
        "steps": steps
    }
