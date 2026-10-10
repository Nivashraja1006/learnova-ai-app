from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.models import (
    User,
    StudentProfile,
    Subject,
    Topic,
    Question,
    LearningMaterial,
    Quiz,
    Assessment,
    QuizAttempt,
    StudentTopicPerformance
)
from backend.app.schemas.schemas import (
    AdminMetricsOut,
    SubjectCreate,
    SubjectOut,
    TopicCreate,
    TopicOut,
    QuestionCreate,
    QuestionAdminOut,
    LearningMaterialCreate,
    LearningMaterialOut,
    QuizCreate,
    QuizOut
)
from backend.app.services.auth_service import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"], dependencies=[Depends(get_current_admin)])

@router.get("/metrics", response_model=AdminMetricsOut)
def get_admin_metrics(db: Session = Depends(get_db)):
    total_students = db.query(User).filter(User.role == "student").count()
    active_students = db.query(User).filter(User.role == "student").count()
    total_assessments = db.query(Assessment).count()
    total_quizzes = db.query(QuizAttempt).count()
    
    # Calculate average score across assessments
    avg_score_res = db.query(func.avg(Assessment.percentage)).scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res is not None else 68.5

    # Most difficult topic (topic with lowest avg performance score)
    lowest_topic_perf = db.query(
        Topic.name, func.avg(StudentTopicPerformance.score).label("avg_sc")
    ).join(Topic, StudentTopicPerformance.topic_id == Topic.id)\
     .group_by(Topic.name)\
     .order_by(func.avg(StudentTopicPerformance.score).asc()).first()
    
    most_diff_topic = lowest_topic_perf[0] if lowest_topic_perf else "Recursion & Trees"

    # Most popular subject
    pop_subj = db.query(
        Subject.name, func.count(Assessment.id)
    ).join(Subject, Assessment.subject_id == Subject.id)\
     .group_by(Subject.name)\
     .order_by(func.count(Assessment.id).desc()).first()

    most_pop_subject = pop_subj[0] if pop_subj else "Python Programming"

    total_questions = db.query(Question).count()
    total_materials = db.query(LearningMaterial).count()

    return AdminMetricsOut(
        total_students=total_students,
        active_students=active_students,
        total_assessments=total_assessments,
        total_quizzes=total_quizzes,
        average_platform_score=avg_score,
        most_difficult_topic=most_diff_topic,
        most_popular_subject=most_pop_subject,
        total_questions=total_questions,
        total_materials=total_materials
    )

# ----------------- Students Management -----------------
@router.get("/students")
def list_students(db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    results = []
    for s in students:
        p = s.profile
        ass_count = len(s.assessments)
        quiz_count = len(s.quiz_attempts)
        avg_score = round(sum(a.percentage for a in s.assessments) / max(1, ass_count), 1) if ass_count else 0.0

        results.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "created_at": s.created_at,
            "education_level": p.education_level if p else "Undergraduate",
            "target_subject": p.target_subject if p else "Python Programming",
            "knowledge_level": p.knowledge_level if p else "Beginner",
            "streak_days": p.streak_days if p else 1,
            "assessments_count": ass_count,
            "quizzes_count": quiz_count,
            "average_score": avg_score
        })
    return results

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"status": "success", "message": "Student account removed"}

# ----------------- Subject CRUD -----------------
@router.post("/subjects", response_model=SubjectOut)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Subject).filter(Subject.name.ilike(data.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists")

    subj = Subject(
        name=data.name.strip(),
        description=data.description,
        icon=data.icon or "BookOpen",
        code=data.code
    )
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return SubjectOut(
        id=subj.id,
        name=subj.name,
        description=subj.description,
        icon=subj.icon,
        code=subj.code,
        topics=[]
    )

@router.put("/subjects/{subject_id}")
def update_subject(subject_id: int, data: SubjectCreate, db: Session = Depends(get_db)):
    subj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    subj.name = data.name.strip()
    subj.description = data.description
    subj.icon = data.icon
    subj.code = data.code
    db.commit()
    return {"status": "success"}

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subj)
    db.commit()
    return {"status": "success"}

# ----------------- Topic CRUD -----------------
@router.post("/topics", response_model=TopicOut)
def create_topic(data: TopicCreate, db: Session = Depends(get_db)):
    subj = db.query(Subject).filter(Subject.id == data.subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")

    topic = Topic(
        subject_id=data.subject_id,
        name=data.name.strip(),
        description=data.description,
        difficulty=data.difficulty,
        order_index=data.order_index,
        prerequisites=data.prerequisites
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)

    return TopicOut(
        id=topic.id,
        subject_id=topic.subject_id,
        name=topic.name,
        description=topic.description,
        difficulty=topic.difficulty,
        order_index=topic.order_index,
        prerequisites=topic.prerequisites,
        question_count=0,
        material_count=0
    )

@router.put("/topics/{topic_id}")
def update_topic(topic_id: int, data: TopicCreate, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic.subject_id = data.subject_id
    topic.name = data.name.strip()
    topic.description = data.description
    topic.difficulty = data.difficulty
    topic.order_index = data.order_index
    topic.prerequisites = data.prerequisites
    db.commit()
    return {"status": "success"}

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return {"status": "success"}

# ----------------- Question CRUD -----------------
@router.get("/questions", response_model=List[QuestionAdminOut])
def list_admin_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    results = []
    for q in questions:
        topic = q.topic
        subject = topic.subject if topic else None
        results.append(QuestionAdminOut(
            id=q.id,
            topic_id=q.topic_id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_answer=q.correct_answer,
            difficulty=q.difficulty,
            explanation=q.explanation,
            topic_name=topic.name if topic else "Topic",
            subject_name=subject.name if subject else "General"
        ))
    return results

@router.post("/questions", response_model=QuestionAdminOut)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    q = Question(
        topic_id=data.topic_id,
        question_text=data.question_text.strip(),
        option_a=data.option_a.strip(),
        option_b=data.option_b.strip(),
        option_c=data.option_c.strip(),
        option_d=data.option_d.strip(),
        correct_answer=data.correct_answer.strip().upper(),
        difficulty=data.difficulty,
        explanation=data.explanation
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    return QuestionAdminOut(
        id=q.id,
        topic_id=q.topic_id,
        question_text=q.question_text,
        option_a=q.option_a,
        option_b=q.option_b,
        option_c=q.option_c,
        option_d=q.option_d,
        correct_answer=q.correct_answer,
        difficulty=q.difficulty,
        explanation=q.explanation,
        topic_name=topic.name,
        subject_name=topic.subject.name if topic.subject else "General"
    )

@router.put("/questions/{question_id}")
def update_question(question_id: int, data: QuestionCreate, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.topic_id = data.topic_id
    q.question_text = data.question_text
    q.option_a = data.option_a
    q.option_b = data.option_b
    q.option_c = data.option_c
    q.option_d = data.option_d
    q.correct_answer = data.correct_answer.upper()
    q.difficulty = data.difficulty
    q.explanation = data.explanation
    db.commit()
    return {"status": "success"}

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"status": "success"}

# ----------------- Learning Material CRUD -----------------
@router.post("/materials", response_model=LearningMaterialOut)
def create_material(data: LearningMaterialCreate, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    m = LearningMaterial(
        topic_id=data.topic_id,
        title=data.title.strip(),
        description=data.description,
        content_type=data.content_type,
        url=data.url,
        difficulty=data.difficulty,
        estimated_minutes=data.estimated_minutes,
        markdown_content=data.markdown_content
    )
    db.add(m)
    db.commit()
    db.refresh(m)

    return LearningMaterialOut(
        id=m.id,
        topic_id=m.topic_id,
        title=m.title,
        description=m.description,
        content_type=m.content_type,
        url=m.url,
        difficulty=m.difficulty,
        estimated_minutes=m.estimated_minutes,
        markdown_content=m.markdown_content,
        topic_name=topic.name,
        subject_name=topic.subject.name if topic.subject else "General"
    )

@router.put("/materials/{material_id}")
def update_material(material_id: int, data: LearningMaterialCreate, db: Session = Depends(get_db)):
    m = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")
    m.topic_id = data.topic_id
    m.title = data.title
    m.description = data.description
    m.content_type = data.content_type
    m.url = data.url
    m.difficulty = data.difficulty
    m.estimated_minutes = data.estimated_minutes
    m.markdown_content = data.markdown_content
    db.commit()
    return {"status": "success"}

@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    m = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(m)
    db.commit()
    return {"status": "success"}

# ----------------- Quiz CRUD -----------------
@router.post("/quizzes", response_model=QuizOut)
def create_quiz(data: QuizCreate, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    quiz = Quiz(
        topic_id=data.topic_id,
        title=data.title.strip(),
        difficulty=data.difficulty,
        time_limit=data.time_limit
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return QuizOut(
        id=quiz.id,
        topic_id=quiz.topic_id,
        title=quiz.title,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        topic_name=topic.name,
        subject_name=topic.subject.name if topic.subject else "General",
        question_count=0
    )

@router.put("/quizzes/{quiz_id}")
def update_quiz(quiz_id: int, data: QuizCreate, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.topic_id = data.topic_id
    quiz.title = data.title
    quiz.difficulty = data.difficulty
    quiz.time_limit = data.time_limit
    db.commit()
    return {"status": "success"}

@router.delete("/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"status": "success"}
