from backend.app.routers.auth import router as auth_router
from backend.app.routers.students import router as students_router
from backend.app.routers.subjects import router as subjects_router
from backend.app.routers.assessments import router as assessments_router
from backend.app.routers.quizzes import router as quizzes_router
from backend.app.routers.materials import router as materials_router
from backend.app.routers.ai import router as ai_router
from backend.app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "students_router",
    "subjects_router",
    "assessments_router",
    "quizzes_router",
    "materials_router",
    "ai_router",
    "admin_router"
]
