from passlib.context import CryptContext
from sqlmodel import Session, select
from typing import Annotated
from src.todo_app_auth.db import get_session
from fastapi import Depends, HTTPException, status
from src.todo_app_auth.models import RefreshTokenData, TokenData, User, Todo
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta

# 265 bits of Secret key
SECRET_KEY = '7626483f5c4b30a5987d188f14cec81665136713e67c11b4963cb813763a61c264d83e0783670af8781a95852627e5fe227272c495f58e94a44b5f82608d78aac52ec0a3881618d8823495042722aa15b69a39689d42798e1dc45a8992e7e3410d658649f71dd8c0806008422bd5f5473e3ac82ede8292f12c969bdf710b72fa1e40d6f7f44a667ad23bcaa0ccba1196493627311eebe01e2cdc979f83fc9cdf8a10a73385d4c91e68b3c78e9587cb4d1cc1dee585bc08d96a2d9c66cd10a848a8ea20acf015af731edccf1ed9a671152bec815d05aff55af3b4a6b1007857e4fec5d3ac109b5b9c107db4b91dd6758c5a63c8cdb7f55c596fa2a7aad66233f4'
ALGORITHYM = 'HS256'
EXPIRY_TIME = 1

oauth_scheme = OAuth2PasswordBearer(tokenUrl="/token")

pwd_context = CryptContext(schemes="bcrypt")


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hash_password):
    return pwd_context.verify(password, hash_password)


def get_user_from_db(session: Annotated[Session, Depends(get_session)],
                     username: str | None = None,
                     email: str | None = None):
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    print(user)
    if not user:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        if user:
            return user

    return user


def authenticate_user(username, password, session: Annotated[Session, Depends(get_session)]):
    db_user = get_user_from_db(session=session, username=username)
    print(f""" authenticate {db_user} """)
    if not db_user:
        return False
    if not verify_password(password, db_user.password):
        return False
    return db_user


def create_access_token(data: dict, expiry_time: timedelta | None):
    data_to_encode = data.copy()
    if expiry_time:
        expire = datetime.now(timezone.utc) + expiry_time
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    data_to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        data_to_encode, SECRET_KEY, algorithm=ALGORITHYM, )
    return encoded_jwt


def current_user(token: Annotated[str, Depends(oauth_scheme)], session: Annotated[Session, Depends(get_session)]):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token, Please login again",
        headers={"www-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHYM)
        username: str | None = payload.get("username")
        if username is None:
            raise credential_exception
        token_data = TokenData(username=username)
        user = get_user_from_db(session, username=token_data.username)
        if not user:
            raise credential_exception
        return user
    except JWTError:
        raise credential_exception


def create_refresh_token(data: dict, expiry_time: timedelta | None):
    data_to_encode = data.copy()
    if expiry_time:
        expire = datetime.now(timezone.utc) + expiry_time
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    data_to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        data_to_encode, SECRET_KEY, algorithm=ALGORITHYM, )
    return encoded_jwt


def validate_refresh_token(token: str, session: Annotated[Session, Depends(get_session)]):

    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token, Please login again",
        headers={"www-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHYM)
        email: str | None = payload.get("username")
        if email is None:
            raise credential_exception
        token_data = RefreshTokenData(email=email)

    except:
        raise JWTError
    user = get_user_from_db(session, email=token_data.email)
    if not user:
        raise credential_exception
    return user
