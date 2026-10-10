from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Subject, Topic, Question, LearningMaterial
from backend.app.schemas.schemas import SubjectOut, TopicOut, QuestionOut

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    results = []
    for s in subjects:
        topics_out = []
        for t in s.topics:
            q_count = db.query(Question).filter(Question.topic_id == t.id).count()
            m_count = db.query(LearningMaterial).filter(LearningMaterial.topic_id == t.id).count()
            topics_out.append(TopicOut(
                id=t.id,
                subject_id=t.subject_id,
                name=t.name,
                description=t.description,
                difficulty=t.difficulty,
                order_index=t.order_index,
                prerequisites=t.prerequisites,
                question_count=q_count,
                material_count=m_count
            ))
        results.append(SubjectOut(
            id=s.id,
            name=s.name,
            description=s.description,
            icon=s.icon,
            code=s.code,
            topics=topics_out
        ))
    return results

@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    s = db.query(Subject).filter(Subject.id == subject_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Subject not found")

    topics_out = []
    for t in s.topics:
        q_count = db.query(Question).filter(Question.topic_id == t.id).count()
        m_count = db.query(LearningMaterial).filter(LearningMaterial.topic_id == t.id).count()
        topics_out.append(TopicOut(
            id=t.id,
            subject_id=t.subject_id,
            name=t.name,
            description=t.description,
            difficulty=t.difficulty,
            order_index=t.order_index,
            prerequisites=t.prerequisites,
            question_count=q_count,
            material_count=m_count
        ))

    return SubjectOut(
        id=s.id,
        name=s.name,
        description=s.description,
        icon=s.icon,
        code=s.code,
        topics=topics_out
    )

@router.get("/{subject_id}/topics", response_model=List[TopicOut])
def get_subject_topics(subject_id: int, db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).order_by(Topic.order_index.asc()).all()
    results = []
    for t in topics:
        q_count = db.query(Question).filter(Question.topic_id == t.id).count()
        m_count = db.query(LearningMaterial).filter(LearningMaterial.topic_id == t.id).count()
        results.append(TopicOut(
            id=t.id,
            subject_id=t.subject_id,
            name=t.name,
            description=t.description,
            difficulty=t.difficulty,
            order_index=t.order_index,
            prerequisites=t.prerequisites,
            question_count=q_count,
            material_count=m_count
        ))
    return results

@router.get("/{subject_id}/assessment-questions", response_model=List[QuestionOut])
def get_assessment_questions(subject_id: int, db: Session = Depends(get_db)):
    """
    Selects a balanced set of diagnostic questions across all topics of this subject.
    """
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get topic IDs
    topic_ids = [t.id for t in subject.topics]
    if not topic_ids:
        return []

    # Pick up to 2-3 questions per topic to build a comprehensive 10-15 question diagnostic
    questions = []
    for t_id in topic_ids:
        topic_qs = db.query(Question).filter(Question.topic_id == t_id).limit(2).all()
        questions.extend(topic_qs)

    # Return QuestionOut (answers withheld for testing integrity)
    return [
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
