from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import User, StudentProfile
from backend.app.schemas.schemas import UserRegister, UserLogin, Token, UserOut
from backend.app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user
    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hash_password(user_data.password),
        role=user_data.role if user_data.role in ["student", "admin"] else "student",
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.flush()

    # Create profile
    profile = StudentProfile(
        user_id=new_user.id,
        education_level=user_data.education_level or "Undergraduate",
        preferred_learning_style=user_data.preferred_learning_style or "Visual & Practical",
        target_subject=user_data.target_subject or "Python Programming",
        learning_goal=user_data.learning_goal or "Master Core Concepts and Build Projects",
        streak_days=1,
        knowledge_level="Beginner",
        last_active_date=datetime.utcnow()
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token({"user_id": new_user.id, "role": new_user.role, "email": new_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "target_subject": profile.target_subject,
            "knowledge_level": profile.knowledge_level
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    profile = user.profile
    token = create_access_token({"user_id": user.id, "role": user.role, "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "target_subject": profile.target_subject if profile else "Python Programming",
            "knowledge_level": profile.knowledge_level if profile else "Beginner"
        }
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
