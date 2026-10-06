"""Application queries. Every function is scoped to a user id so that one user
can never read or modify another user's rows."""

from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationSummary, ApplicationUpdate


def list_applications(db: Session, user_id: int) -> Sequence[Application]:
    stmt = (
        select(Application)
        .where(Application.user_id == user_id)
        .order_by(Application.updated_at.desc(), Application.id.desc())
    )
    return db.scalars(stmt).all()


def get_application(db: Session, user_id: int, application_id: int) -> Application | None:
    stmt = select(Application).where(
        Application.id == application_id, Application.user_id == user_id
    )
    return db.scalar(stmt)


def create_application(db: Session, user_id: int, data: ApplicationCreate) -> Application:
    application = Application(user_id=user_id, **data.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def update_application(
    db: Session, application: Application, data: ApplicationUpdate
) -> Application:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application: Application) -> None:
    db.delete(application)
    db.commit()


def summarize(db: Session, user_id: int) -> ApplicationSummary:
    rows = db.execute(
        select(Application.status, func.count())
        .where(Application.user_id == user_id)
        .group_by(Application.status)
    ).all()
    by_status = {status: 0 for status in ApplicationStatus}
    for status, count in rows:
        by_status[status] = count
    return ApplicationSummary(total=sum(by_status.values()), by_status=by_status)
