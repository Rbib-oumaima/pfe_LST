from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

SECRET_KEY = "ocp_secret_key"

ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Token invalide"
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        role = payload.get("role")

        if username is None:
            raise credentials_exception

        return {
            "username": username,
            "role": role
        }

    except JWTError:
        raise credentials_exception