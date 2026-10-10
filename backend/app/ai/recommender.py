from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.app.ai.ml_engine import ml_engine

class LearnovaRecommender:
    """
    Intelligent Hybrid Recommendation Engine for Learnova AI.
    Calculates dynamic recommendations based on:
    - Topic scores & mastery levels
    - Weakness detection & error patterns
    - Curriculum prerequisite dependency graphs
    - Forgetting curves / revision recency
    - Adaptive difficulty calibration
    """

    def generate_recommendations(
        self,
        student_id: int,
        topics: List[Dict[str, Any]],
        topic_performances: List[Dict[str, Any]],
        materials: List[Dict[str, Any]],
        quizzes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        perf_map = {p["topic_id"]: p for p in topic_performances}
        recommendations = []

        # Sort topics by order_index
        sorted_topics = sorted(topics, key=lambda t: t.get("order_index", 0))

        # 1. Detect Weak Topics -> "Practice More"
        for t in sorted_topics:
            t_id = t["id"]
            p = perf_map.get(t_id)
            if p and p.get("attempts", 0) > 0 and p.get("score", 0) < 60.0:
                score = round(p.get("score", 0), 1)
                quiz = next((q for q in quizzes if q.get("topic_id") == t_id), None)
                rec = {
                    "student_id": student_id,
                    "topic_id": t_id,
                    "topic_name": t["name"],
                    "subject_name": t.get("subject_name", "General"),
                    "recommendation_type": "Practice More",
                    "reason": f"Recommended because your recent score in {t['name']} is {score}%. Additional practice will solidify your fundamentals.",
                    "priority": 1,
                    "status": "active",
                    "difficulty": ml_engine.adapt_difficulty(score),
                    "quiz_id": quiz["id"] if quiz else None,
                    "created_at": datetime.utcnow()
                }
                recommendations.append(rec)

        # 2. Sequential Progression -> "Learn Next"
        for t in sorted_topics:
            t_id = t["id"]
            p = perf_map.get(t_id)
            score = p.get("score", 0) if p else 0
            attempts = p.get("attempts", 0) if p else 0

            # If not yet attempted or not yet mastered (score < 75%)
            if attempts == 0 or (score >= 60 and score < 75):
                # Check prerequisites
                prereqs = t.get("prerequisites")
                prereq_satisfied = True
                if prereqs:
                    prereq_list = [pr.strip() for pr in prereqs.split(",") if pr.strip()]
                    for pr_name in prereq_list:
                        # Find prerequisite topic
                        pr_topic = next((top for top in topics if top["name"].lower() == pr_name.lower()), None)
                        if pr_topic:
                            pr_perf = perf_map.get(pr_topic["id"])
                            if not pr_perf or pr_perf.get("score", 0) < 65:
                                prereq_satisfied = False
                                break

                if prereq_satisfied:
                    quiz = next((q for q in quizzes if q.get("topic_id") == t_id), None)
                    reason_msg = f"Next optimal step in curriculum after prerequisite verification. Learn {t['name']} to advance your pathway."
                    if attempts > 0:
                        reason_msg = f"You are progressing well in {t['name']} ({score}%). Complete key exercises to achieve full mastery."
                    
                    recommendations.append({
                        "student_id": student_id,
                        "topic_id": t_id,
                        "topic_name": t["name"],
                        "subject_name": t.get("subject_name", "General"),
                        "recommendation_type": "Learn Next",
                        "reason": reason_msg,
                        "priority": 2,
                        "status": "active",
                        "difficulty": t.get("difficulty", "Beginner"),
                        "quiz_id": quiz["id"] if quiz else None,
                        "created_at": datetime.utcnow()
                    })
                    break  # Pick top priority Learn Next

        # 3. High Performance Mastery -> "Challenge Yourself"
        for t in sorted_topics:
            t_id = t["id"]
            p = perf_map.get(t_id)
            if p and p.get("attempts", 0) > 0 and p.get("score", 0) >= 80.0:
                quiz = next((q for q in quizzes if q.get("topic_id") == t_id and q.get("difficulty") == "Advanced"), None)
                if not quiz:
                    quiz = next((q for q in quizzes if q.get("topic_id") == t_id), None)
                recommendations.append({
                    "student_id": student_id,
                    "topic_id": t_id,
                    "topic_name": t["name"],
                    "subject_name": t.get("subject_name", "General"),
                    "recommendation_type": "Challenge Yourself",
                    "reason": f"Outstanding mastery demonstrated ({round(p.get('score', 0), 1)}%). Challenge yourself with complex edge-case problem solving.",
                    "priority": 3,
                    "status": "active",
                    "difficulty": "Advanced",
                    "quiz_id": quiz["id"] if quiz else None,
                    "created_at": datetime.utcnow()
                })
                break

        # 4. Spaced Repetition -> "Revise"
        one_week_ago = datetime.utcnow() - timedelta(days=5)
        for t in sorted_topics:
            t_id = t["id"]
            p = perf_map.get(t_id)
            if p and p.get("attempts", 0) > 0:
                last_att = p.get("last_attempt")
                score = p.get("score", 0)
                if (isinstance(last_att, datetime) and last_att < one_week_ago) or (55.0 <= score <= 70.0):
                    recommendations.append({
                        "student_id": student_id,
                        "topic_id": t_id,
                        "topic_name": t["name"],
                        "subject_name": t.get("subject_name", "General"),
                        "recommendation_type": "Revise",
                        "reason": f"Spaced repetition alert: Refresh concepts in {t['name']} to prevent knowledge decay.",
                        "priority": 4,
                        "status": "active",
                        "difficulty": ml_engine.adapt_difficulty(score),
                        "quiz_id": None,
                        "created_at": datetime.utcnow()
                    })
                    break

        # Fallback if recommendations are empty (e.g., brand new student before any assessment)
        if not recommendations and sorted_topics:
            first_topic = sorted_topics[0]
            recommendations.append({
                "student_id": student_id,
                "topic_id": first_topic["id"],
                "topic_name": first_topic["name"],
                "subject_name": first_topic.get("subject_name", "General"),
                "recommendation_type": "Learn Next",
                "reason": f"Welcome to Learnova AI! Start with foundational {first_topic['name']} to initialize your diagnostic learning path.",
                "priority": 1,
                "status": "active",
                "difficulty": "Beginner",
                "quiz_id": None,
                "created_at": datetime.utcnow()
            })

        return recommendations

# Global recommender singleton
recommender = LearnovaRecommender()
