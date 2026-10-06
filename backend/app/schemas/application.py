from datetime import date, datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    HttpUrl,
    StringConstraints,
    field_serializer,
    model_validator,
)

from app.models import ApplicationStatus, EmploymentType


def _blank_to_none(value: object) -> object:
    if isinstance(value, str) and not value.strip():
        return None
    return value


RequiredStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
_Str200 = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]
_Str100 = Annotated[str, StringConstraints(strip_whitespace=True, max_length=100)]

# Optional text fields: "" / whitespace-only is stored as NULL.
OptionalStr200 = Annotated[_Str200 | None, BeforeValidator(_blank_to_none)]
OptionalSalary = Annotated[_Str100 | None, BeforeValidator(_blank_to_none)]
OptionalUrl = Annotated[HttpUrl | None, BeforeValidator(_blank_to_none)]
OptionalNotes = Annotated[str | None, Field(max_length=10_000)]


class _UrlSerializer(BaseModel):
    @field_serializer("job_url", check_fields=False)
    def _url_to_str(self, value: HttpUrl | None) -> str | None:
        return str(value) if value is not None else None


class ApplicationCreate(_UrlSerializer):
    company: RequiredStr
    position: RequiredStr
    location: OptionalStr200 = None
    job_url: OptionalUrl = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    date_applied: date | None = None
    salary: OptionalSalary = None
    employment_type: EmploymentType | None = None
    notes: OptionalNotes = None


class ApplicationUpdate(_UrlSerializer):
    """PATCH body: every field optional; only provided fields are changed."""

    company: RequiredStr | None = None
    position: RequiredStr | None = None
    location: OptionalStr200 = None
    job_url: OptionalUrl = None
    status: ApplicationStatus | None = None
    date_applied: date | None = None
    salary: OptionalSalary = None
    employment_type: EmploymentType | None = None
    notes: OptionalNotes = None

    @model_validator(mode="after")
    def _required_fields_not_null(self) -> "ApplicationUpdate":
        for field in ("company", "position", "status"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company: str
    position: str
    location: str | None
    job_url: str | None
    status: ApplicationStatus
    date_applied: date | None
    salary: str | None
    employment_type: EmploymentType | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class ApplicationSummary(BaseModel):
    total: int
    by_status: dict[ApplicationStatus, int]
