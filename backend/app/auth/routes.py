# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from app.db.connection import get_db
# from app.db.models import User, UserRole
# from app.auth.schemas import UserRegister, UserLogin, TokenResponse
# from app.auth.utils import hash_password, verify_password, create_access_token

# router = APIRouter(prefix="/auth", tags=["Authentication"])


# @router.get("/ping")
# def ping_test():
#     print("/auth router is working fine")
#     return {"message": "Auth route working fine!"}


# #Register New Citizen
# @router.post("/register", response_model=TokenResponse)
# def register_user(data: UserRegister, db: Session = Depends(get_db)):
#     """Register a new citizen user"""
#     print("Register request received:", data.dict())

#     # Check if email already exists
#     existing_user = db.query(User).filter(User.email == data.email).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     #Hash password
#     hashed_pw = hash_password(data.password)

#     #Create new user with role = user
#     new_user = User(
#         name=data.name,
#         email=data.email,
#         password_hash=hashed_pw,
#         role=UserRole.user,
#     )

#     #Save to DB with error handling
#     try:
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         print(f"User created successfully: {new_user.email}")
#     except Exception as e:
#         db.rollback()
#         print(f"Database error: {e}")
#         raise HTTPException(status_code=500, detail=f"Database error: {e}")

#     # Generate JWT token
#     token = create_access_token({
#         "sub": new_user.email,
#         "role": new_user.role.value
#     })

#     return {"access_token": token, "token_type": "bearer"}


# #Login User or Admin
# @router.post("/login", response_model=TokenResponse)
# def login_user(data: UserLogin, db: Session = Depends(get_db)):
#     """Login for both users and admin"""
#     print("Login attempt for:", data.email)

#     user = db.query(User).filter(User.email == data.email).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     if not verify_password(data.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     print(f"Login successful for {user.email} (role: {user.role.value})")

#     # Generate JWT token
#     token = create_access_token({
#         "sub": user.email,
#         "role": user.role.value
#     })

#     return {"access_token": token, "token_type": "bearer"}





from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.schemas import TokenResponse, UserLogin, UserRegister
from app.auth.utils import create_access_token, hash_password, verify_password
from app.db.connection import get_db
from app.db.models import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])

ADMIN_EMAIL = "admin123@gmail.com"
ADMIN_PASSWORD = "admin123"


@router.get("/ping")
def ping_test():
    print("/auth router is working fine")
    return {"message": "Auth route working fine!"}


@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new citizen user only."""
    print("Register request received:", data.dict())

    if data.email == ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="This email is reserved for admin login")

    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(data.password)

    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed_pw,
        role=UserRole.user,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"User created successfully: {new_user.email}")
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    token = create_access_token(
        {
            "sub": new_user.email,
            "role": new_user.role.value,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role.value,
    }


@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    """Login for citizens from DB and admin from fixed credentials."""
    print("Login attempt for:", data.email)

    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:
        token = create_access_token(
            {
                "sub": ADMIN_EMAIL,
                "role": "admin",
            }
        )

        print("Admin login successful")

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
        }

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print(f"Login successful for {user.email} (role: {user.role.value})")

    token = create_access_token(
        {
            "sub": user.email,
            "role": user.role.value,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,
    }