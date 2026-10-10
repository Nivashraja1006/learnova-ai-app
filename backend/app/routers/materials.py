from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import LearningMaterial, Topic, Subject
from backend.app.schemas.schemas import LearningMaterialOut

router = APIRouter(prefix="/api/materials", tags=["Learning Materials"])

@router.get("", response_model=List[LearningMaterialOut])
def list_materials(
    subject_id: Optional[int] = None,
    topic_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LearningMaterial).join(Topic, LearningMaterial.topic_id == Topic.id)

    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    if topic_id:
        query = query.filter(LearningMaterial.topic_id == topic_id)
    if difficulty:
        query = query.filter(LearningMaterial.difficulty == difficulty)
    if content_type:
        query = query.filter(LearningMaterial.content_type == content_type)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (LearningMaterial.title.ilike(search_fmt)) |
            (LearningMaterial.description.ilike(search_fmt))
        )

    materials = query.all()
    results = []
    for m in materials:
        topic = m.topic
        subject = topic.subject if topic else None
        results.append(LearningMaterialOut(
            id=m.id,
            topic_id=m.topic_id,
            title=m.title,
            description=m.description,
            content_type=m.content_type,
            url=m.url,
            difficulty=m.difficulty,
            estimated_minutes=m.estimated_minutes,
            markdown_content=m.markdown_content,
            topic_name=topic.name if topic else "Topic",
            subject_name=subject.name if subject else "General"
        ))
    return results

@router.get("/{material_id}", response_model=LearningMaterialOut)
def get_material(material_id: int, db: Session = Depends(get_db)):
    m = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")

    topic = m.topic
    subject = topic.subject if topic else None

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
        topic_name=topic.name if topic else "Topic",
        subject_name=subject.name if subject else "General"
    )
