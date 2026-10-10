import os
from datetime import datetime, timedelta
from backend.app.database import SessionLocal, Base, engine
from backend.app.models.models import (
    User,
    StudentProfile,
    Subject,
    Topic,
    Question,
    LearningMaterial,
    Quiz,
    Achievement,
    StudentAchievement,
    StudentTopicPerformance,
    Assessment,
    AssessmentAnswer,
    QuizAttempt,
    QuizAttemptAnswer,
    Recommendation,
    Notification
)
from backend.app.services.auth_service import hash_password
from backend.app.services.recommendation_service import refresh_student_recommendations

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Subject).count() > 0:
            print("Database already contains data. Skipping initial seeding.")
            return

        print("Seeding Learnova AI database with comprehensive academic data...")

        # 1. Create Achievements
        achievements_data = [
            {
                "code": "first_assessment",
                "name": "First Assessment",
                "description": "Completed your first comprehensive diagnostic assessment.",
                "icon": "Award",
                "badge_color": "emerald",
                "criteria_type": "assessment_count",
                "criteria_value": 1
            },
            {
                "code": "quiz_master",
                "name": "Quiz Master",
                "description": "Completed 3 topic quizzes demonstrating skill mastery.",
                "icon": "Trophy",
                "badge_color": "indigo",
                "criteria_type": "quiz_count",
                "criteria_value": 3
            },
            {
                "code": "streak_7",
                "name": "7-Day Streak",
                "description": "Maintained continuous daily learning focus for 7 days.",
                "icon": "Flame",
                "badge_color": "amber",
                "criteria_type": "streak",
                "criteria_value": 7
            },
            {
                "code": "fast_learner",
                "name": "Fast Learner",
                "description": "Demonstrated swift diagnostic test completion with high accuracy.",
                "icon": "Zap",
                "badge_color": "purple",
                "criteria_type": "speed",
                "criteria_value": 1
            },
            {
                "code": "topic_master",
                "name": "Topic Master",
                "description": "Reached 85%+ mastery in multiple specialized technical modules.",
                "icon": "CheckCircle2",
                "badge_color": "cyan",
                "criteria_type": "mastery_count",
                "criteria_value": 2
            },
            {
                "code": "improvement_champion",
                "name": "Improvement Champion",
                "description": "Boosted topic retention and assessment score by over 15%.",
                "icon": "TrendingUp",
                "badge_color": "rose",
                "criteria_type": "improvement",
                "criteria_value": 15
            }
        ]

        for ach in achievements_data:
            db.add(Achievement(**ach))
        db.commit()

        # 2. Subjects and Topics Data
        subjects_data = [
            {
                "name": "Python Programming",
                "description": "Modern Python from syntax fundamentals to data structures, OOP, and asynchronous programming.",
                "icon": "Terminal",
                "code": "PY101",
                "topics": [
                    {
                        "name": "Python Basics & Syntax",
                        "description": "Variables, standard data types, input/output, and operator precedence.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "Control Flow & Loops",
                        "description": "Conditionals (if-elif-else), while loops, for loops, and comprehension syntax.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "Python Basics & Syntax"
                    },
                    {
                        "name": "Functions & Scope",
                        "description": "Defining functions, *args/**kwargs, lambda functions, and local vs global scope.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "Control Flow & Loops"
                    },
                    {
                        "name": "Exception Handling",
                        "description": "Try-except-finally blocks, custom exception classes, and robust defensive coding.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "Functions & Scope"
                    },
                    {
                        "name": "Object-Oriented Programming",
                        "description": "Classes, inheritance, polymorphism, encapsulation, and magic methods.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "Functions & Scope"
                    },
                    {
                        "name": "Decorators & Generators",
                        "description": "Closures, custom function decorators, memory-efficient generators, and iterators.",
                        "difficulty": "Advanced",
                        "order_index": 6,
                        "prerequisites": "Object-Oriented Programming"
                    }
                ]
            },
            {
                "name": "Java",
                "description": "Core Java enterprise principles, JVM architecture, collections framework, and multi-threading.",
                "icon": "Coffee",
                "code": "JAVA101",
                "topics": [
                    {
                        "name": "Java Fundamentals & JVM",
                        "description": "JVM, JRE, JDK architecture, primitive data types, and byte-code execution.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "Classes & Inheritance",
                        "description": "Constructors, access modifiers, method overriding, and abstract classes.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "Java Fundamentals & JVM"
                    },
                    {
                        "name": "Java Collections Framework",
                        "description": "ArrayList, LinkedList, HashMap, HashSet, and Comparable/Comparator interfaces.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "Classes & Inheritance"
                    },
                    {
                        "name": "Exception Handling & IO",
                        "description": "Checked vs unchecked exceptions, try-with-resources, and file streaming.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "Java Collections Framework"
                    },
                    {
                        "name": "Multithreading & Concurrency",
                        "description": "Thread lifecycle, synchronization, ThreadPoolExecutor, and atomic variables.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "Exception Handling & IO"
                    }
                ]
            },
            {
                "name": "Web Development",
                "description": "Full-stack web architecture covering HTML5 semantics, modern CSS3/Tailwind, JavaScript ES6+, and REST APIs.",
                "icon": "Globe",
                "code": "WEB101",
                "topics": [
                    {
                        "name": "HTML5 & Semantic Structure",
                        "description": "Accessible DOM markup, SEO metadata, form validation, and web storage.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "CSS3 Flexbox & Grid",
                        "description": "Modern responsive layouts, CSS variables, media queries, and animations.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "HTML5 & Semantic Structure"
                    },
                    {
                        "name": "JavaScript ES6+ & DOM",
                        "description": "Promises, async/await, closures, array methods, and event bubbling.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "CSS3 Flexbox & Grid"
                    },
                    {
                        "name": "React Component Architecture",
                        "description": "Virtual DOM, JSX, props, state, useEffect hooks, and lifecycle management.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "JavaScript ES6+ & DOM"
                    },
                    {
                        "name": "REST APIs & State Management",
                        "description": "HTTP client integration, authentication headers, Redux/Context state, and CORS.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "React Component Architecture"
                    }
                ]
            },
            {
                "name": "Data Structures",
                "description": "Foundational algorithms and data structures with asymptotic Big-O time and space complexity analysis.",
                "icon": "Layers",
                "code": "DSA101",
                "topics": [
                    {
                        "name": "Arrays & Strings",
                        "description": "Two-pointer approach, sliding window technique, and dynamic sizing.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "Linked Lists & Stacks",
                        "description": "Singly and doubly linked lists, stack LIFO principles, and monotonic stacks.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "Arrays & Strings"
                    },
                    {
                        "name": "Queues & Hash Tables",
                        "description": "Circular queues, hash collisions, Robin Hood hashing, and amortized lookup.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "Linked Lists & Stacks"
                    },
                    {
                        "name": "Binary Trees & BST",
                        "description": "Tree traversals (In-order, Pre-order, Post-order), BST operations, and AVL balancing.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "Queues & Hash Tables"
                    },
                    {
                        "name": "Graphs & Dynamic Programming",
                        "description": "BFS, DFS, Dijkstra shortest path, memoization, and optimal substructure.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "Binary Trees & BST"
                    }
                ]
            },
            {
                "name": "Database Management",
                "description": "Relational schema design, normalization, ACID transactions, complex SQL queries, and indexing strategies.",
                "icon": "Database",
                "code": "DBMS101",
                "topics": [
                    {
                        "name": "Relational Models & Keys",
                        "description": "Primary keys, foreign keys, candidate keys, and ER entity-relationship diagrams.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "SQL Queries & Aggregations",
                        "description": "SELECT, WHERE, GROUP BY, HAVING, subqueries, and window functions.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "Relational Models & Keys"
                    },
                    {
                        "name": "SQL Joins & Normalization",
                        "description": "INNER, LEFT, RIGHT, FULL OUTER joins, 1NF, 2NF, 3NF, and BCNF normalization.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "SQL Queries & Aggregations"
                    },
                    {
                        "name": "Transactions & ACID Properties",
                        "description": "Atomicity, Consistency, Isolation, Durability, concurrency controls, and locks.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "SQL Joins & Normalization"
                    },
                    {
                        "name": "Indexing & Query Optimization",
                        "description": "B-Tree vs Hash indexes, EXPLAIN plan analysis, and query performance tuning.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "Transactions & ACID Properties"
                    }
                ]
            },
            {
                "name": "Machine Learning",
                "description": "Mathematical foundations, supervised and unsupervised learning, model evaluation, and neural networks.",
                "icon": "Cpu",
                "code": "ML101",
                "topics": [
                    {
                        "name": "ML Foundations & Data Preprocessing",
                        "description": "Feature scaling, missing value imputation, one-hot encoding, and train-test splits.",
                        "difficulty": "Beginner",
                        "order_index": 1,
                        "prerequisites": None
                    },
                    {
                        "name": "Supervised Learning: Regression",
                        "description": "Linear regression, cost functions, gradient descent, and Ridge/Lasso regularization.",
                        "difficulty": "Beginner",
                        "order_index": 2,
                        "prerequisites": "ML Foundations & Data Preprocessing"
                    },
                    {
                        "name": "Supervised Learning: Classification",
                        "description": "Logistic regression, Decision Trees, Random Forests, Support Vector Machines.",
                        "difficulty": "Intermediate",
                        "order_index": 3,
                        "prerequisites": "Supervised Learning: Regression"
                    },
                    {
                        "name": "Model Evaluation & Tuning",
                        "description": "Precision, Recall, F1-Score, ROC-AUC curves, cross-validation, and GridSearchCV.",
                        "difficulty": "Intermediate",
                        "order_index": 4,
                        "prerequisites": "Supervised Learning: Classification"
                    },
                    {
                        "name": "Unsupervised Learning & Clustering",
                        "description": "K-Means clustering, hierarchical clustering, PCA dimensionality reduction.",
                        "difficulty": "Advanced",
                        "order_index": 5,
                        "prerequisites": "Model Evaluation & Tuning"
                    }
                ]
            }
        ]

        # Insert Subjects & Topics
        topic_map = {}  # topic_name -> topic_obj
        for s_info in subjects_data:
            subj = Subject(
                name=s_info["name"],
                description=s_info["description"],
                icon=s_info["icon"],
                code=s_info["code"]
            )
            db.add(subj)
            db.flush()

            for t_info in s_info["topics"]:
                topic = Topic(
                    subject_id=subj.id,
                    name=t_info["name"],
                    description=t_info["description"],
                    difficulty=t_info["difficulty"],
                    order_index=t_info["order_index"],
                    prerequisites=t_info["prerequisites"]
                )
                db.add(topic)
                db.flush()
                topic_map[t_info["name"]] = topic

        db.commit()

        # 3. Create Questions (Realistic academic MCQs)
        questions_data = [
            # Python Basics & Syntax
            {
                "topic": "Python Basics & Syntax",
                "question_text": "What is the output of the expression `type(5 / 2)` in Python 3?",
                "option_a": "<class 'int'>",
                "option_b": "<class 'float'>",
                "option_c": "<class 'double'>",
                "option_d": "<class 'number'>",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "In Python 3, the single slash division operator `/` always performs true floating-point division."
            },
            {
                "topic": "Python Basics & Syntax",
                "question_text": "Which of the following data types in Python is IMMUTABLE?",
                "option_a": "list",
                "option_b": "dict",
                "option_c": "tuple",
                "option_d": "set",
                "correct_answer": "C",
                "difficulty": "Beginner",
                "explanation": "Tuples cannot be modified after instantiation, making them immutable."
            },
            # Control Flow & Loops
            {
                "topic": "Control Flow & Loops",
                "question_text": "What is the output of `[x * 2 for x in range(4) if x % 2 == 0]`?",
                "option_a": "[0, 2, 4, 6]",
                "option_b": "[0, 4]",
                "option_c": "[2, 6]",
                "option_d": "[4, 8]",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Multiplied by 2, they yield [0, 4]."
            },
            {
                "topic": "Control Flow & Loops",
                "question_text": "When does the `else` clause in a Python `for...else` loop execute?",
                "option_a": "When the loop terminates normally without encountering a `break` statement.",
                "option_b": "Whenever an exception occurs inside the loop.",
                "option_c": "Only if the iterable was completely empty.",
                "option_d": "Every time after each iteration.",
                "correct_answer": "A",
                "difficulty": "Intermediate",
                "explanation": "In Python, the `else` clause attached to a loop executes only if the loop ran to completion without hitting a `break`."
            },
            # Functions & Scope
            {
                "topic": "Functions & Scope",
                "question_text": "What is the potential hazard of using a mutable default argument like `def add_item(val, lst=[])`?",
                "option_a": "It causes a compile-time syntax error.",
                "option_b": "The default list is created once at function definition and shared across subsequent calls.",
                "option_c": "The list is garbage collected immediately upon return.",
                "option_d": "It automatically converts the list into a frozen set.",
                "correct_answer": "B",
                "difficulty": "Intermediate",
                "explanation": "Python default arguments are evaluated once at definition time, meaning mutations to default objects persist across calls."
            },
            {
                "topic": "Functions & Scope",
                "question_text": "What does the `*args` syntax in a function definition achieve?",
                "option_a": "Enforces keyword-only arguments.",
                "option_b": "Packs variable positional arguments into a tuple.",
                "option_c": "Unpacks dictionary key-value pairs.",
                "option_d": "Forces pass-by-reference semantics.",
                "correct_answer": "B",
                "difficulty": "Intermediate",
                "explanation": "`*args` captures arbitrary extra positional arguments as a tuple."
            },
            # Exception Handling
            {
                "topic": "Exception Handling",
                "question_text": "Which clause in a `try...except...else...finally` block ALWAYS executes regardless of exceptions?",
                "option_a": "except",
                "option_b": "else",
                "option_c": "finally",
                "option_d": "retry",
                "correct_answer": "C",
                "difficulty": "Intermediate",
                "explanation": "The `finally` block runs unconditionally, ideal for releasing resources and closing handles."
            },
            {
                "topic": "Exception Handling",
                "question_text": "How do you re-raise the currently active exception inside an except block without losing traceback?",
                "option_a": "raise self",
                "option_b": "raise Exception()",
                "option_c": "raise",
                "option_d": "return sys.last_traceback",
                "correct_answer": "C",
                "difficulty": "Intermediate",
                "explanation": "A bare `raise` statement re-raises the active exception preserving the complete original stack trace."
            },
            # Object-Oriented Programming
            {
                "topic": "Object-Oriented Programming",
                "question_text": "What is the purpose of the `__init__` method in a Python class?",
                "option_a": "Allocates raw operating system memory for the object.",
                "option_b": "Initializes the state of a freshly created class instance.",
                "option_c": "Serves as the class destructor.",
                "option_d": "Constructs static class variables only.",
                "correct_answer": "B",
                "difficulty": "Advanced",
                "explanation": "`__new__` creates the object instance, while `__init__` initializes its attributes."
            },
            {
                "topic": "Object-Oriented Programming",
                "question_text": "What method resolution order (MRO) algorithm does Python 3 use for multiple inheritance?",
                "option_a": "Depth-First Search",
                "option_b": "Breadth-First Search",
                "option_c": "C3 Superclass Linearization",
                "option_d": "Dijkstra Linearization",
                "correct_answer": "C",
                "difficulty": "Advanced",
                "explanation": "Python 3 uses the C3 Linearization algorithm to determine method resolution order consistently."
            },
            # Java Fundamentals & JVM
            {
                "topic": "Java Fundamentals & JVM",
                "question_text": "What is the primary role of the Java Virtual Machine (JVM)?",
                "option_a": "Converts Java source code (.java) into machine code directly.",
                "option_b": "Executes compiled bytecode (.class) on host operating systems.",
                "option_c": "Provides only database connectivity APIs.",
                "option_d": "Manages browser client side render loops.",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "The JVM interprets and JIT-compiles Java bytecode into native machine instructions for cross-platform portability."
            },
            {
                "topic": "Classes & Inheritance",
                "question_text": "Which Java keyword is used to prevent a class from being inherited or a method from being overridden?",
                "option_a": "static",
                "option_b": "final",
                "option_c": "abstract",
                "option_d": "synchronized",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "The `final` keyword prevents inheritance on classes, overriding on methods, and reassignment on variables."
            },
            # Java Collections Framework
            {
                "topic": "Java Collections Framework",
                "question_text": "What is the average time complexity for `get()` and `put()` operations in a well-distributed Java `HashMap`?",
                "option_a": "O(1)",
                "option_b": "O(log n)",
                "option_c": "O(n)",
                "option_d": "O(n log n)",
                "correct_answer": "A",
                "difficulty": "Intermediate",
                "explanation": "HashMaps achieve amortized O(1) constant time complexity for key lookups and insertions."
            },
            # Web Development
            {
                "topic": "HTML5 & Semantic Structure",
                "question_text": "Which HTML5 semantic element is most appropriate for a self-contained composition intended to be independently distributable?",
                "option_a": "<div>",
                "option_b": "<article>",
                "option_c": "<section>",
                "option_d": "<aside>",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "The `<article>` element specifies independent, self-contained content such as blog posts or news articles."
            },
            {
                "topic": "CSS3 Flexbox & Grid",
                "question_text": "Which CSS Flexbox property aligns items along the cross axis?",
                "option_a": "justify-content",
                "option_b": "align-items",
                "option_c": "flex-direction",
                "option_d": "flex-flow",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "`justify-content` controls the main axis, while `align-items` controls the cross axis."
            },
            {
                "topic": "JavaScript ES6+ & DOM",
                "question_text": "What will `console.log(typeof NaN)` print in modern JavaScript?",
                "option_a": "'undefined'",
                "option_b": "'number'",
                "option_c": "'NaN'",
                "option_d": "'object'",
                "correct_answer": "B",
                "difficulty": "Intermediate",
                "explanation": "In JavaScript specification (IEEE 754), NaN is considered a numeric value of type 'number'."
            },
            # Data Structures
            {
                "topic": "Arrays & Strings",
                "question_text": "What is the time complexity of searching an element in an unsorted array of size N?",
                "option_a": "O(1)",
                "option_b": "O(log N)",
                "option_c": "O(N)",
                "option_d": "O(N^2)",
                "correct_answer": "C",
                "difficulty": "Beginner",
                "explanation": "An unsorted array requires linear search checking up to N elements."
            },
            {
                "topic": "Linked Lists & Stacks",
                "question_text": "Which data structure operates on a Last-In, First-Out (LIFO) protocol?",
                "option_a": "Queue",
                "option_b": "Stack",
                "option_c": "Binary Tree",
                "option_d": "Graph",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "A Stack enforces LIFO access, where the most recently pushed element is popped first."
            },
            {
                "topic": "Binary Trees & BST",
                "question_text": "In a valid Binary Search Tree (BST), what property holds for the left subtree of any node K?",
                "option_a": "All values in the left subtree are strictly greater than K.",
                "option_b": "All values in the left subtree are strictly less than K.",
                "option_c": "Left subtree must have equal height to right subtree.",
                "option_d": "Left subtree must contain prime numbers only.",
                "correct_answer": "B",
                "difficulty": "Intermediate",
                "explanation": "In a BST, every left descendant has key < K and every right descendant has key > K."
            },
            # Database Management
            {
                "topic": "Relational Models & Keys",
                "question_text": "What is the defining characteristic of a Primary Key in relational databases?",
                "option_a": "Must allow NULL values.",
                "option_b": "Uniquely identifies each record in a table and cannot contain NULL values.",
                "option_c": "Can only be composed of integer columns.",
                "option_d": "Can duplicate values across rows.",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "A Primary Key uniquely identifies tuples and strictly enforces uniqueness and non-null constraints."
            },
            {
                "topic": "Transactions & ACID Properties",
                "question_text": "Which ACID property guarantees that all database updates within a transaction complete successfully, or all are rolled back?",
                "option_a": "Atomicity",
                "option_b": "Consistency",
                "option_c": "Isolation",
                "option_d": "Durability",
                "correct_answer": "A",
                "difficulty": "Intermediate",
                "explanation": "Atomicity ensures 'all-or-nothing' execution of a transactional block."
            },
            # Machine Learning
            {
                "topic": "ML Foundations & Data Preprocessing",
                "question_text": "Why is feature scaling essential before training algorithms like K-Means or Support Vector Machines?",
                "option_a": "Because they are invariant to Euclidean distance magnitudes.",
                "option_b": "Because distance-based calculations will be dominated by features with arbitrarily larger numerical ranges.",
                "option_c": "To convert categorical features directly into strings.",
                "option_d": "To eliminate the need for cross-validation.",
                "correct_answer": "B",
                "difficulty": "Beginner",
                "explanation": "Distance-dependent algorithms are distorted if one feature has range 0-1 and another has range 0-100,000."
            },
            {
                "topic": "Supervised Learning: Classification",
                "question_text": "In binary classification with severe class imbalance (e.g., 99% negative, 1% positive), which metric is LEAST informative?",
                "option_a": "Precision",
                "option_b": "Recall",
                "option_c": "Raw Accuracy",
                "option_d": "F1-Score",
                "correct_answer": "C",
                "difficulty": "Intermediate",
                "explanation": "A trivial model predicting always negative achieves 99% accuracy while detecting 0% of true positives."
            }
        ]

        for q in questions_data:
            topic_obj = topic_map.get(q["topic"])
            if topic_obj:
                new_q = Question(
                    topic_id=topic_obj.id,
                    question_text=q["question_text"],
                    option_a=q["option_a"],
                    option_b=q["option_b"],
                    option_c=q["option_c"],
                    option_d=q["option_d"],
                    correct_answer=q["correct_answer"],
                    difficulty=q["difficulty"],
                    explanation=q["explanation"]
                )
                db.add(new_q)
        db.commit()

        # 4. Create Learning Materials (20+ curated materials)
        materials_data = [
            {
                "topic": "Python Basics & Syntax",
                "title": "Comprehensive Guide to Python Syntax & Data Types",
                "description": "Interactive study notes covering variables, memory allocation, and type conversion.",
                "content_type": "Notes",
                "difficulty": "Beginner",
                "estimated_minutes": 15,
                "url": "https://docs.python.org/3/tutorial/introduction.html",
                "markdown_content": """# Python Syntax & Fundamental Types

Python is an interpreted, high-level, dynamically typed language created by Guido van Rossum.

### Key Concepts:
1. **Dynamic Typing**: Variables take type from assigned values.
2. **Memory Model**: Everything in Python is an object (`id()`, `type()`).
3. **Primitive Types**: `int`, `float`, `bool`, `str`.

```python
# Type inspection
x = 42
print(type(x))  # <class 'int'>
x = "Learnova"
print(type(x))  # <class 'str'>
```

### Best Practice Tip:
Always leverage explicit type hinting (`typing` module) in modern Python codebases for maintainability and IDE static analysis.
"""
            },
            {
                "topic": "Control Flow & Loops",
                "title": "Mastering Python Comprehensions and Iteration Patterns",
                "description": "Step-by-step notes on list, dictionary, and set comprehensions.",
                "content_type": "Notes",
                "difficulty": "Beginner",
                "estimated_minutes": 20,
                "url": "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
                "markdown_content": """# Python Iteration Patterns & Comprehensions

Comprehensions provide a concise way to construct collections.

### Structure:
`[expression for item in iterable if condition]`

```python
numbers = [1, 2, 3, 4, 5, 6]
evens_squared = [n**2 for n in numbers if n % 2 == 0]
print(evens_squared)  # [4, 16, 36]
```
"""
            },
            {
                "topic": "Functions & Scope",
                "title": "Advanced Python Functions: Scope, Closures, and *args",
                "description": "Deep-dive into LEGB scope rules and closure mechanics.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 25,
                "url": "https://realpython.com/defining-your-own-python-function/",
                "markdown_content": """# Functions, Scope, and Closures

Python resolves identifiers using the **LEGB rule**:
- **L**: Local
- **E**: Enclosing
- **G**: Global
- **B**: Built-in

### Variadic Arguments
```python
def configure_engine(name, *args, **kwargs):
    print(f"Engine: {name}")
    print(f"Positional args: {args}")
    print(f"Keyword params: {kwargs}")
```
"""
            },
            {
                "topic": "Exception Handling",
                "title": "Robust Defensive Programming with Python Exceptions",
                "description": "Production patterns for handling errors cleanly.",
                "content_type": "Practice",
                "difficulty": "Intermediate",
                "estimated_minutes": 18,
                "url": "https://docs.python.org/3/tutorial/errors.html",
                "markdown_content": """# Exception Handling & Custom Error Hierarchies

Handling exceptions prevents crashes and ensures predictable recovery.

### The Complete Syntax
```python
try:
    file = open("data.json")
except FileNotFoundError as err:
    print(f"Error caught: {err}")
else:
    print("Execution succeeded without errors")
finally:
    print("Always runs - perfect for cleanup")
```
"""
            },
            {
                "topic": "Object-Oriented Programming",
                "title": "Python OOP Mastery: Dunder Methods, MRO, and Encapsulation",
                "description": "Industrial object design patterns in Python 3.",
                "content_type": "Notes",
                "difficulty": "Advanced",
                "estimated_minutes": 35,
                "url": "https://realpython.com/python3-object-oriented-programming/",
                "markdown_content": """# Object-Oriented Architecture in Python

Python provides complete OOP support including multiple inheritance and operator overloading.

### Dunder (Magic) Methods
```python
class StudentLearner:
    def __init__(self, name: str, score: float):
        self.name = name
        self.score = score

    def __repr__(self):
        return f"StudentLearner(name={self.name!r}, score={self.score})"

    def __eq__(self, other):
        return self.score == other.score
```
"""
            },
            {
                "topic": "Java Fundamentals & JVM",
                "title": "JVM Internal Architecture: ClassLoader, Heap, and Stack",
                "description": "Understand how the JVM executes bytecode under the hood.",
                "content_type": "Notes",
                "difficulty": "Beginner",
                "estimated_minutes": 20,
                "url": "https://docs.oracle.com/javase/specs/jvms/se17/html/index.html",
                "markdown_content": """# The Java Virtual Machine Architecture

The JVM consists of three primary subsystems:
1. **ClassLoader Subsystem**: Loading, Linking, and Initialization.
2. **Runtime Data Areas**: Method Area, Heap Area, Stack Area, PC Registers.
3. **Execution Engine**: Interpreter, JIT Compiler, and Garbage Collector.
"""
            },
            {
                "topic": "Java Collections Framework",
                "title": "Deep Dive: Java Collections Hierarchy & Complexity",
                "description": "Choosing the right data structure in enterprise Java.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 30,
                "url": "https://docs.oracle.com/javase/8/docs/technotes/guides/collections/",
                "markdown_content": """# Java Collections Framework

Essential interfaces: `Collection`, `List`, `Set`, `Queue`, `Map`.

### HashMap Under The Hood:
Java 8+ uses array of buckets with linked lists. When a bucket has >= 8 nodes, it converts to a Red-Black tree (`TreeNode`) to guarantee O(log n) worst-case lookup.
"""
            },
            {
                "topic": "HTML5 & Semantic Structure",
                "title": "Modern Semantic Web Standards & Accessibility (A11y)",
                "description": "Building accessible web interfaces compliant with WCAG.",
                "content_type": "Notes",
                "difficulty": "Beginner",
                "estimated_minutes": 15,
                "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
                "markdown_content": """# HTML5 Semantic Standards

Using semantic elements enhances SEO and screen-reader accessibility:
- `<header>`
- `<nav>`
- `<main>`
- `<article>`
- `<aside>`
- `<footer>`
"""
            },
            {
                "topic": "CSS3 Flexbox & Grid",
                "title": "Flexbox vs Grid: Layout Strategies in Modern CSS",
                "description": "Interactive layout guide with code examples.",
                "content_type": "Practice",
                "difficulty": "Beginner",
                "estimated_minutes": 25,
                "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                "markdown_content": """# CSS Flexbox & CSS Grid

- **Flexbox**: One-dimensional layout (row or column).
- **Grid**: Two-dimensional layout (rows and columns simultaneously).
"""
            },
            {
                "topic": "JavaScript ES6+ & DOM",
                "title": "Asynchronous JavaScript: Event Loop, Promises & Async/Await",
                "description": "Mastering non-blocking asynchronous execution in JS.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 30,
                "url": "https://javascript.info/async",
                "markdown_content": """# Asynchronous JavaScript & The Event Loop

JavaScript is single-threaded and non-blocking using the event loop, call stack, microtask queue, and macrotask queue.
"""
            },
            {
                "topic": "Arrays & Strings",
                "title": "Two-Pointer and Sliding Window Algorithms",
                "description": "Standard DSA problem patterns for optimal array solutions.",
                "content_type": "Practice",
                "difficulty": "Beginner",
                "estimated_minutes": 25,
                "url": "https://leetcode.com/explore/",
                "markdown_content": """# Two-Pointer & Sliding Window Techniques

Optimizing brute-force O(N^2) algorithms to linear O(N) time.
"""
            },
            {
                "topic": "Binary Trees & BST",
                "title": "Binary Tree Traversals and BST Balance Verification",
                "description": "DFS vs BFS tree patterns and recursive formulations.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 30,
                "url": "https://en.wikipedia.org/wiki/Tree_traversal",
                "markdown_content": """# Tree Data Structures

### Traversals:
1. In-order: Left -> Root -> Right (Yields sorted order in a BST)
2. Pre-order: Root -> Left -> Right
3. Post-order: Left -> Right -> Root
"""
            },
            {
                "topic": "Relational Models & Keys",
                "title": "Entity Relationship Modeling & Relational Algebra",
                "description": "Database schema design fundamentals and relationship cardinalities.",
                "content_type": "Notes",
                "difficulty": "Beginner",
                "estimated_minutes": 20,
                "url": "https://www.geeksforgeeks.org/er-model-basic-concepts/",
                "markdown_content": """# Relational Schema Design

Learn Primary Keys, Candidate Keys, Super Keys, and Foreign Key constraints.
"""
            },
            {
                "topic": "Transactions & ACID Properties",
                "title": "Concurrency Control and ACID Properties in RDBMS",
                "description": "Isolation levels, dirty reads, non-repeatable reads, and serializability.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 25,
                "url": "https://en.wikipedia.org/wiki/ACID",
                "markdown_content": """# ACID Guarantees in Databases

- **Atomicity**: Entire transaction succeeds or aborts.
- **Consistency**: Database transitions from one valid state to another.
- **Isolation**: Concurrent executions do not interfere.
- **Durability**: Committed data survives power loss.
"""
            },
            {
                "topic": "ML Foundations & Data Preprocessing",
                "title": "Data Preprocessing Pipeline: Imputation, Normalization, and Encoding",
                "description": "Preparing raw real-world data for scikit-learn models.",
                "content_type": "Practice",
                "difficulty": "Beginner",
                "estimated_minutes": 30,
                "url": "https://scikit-learn.org/stable/modules/preprocessing.html",
                "markdown_content": """# Machine Learning Feature Engineering

StandardScaler vs MinMaxScaler:
- `StandardScaler`: Scales to zero mean and unit variance ($z = (x - \mu) / \sigma$).
- `MinMaxScaler`: Scales bounded between 0 and 1.
"""
            },
            {
                "topic": "Supervised Learning: Classification",
                "title": "Classification Algorithms: Logistic Regression to Random Forests",
                "description": "Decision boundaries, entropy, and ensemble bagging.",
                "content_type": "Notes",
                "difficulty": "Intermediate",
                "estimated_minutes": 35,
                "url": "https://scikit-learn.org/stable/supervised_learning.html",
                "markdown_content": """# Supervised Classification Mechanics

Explains logistic sigmoid hypothesis, information gain, and decision trees.
"""
            }
        ]

        for m in materials_data:
            topic_obj = topic_map.get(m["topic"])
            if topic_obj:
                mat = LearningMaterial(
                    topic_id=topic_obj.id,
                    title=m["title"],
                    description=m["description"],
                    content_type=m["content_type"],
                    difficulty=m["difficulty"],
                    estimated_minutes=m["estimated_minutes"],
                    url=m["url"],
                    markdown_content=m["markdown_content"]
                )
                db.add(mat)
        db.commit()

        # 5. Create Quizzes
        for t_name, t_obj in topic_map.items():
            quiz = Quiz(
                topic_id=t_obj.id,
                title=f"{t_name} Mastery Quiz",
                difficulty=t_obj.difficulty,
                time_limit=10
            )
            db.add(quiz)
        db.commit()

        # 6. Create Demo Admin & Student Users
        # Admin User
        admin_user = User(
            name="Learnova Admin",
            email="admin@learnova.ai",
            password_hash=hash_password("Admin@123"),
            role="admin",
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(admin_user)

        # Demo Student User
        student_user = User(
            name="Alex Mercer",
            email="student@learnova.ai",
            password_hash=hash_password("Student@123"),
            role="student",
            created_at=datetime.utcnow() - timedelta(days=14)
        )
        db.add(student_user)
        db.flush()

        student_profile = StudentProfile(
            user_id=student_user.id,
            education_level="B.Tech Computer Science",
            preferred_learning_style="Interactive Code & Visual Diagrams",
            target_subject="Python Programming",
            learning_goal="Master Python & Advanced Algorithmic Patterns for Placement",
            streak_days=5,
            knowledge_level="Intermediate",
            total_study_minutes=180,
            last_active_date=datetime.utcnow()
        )
        db.add(student_profile)
        db.flush()

        # Unlock First Assessment achievement for demo student
        first_ach = db.query(Achievement).filter(Achievement.code == "first_assessment").first()
        if first_ach:
            db.add(StudentAchievement(
                student_id=student_user.id,
                achievement_id=first_ach.id,
                unlocked_at=datetime.utcnow() - timedelta(days=7)
            ))

        # Add initial topic performances for demo student so dashboard displays real analytics immediately!
        py_subj = db.query(Subject).filter(Subject.name == "Python Programming").first()
        t_basics = topic_map.get("Python Basics & Syntax")
        t_loops = topic_map.get("Control Flow & Loops")
        t_funcs = topic_map.get("Functions & Scope")
        t_except = topic_map.get("Exception Handling")
        t_oop = topic_map.get("Object-Oriented Programming")

        if t_basics:
            db.add(StudentTopicPerformance(
                student_id=student_user.id,
                topic_id=t_basics.id,
                score=90.0,
                mastery_level="Mastered",
                attempts=2,
                last_attempt=datetime.utcnow() - timedelta(days=5)
            ))
        if t_loops:
            db.add(StudentTopicPerformance(
                student_id=student_user.id,
                topic_id=t_loops.id,
                score=82.0,
                mastery_level="Proficient",
                attempts=2,
                last_attempt=datetime.utcnow() - timedelta(days=3)
            ))
        if t_funcs:
            db.add(StudentTopicPerformance(
                student_id=student_user.id,
                topic_id=t_funcs.id,
                score=48.0,
                mastery_level="Novice",
                attempts=1,
                last_attempt=datetime.utcnow() - timedelta(days=2)
            ))
        if t_except:
            db.add(StudentTopicPerformance(
                student_id=student_user.id,
                topic_id=t_except.id,
                score=42.0,
                mastery_level="Novice",
                attempts=1,
                last_attempt=datetime.utcnow() - timedelta(days=1)
            ))

        # Add initial assessment record
        if py_subj:
            ass = Assessment(
                student_id=student_user.id,
                subject_id=py_subj.id,
                score=7,
                total_questions=10,
                percentage=70.0,
                time_taken_seconds=450,
                completed_at=datetime.utcnow() - timedelta(days=6)
            )
            db.add(ass)

        # Add initial notification
        db.add(Notification(
            student_id=student_user.id,
            title="👋 Welcome to Learnova AI",
            message="Your personalized AI learning profile has been initialized.",
            notification_type="milestone",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=7)
        ))
        db.add(Notification(
            student_id=student_user.id,
            title="⚠️ Weak Topic Detected",
            message="AI detected that 'Exception Handling' needs more practice (42%). Review recommended materials.",
            notification_type="recommendation",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=1)
        ))

        db.commit()

        # Refresh recommendations for demo student
        refresh_student_recommendations(db, student_user.id)

        print("Seeding completed successfully!")
        print("Demo Admin: admin@learnova.ai / Admin@123")
        print("Demo Student: student@learnova.ai / Student@123")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
