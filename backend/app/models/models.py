from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # "student" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    topic_performances = relationship("StudentTopicPerformance", back_populates="student", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="student", cascade="all, delete-orphan")
    achievements = relationship("StudentAchievement", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="student", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    education_level = Column(String(100), default="Undergraduate")
    preferred_learning_style = Column(String(100), default="Visual & Practical")
    target_subject = Column(String(100), default="Python Programming")
    learning_goal = Column(String(255), default="Master Core Concepts and Build Projects")
    streak_days = Column(Integer, default=1)
    last_active_date = Column(DateTime, default=datetime.utcnow)
    knowledge_level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    total_study_minutes = Column(Integer, default=45)

    user = relationship("User", back_populates="profile")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="BookOpen")
    code = Column(String(20), nullable=True)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(30), default="Beginner")  # Beginner, Intermediate, Advanced
    order_index = Column(Integer, default=1)
    prerequisites = Column(String(255), nullable=True)  # Comma-separated topic names or IDs

    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    materials = relationship("LearningMaterial", back_populates="topic", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="topic", cascade="all, delete-orphan")
    performances = relationship("StudentTopicPerformance", back_populates="topic", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="topic", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_answer = Column(String(5), nullable=False)  # A, B, C, D
    difficulty = Column(String(30), default="Beginner")  # Beginner, Intermediate, Advanced
    explanation = Column(Text, nullable=True)

    topic = relationship("Topic", back_populates="questions")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="assessments")
    subject = relationship("Subject", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_answer = Column(String(5), nullable=False)
    is_correct = Column(Boolean, nullable=False)

    assessment = relationship("Assessment", back_populates="answers")
    question = relationship("Question")

class LearningMaterial(Base):
    __tablename__ = "learning_materials"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(String(50), default="Notes")  # Notes, Video, PDF, Practice, Interactive
    url = Column(String(255), nullable=True)
    difficulty = Column(String(30), default="Beginner")
    estimated_minutes = Column(Integer, default=15)
    markdown_content = Column(Text, nullable=True)

    topic = relationship("Topic", back_populates="materials")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    difficulty = Column(String(30), default="Intermediate")
    time_limit = Column(Integer, default=10)  # in minutes

    topic = relationship("Topic", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("QuizAttemptAnswer", back_populates="quiz_attempt", cascade="all, delete-orphan")

class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"

    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_answer = Column(String(5), nullable=False)
    is_correct = Column(Boolean, nullable=False)

    quiz_attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question")

class StudentTopicPerformance(Base):
    __tablename__ = "student_topic_performance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, default=0.0)  # Mastery percentage (0-100)
    mastery_level = Column(String(30), default="Novice")  # Novice, Developing, Proficient, Mastered
    attempts = Column(Integer, default=0)
    last_attempt = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="topic_performances")
    topic = relationship("Topic", back_populates="performances")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # "Learn Next", "Practice More", "Revise", "Challenge Yourself", "Recommended Material"
    reason = Column(Text, nullable=False)
    priority = Column(Integer, default=1)  # 1 (Highest) to 5
    status = Column(String(20), default="active")  # active, completed, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="recommendations")
    topic = relationship("Topic", back_populates="recommendations")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="Award")
    badge_color = Column(String(50), default="amber")
    criteria_type = Column(String(50), nullable=False)  # "assessment_count", "quiz_count", "streak", "mastery_count", "score_threshold"
    criteria_value = Column(Integer, default=1)

    student_achievements = relationship("StudentAchievement", back_populates="achievement", cascade="all, delete-orphan")

class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="student_achievements")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # success, warning, milestone, recommendation, reminder
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="notifications")
