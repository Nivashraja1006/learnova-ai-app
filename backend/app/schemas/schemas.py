from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    education_level: Optional[str] = "Undergraduate"
    preferred_learning_style: Optional[str] = "Visual & Practical"
    target_subject: Optional[str] = "Python Programming"
    learning_goal: Optional[str] = "Master Core Concepts and Build Projects"
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    education_level: Optional[str]
    preferred_learning_style: Optional[str]
    target_subject: Optional[str]
    learning_goal: Optional[str]
    streak_days: int
    last_active_date: Optional[datetime]
    knowledge_level: str
    total_study_minutes: int

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    target_subject: Optional[str] = None
    learning_goal: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime
    profile: Optional[StudentProfileOut] = None

    class Config:
        from_attributes = True

# ----------------- Subject & Topic Schemas -----------------
class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    difficulty: str = "Beginner"
    order_index: int = 1
    prerequisites: Optional[str] = None

class TopicCreate(TopicBase):
    subject_id: int

class TopicOut(TopicBase):
    id: int
    subject_id: int
    question_count: Optional[int] = 0
    material_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "BookOpen"
    code: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    topics: List[TopicOut] = []

    class Config:
        from_attributes = True

# ----------------- Question Schemas -----------------
class QuestionBase(BaseModel):
    topic_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    difficulty: str = "Beginner"
    explanation: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(BaseModel):
    id: int
    topic_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    difficulty: str
    # correct_answer and explanation hidden for student testing

    class Config:
        from_attributes = True

class QuestionAdminOut(QuestionBase):
    id: int
    topic_name: Optional[str] = None
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Assessment Schemas -----------------
class AssessmentAnswerSubmit(BaseModel):
    question_id: int
    selected_answer: str

class AssessmentSubmit(BaseModel):
    subject_id: int
    answers: List[AssessmentAnswerSubmit]
    time_taken_seconds: Optional[int] = 0

class AnswerBreakdown(BaseModel):
    question_id: int
    question_text: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str]
    topic_name: str

class TopicPerformanceItem(BaseModel):
    topic_id: int
    topic_name: str
    correct: int
    total: int
    percentage: float
    mastery_level: str

class AssessmentResultOut(BaseModel):
    id: int
    subject_id: int
    subject_name: str
    score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int
    completed_at: datetime
    topic_breakdown: List[TopicPerformanceItem]
    answers: List[AnswerBreakdown]
    ai_feedback: str

    class Config:
        from_attributes = True

class AssessmentHistoryOut(BaseModel):
    id: int
    subject_id: int
    subject_name: str
    score: int
    total_questions: int
    percentage: float
    completed_at: datetime

# ----------------- Quiz Schemas -----------------
class QuizBase(BaseModel):
    topic_id: int
    title: str
    difficulty: str = "Intermediate"
    time_limit: int = 10

class QuizCreate(QuizBase):
    pass

class QuizOut(QuizBase):
    id: int
    topic_name: Optional[str] = None
    subject_name: Optional[str] = None
    question_count: Optional[int] = 0
    questions: Optional[List[QuestionOut]] = []

    class Config:
        from_attributes = True

class QuizSubmit(BaseModel):
    quiz_id: int
    answers: List[AssessmentAnswerSubmit]
    time_taken_seconds: Optional[int] = 0

class QuizResultOut(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    topic_name: str
    score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int
    completed_at: datetime
    answers: List[AnswerBreakdown]
    recommendation_note: str

# ----------------- Learning Material Schemas -----------------
class LearningMaterialBase(BaseModel):
    topic_id: int
    title: str
    description: Optional[str] = None
    content_type: str = "Notes"
    url: Optional[str] = None
    difficulty: str = "Beginner"
    estimated_minutes: int = 15
    markdown_content: Optional[str] = None

class LearningMaterialCreate(LearningMaterialBase):
    pass

class LearningMaterialOut(LearningMaterialBase):
    id: int
    topic_name: Optional[str] = None
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Recommendation & Learning Path Schemas -----------------
class RecommendationOut(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    subject_name: str
    recommendation_type: str  # "Learn Next", "Practice More", "Revise", "Challenge Yourself", "Recommended Material"
    reason: str
    priority: int
    status: str
    created_at: datetime
    difficulty: Optional[str] = "Beginner"
    material_count: Optional[int] = 0
    quiz_id: Optional[int] = None

    class Config:
        from_attributes = True

class LearningPathStep(BaseModel):
    step_number: int
    topic_id: int
    topic_name: str
    subject_name: str
    difficulty: str
    status: str  # "completed", "recommended", "in_progress", "locked"
    mastery_score: float
    mastery_level: str
    prerequisites: Optional[str] = None
    action_type: str  # "study", "practice", "quiz", "review"
    action_id: Optional[int] = None
    reason: str

class LearningPathOut(BaseModel):
    subject_id: int
    subject_name: str
    target_goal: str
    current_knowledge_level: str
    completion_percentage: float
    steps: List[LearningPathStep]

# ----------------- AI Analysis Schemas -----------------
class KnowledgeLevelAnalysis(BaseModel):
    level: str  # Beginner, Intermediate, Advanced
    confidence_score: float
    summary: str
    ml_cluster: Optional[str] = None

class TopicScoreItem(BaseModel):
    topic_id: int
    topic_name: str
    subject_name: str
    score: float
    mastery_level: str
    attempts: int
    last_attempt: Optional[datetime]

class WeakStrongAnalysis(BaseModel):
    strong_topics: List[TopicScoreItem]
    weak_topics: List[TopicScoreItem]
    developing_topics: List[TopicScoreItem]

class LearningPaceAnalysis(BaseModel):
    pace: str  # Fast, Steady, Needs Assistance
    avg_completion_time_seconds: float
    improvement_rate: float
    total_quizzes_taken: int
    total_assessments_taken: int
    summary: str

class PerformanceTrendPoint(BaseModel):
    date: str
    score: float
    activity_name: str
    activity_type: str

class AIAnalysisOut(BaseModel):
    student_id: int
    student_name: str
    target_subject: str
    overall_knowledge_level: KnowledgeLevelAnalysis
    strengths_and_weaknesses: WeakStrongAnalysis
    learning_pace: LearningPaceAnalysis
    performance_trends: List[PerformanceTrendPoint]
    ai_generated_insights: List[str]
    recommended_difficulty: str
    total_mastered_topics: int
    total_topics_tracked: int

# ----------------- Achievement & Notification Schemas -----------------
class AchievementOut(BaseModel):
    id: int
    name: str
    code: str
    description: str
    icon: str
    badge_color: str
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Admin Analytics Schemas -----------------
class AdminMetricsOut(BaseModel):
    total_students: int
    active_students: int
    total_assessments: int
    total_quizzes: int
    average_platform_score: float
    most_difficult_topic: Optional[str]
    most_popular_subject: Optional[str]
    total_questions: int
    total_materials: int

class AdminSubjectStat(BaseModel):
    subject_name: str
    student_count: int
    avg_score: float
    topic_count: int

class AdminTopicDifficultyStat(BaseModel):
    topic_name: str
    subject_name: str
    avg_score: float
    attempts_count: int
    difficulty: str
