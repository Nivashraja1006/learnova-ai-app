import os
import sys

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.app.main import app

def run_e2e_tests():
    print("=" * 60)
    print("LEARNOVA AI - END-TO-END AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health check operational:", res.json())

    # 2. Subjects check
    res = client.get("/api/subjects")
    assert res.status_code == 200, f"Subjects endpoint failed: {res.text}"
    subjects = res.json()
    assert len(subjects) >= 6, f"Expected at least 6 subjects, got {len(subjects)}"
    print(f"[PASS] Subjects retrieved: {len(subjects)} subjects loaded with topics")

    # 3. Demo Student Login
    login_res = client.post("/api/auth/login", json={
        "email": "student@learnova.ai",
        "password": "Student@123"
    })
    assert login_res.status_code == 200, f"Student login failed: {login_res.text}"
    student_token = login_res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[PASS] Demo Student authenticated successfully")

    # 4. Student Profile
    profile_res = client.get("/api/students/profile", headers=student_headers)
    assert profile_res.status_code == 200
    print("[PASS] Student Profile retrieved:", profile_res.json()["target_subject"])

    # 5. Diagnostic Assessment Questions
    first_subject_id = subjects[0]["id"]
    q_res = client.get(f"/api/subjects/{first_subject_id}/assessment-questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0, "No diagnostic questions found"
    print(f"[PASS] Diagnostic questions fetched: {len(questions)} items for {subjects[0]['name']}")

    # 6. Submit Assessment
    answers = [
        {"question_id": q["id"], "selected_answer": "B"}
        for q in questions
    ]
    sub_res = client.post("/api/assessments/submit", headers=student_headers, json={
        "subject_id": first_subject_id,
        "answers": answers,
        "time_taken_seconds": 180
    })
    assert sub_res.status_code == 200, f"Assessment submission failed: {sub_res.text}"
    ass_result = sub_res.json()
    print(f"[PASS] Assessment submitted & scored: {ass_result['score']}/{ass_result['total_questions']} ({ass_result['percentage']}%)")
    print(f"  AI Feedback: {ass_result['ai_feedback']}")

    # 7. AI Student Analysis
    ai_res = client.get("/api/ai/analysis", headers=student_headers)
    assert ai_res.status_code == 200, f"AI analysis failed: {ai_res.text}"
    ai_data = ai_res.json()
    print("[PASS] AI Student Analysis completed:")
    print(f"  - Classified Knowledge Level: {ai_data['overall_knowledge_level']['level']} ({ai_data['overall_knowledge_level']['confidence_score']})")
    print(f"  - Cognitive Pace: {ai_data['learning_pace']['pace']}")
    print(f"  - Strong Topics: {len(ai_data['strengths_and_weaknesses']['strong_topics'])}")
    print(f"  - Weak Topics: {len(ai_data['strengths_and_weaknesses']['weak_topics'])}")
    print(f"  - AI Insights: {ai_data['ai_generated_insights'][0]}")

    # 8. AI Recommendations
    rec_res = client.get("/api/ai/recommendations", headers=student_headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0, "No recommendations generated"
    print(f"[PASS] AI Recommendations generated: {len(recs)} active recommendations")
    for r in recs[:2]:
        print(f"  [{r['recommendation_type']}] {r['topic_name']}: {r['reason']}")

    # 9. Dynamic Learning Path
    path_res = client.get(f"/api/ai/learning-path?subject_id={first_subject_id}", headers=student_headers)
    assert path_res.status_code == 200
    path = path_res.json()
    print(f"[PASS] Personalized Learning Path generated: {len(path['steps'])} sequenced steps ({path['completion_percentage']}% completed)")

    # 10. Quizzes & Quiz Submission
    quiz_res = client.get("/api/quizzes", headers=student_headers)
    assert quiz_res.status_code == 200
    quizzes = quiz_res.json()
    assert len(quizzes) > 0, "No quizzes returned"
    first_quiz = quizzes[0]
    
    # Fetch quiz with questions
    quiz_detail_res = client.get(f"/api/quizzes/{first_quiz['id']}", headers=student_headers)
    quiz_detail = quiz_detail_res.json()
    quiz_answers = [
        {"question_id": q["id"], "selected_answer": "B"}
        for q in quiz_detail["questions"]
    ]
    quiz_sub_res = client.post(f"/api/quizzes/{first_quiz['id']}/submit", headers=student_headers, json={
        "quiz_id": first_quiz["id"],
        "answers": quiz_answers,
        "time_taken_seconds": 90
    })
    assert quiz_sub_res.status_code == 200
    quiz_sub_data = quiz_sub_res.json()
    print(f"[PASS] Quiz attempt scored: {quiz_sub_data['percentage']}% in '{quiz_sub_data['quiz_title']}'")

    # 11. Learning Materials
    mat_res = client.get("/api/materials", headers=student_headers)
    assert mat_res.status_code == 200
    materials = mat_res.json()
    assert len(materials) >= 10, "Materials count insufficient"
    print(f"[PASS] Learning materials repository verified: {len(materials)} materials available")

    # 12. Student Achievements
    ach_res = client.get("/api/students/achievements", headers=student_headers)
    assert ach_res.status_code == 200
    achs = ach_res.json()
    unlocked = [a["name"] for a in achs if a["is_unlocked"]]
    print(f"[PASS] Gamification Badges verified: {len(unlocked)}/{len(achs)} unlocked ({', '.join(unlocked)})")

    # 13. Admin Login & Metrics
    admin_login_res = client.post("/api/auth/login", json={
        "email": "admin@learnova.ai",
        "password": "Admin@123"
    })
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Demo Admin authenticated successfully")

    admin_metrics_res = client.get("/api/admin/metrics", headers=admin_headers)
    assert admin_metrics_res.status_code == 200
    metrics = admin_metrics_res.json()
    print("[PASS] Admin Institutional Metrics verified:")
    print(f"  - Total Students: {metrics['total_students']}")
    print(f"  - Platform Average: {metrics['average_platform_score']}%")
    print(f"  - Total MCQs in Bank: {metrics['total_questions']}")
    print(f"  - Most Difficult Concept: {metrics['most_difficult_topic']}")

    # 14. Admin CRUD Operations verification
    # Add new subject
    new_subj_res = client.post("/api/admin/subjects", headers=admin_headers, json={
        "name": "Cloud Computing & DevOps",
        "code": "CLOUD101",
        "description": "Containerization, Kubernetes, CI/CD, and Serverless computing."
    })
    assert new_subj_res.status_code == 200
    created_subj = new_subj_res.json()
    print("[PASS] Admin Create Subject: Succeeded (ID:", created_subj["id"], ")")

    # Add topic under new subject
    new_top_res = client.post("/api/admin/topics", headers=admin_headers, json={
        "subject_id": created_subj["id"],
        "name": "Docker & Container Architecture",
        "difficulty": "Beginner",
        "order_index": 1,
        "description": "Images, Dockerfiles, volumes, and bridge networks."
    })
    assert new_top_res.status_code == 200
    created_top = new_top_res.json()
    print("[PASS] Admin Create Topic: Succeeded (ID:", created_top["id"], ")")

    # Add question under new topic
    new_q_res = client.post("/api/admin/questions", headers=admin_headers, json={
        "topic_id": created_top["id"],
        "question_text": "What is the primary difference between a Docker container and a traditional Virtual Machine?",
        "option_a": "Containers share host kernel whereas VMs run a complete guest OS",
        "option_b": "VMs use less disk space than containers",
        "option_c": "Containers require dedicated hypervisor type-1",
        "option_d": "Containers cannot be networked",
        "correct_answer": "A",
        "difficulty": "Beginner",
        "explanation": "Containers share the host operating system kernel and isolate user space."
    })
    assert new_q_res.status_code == 200
    created_q = new_q_res.json()
    print("[PASS] Admin Create MCQ: Succeeded (ID:", created_q["id"], ")")

    # Clean up test subject (cascades to topic and question)
    del_res = client.delete(f"/api/admin/subjects/{created_subj['id']}", headers=admin_headers)
    assert del_res.status_code == 200
    print("[PASS] Admin Delete Subject: Cleaned up successfully")

    # 15. Student Registration Verification
    import time
    test_email = f"test_student_{int(time.time())}@learnova.ai"
    reg_res = client.post("/api/auth/register", json={
        "name": "Jordan Lee",
        "email": test_email,
        "password": "Password@123",
        "education_level": "Undergraduate",
        "target_subject": "Data Structures",
        "learning_goal": "Ace technical placement rounds"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    print(f"[PASS] New Student Registration: Succeeded for {test_email}")

    print("=" * 60)
    print("ALL 15 END-TO-END TEST CASES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e_tests()
