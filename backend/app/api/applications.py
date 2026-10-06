from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import Application, User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationSummary,
    ApplicationUpdate,
)
from app.services import application_service

router = APIRouter(prefix="/applications", tags=["applications"])


def _get_owned_or_404(db: Session, user: User, application_id: int) -> Application:
    application = application_service.get_application(db, user.id, application_id)
    if application is None:
        # 404 (not 403) so other users' record ids aren't revealed.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.get("", response_model=list[ApplicationRead])
def list_applications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return application_service.list_applications(db, user.id)


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    body: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return application_service.create_application(db, user.id, body)


# Declared before /{application_id} so "summary" isn't parsed as an id.
@router.get("/summary", response_model=ApplicationSummary)
def summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return application_service.summarize(db, user.id)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(
    application_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_or_404(db, user, application_id)


@router.patch("/{application_id}", response_model=ApplicationRead)
def update_application(
    application_id: int,
    body: ApplicationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = _get_owned_or_404(db, user, application_id)
    return application_service.update_application(db, application, body)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = _get_owned_or_404(db, user, application_id)
    application_service.delete_application(db, application)
