import pytest

BASE = "/api/v1/applications"

SAMPLE = {
    "company": "Shopify",
    "position": "Software Engineer Intern",
    "location": "Toronto, ON",
    "job_url": "https://shopify.com/careers/123",
    "status": "APPLIED",
    "date_applied": "2026-09-15",
    "salary": "$40/hr",
    "employment_type": "INTERNSHIP",
    "notes": "Referred by a friend",
}


def test_requires_auth(client):
    assert client.get(BASE).status_code == 401
    assert client.post(BASE, json=SAMPLE).status_code == 401
    assert client.get(f"{BASE}/summary").status_code == 401


def test_crud_lifecycle(auth_client):
    created = auth_client.post(BASE, json=SAMPLE)
    assert created.status_code == 201
    app = created.json()
    assert app["company"] == "Shopify"
    assert app["date_applied"] == "2026-09-15"
    assert app["job_url"] == "https://shopify.com/careers/123"
    assert "user_id" not in app

    listed = auth_client.get(BASE).json()
    assert [a["id"] for a in listed] == [app["id"]]

    fetched = auth_client.get(f"{BASE}/{app['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == app

    deleted = auth_client.delete(f"{BASE}/{app['id']}")
    assert deleted.status_code == 204
    assert auth_client.get(f"{BASE}/{app['id']}").status_code == 404
    assert auth_client.get(BASE).json() == []


def test_create_defaults_and_minimal_body(auth_client):
    response = auth_client.post(BASE, json={"company": "Acme", "position": "Intern"})
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "SAVED"
    assert body["location"] is None and body["job_url"] is None


def test_blank_optional_strings_become_null(auth_client):
    response = auth_client.post(
        BASE, json={"company": "Acme", "position": "Intern", "job_url": "", "location": "  "}
    )
    assert response.status_code == 201
    assert response.json()["job_url"] is None
    assert response.json()["location"] is None


def test_patch_is_partial(auth_client):
    app = auth_client.post(BASE, json=SAMPLE).json()
    response = auth_client.patch(f"{BASE}/{app['id']}", json={"status": "INTERVIEW"})
    assert response.status_code == 200
    updated = response.json()
    assert updated["status"] == "INTERVIEW"
    assert updated["company"] == SAMPLE["company"]
    assert updated["notes"] == SAMPLE["notes"]
    assert updated["updated_at"] >= app["updated_at"]

    cleared = auth_client.patch(f"{BASE}/{app['id']}", json={"notes": None})
    assert cleared.json()["notes"] is None


@pytest.mark.parametrize(
    "body",
    [
        {"position": "Intern"},  # missing company
        {"company": "", "position": "Intern"},  # blank company
        {"company": "A", "position": "B", "status": "HIRED"},  # bad enum
        {"company": "A", "position": "B", "job_url": "not a url"},
        {"company": "A", "position": "B", "date_applied": "yesterday"},
        {"company": "x" * 201, "position": "B"},
    ],
)
def test_create_validation(auth_client, body):
    assert auth_client.post(BASE, json=body).status_code == 422


def test_patch_rejects_null_required_fields(auth_client):
    app = auth_client.post(BASE, json=SAMPLE).json()
    for field in ("company", "position", "status"):
        response = auth_client.patch(f"{BASE}/{app['id']}", json={field: None})
        assert response.status_code == 422, field


def test_unknown_id_returns_404(auth_client):
    assert auth_client.get(f"{BASE}/999999").status_code == 404
    assert auth_client.patch(f"{BASE}/999999", json={"status": "OA"}).status_code == 404
    assert auth_client.delete(f"{BASE}/999999").status_code == 404


def test_summary_counts_by_status(auth_client):
    for status in ["APPLIED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]:
        auth_client.post(BASE, json={"company": "C", "position": "P", "status": status})

    summary = auth_client.get(f"{BASE}/summary").json()
    assert summary["total"] == 5
    assert summary["by_status"]["APPLIED"] == 2
    assert summary["by_status"]["INTERVIEW"] == 1
    assert summary["by_status"]["OFFER"] == 1
    assert summary["by_status"]["REJECTED"] == 1
    assert summary["by_status"]["SAVED"] == 0
    assert set(summary["by_status"]) == {
        "SAVED",
        "APPLIED",
        "OA",
        "INTERVIEW",
        "OFFER",
        "REJECTED",
        "WITHDRAWN",
    }
