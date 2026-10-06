from tests.conftest import PASSWORD, register


def test_register_sets_httponly_session_cookie(client):
    response = register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "password_hash" not in body and "password" not in body
    set_cookie = response.headers["set-cookie"].lower()
    assert "session=" in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie


def test_register_normalizes_email_and_rejects_duplicates(client):
    assert register(client, "Alice@Example.com").status_code == 201
    response = register(client, "alice@example.com")
    assert response.status_code == 409


def test_register_validates_input(client):
    assert register(client, "not-an-email").status_code == 422
    assert register(client, "bob@example.com", "short").status_code == 422


def test_me_requires_auth(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_returns_current_user(auth_client):
    response = auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"
    assert "password_hash" not in response.json()


def test_login_success_and_failure(client):
    register(client)
    client.cookies.clear()

    bad_pw = client.post(
        "/api/v1/auth/login", json={"email": "alice@example.com", "password": "wrong-password"}
    )
    unknown = client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": PASSWORD}
    )
    assert bad_pw.status_code == unknown.status_code == 401
    assert bad_pw.json() == unknown.json()  # no user enumeration

    creds = {"email": "alice@example.com", "password": PASSWORD}
    ok = client.post("/api/v1/auth/login", json=creds)
    assert ok.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200


def test_logout_revokes_session_server_side(auth_client):
    token = auth_client.cookies.get("session")
    assert auth_client.post("/api/v1/auth/logout").status_code == 204
    assert auth_client.get("/api/v1/auth/me").status_code == 401

    # Replaying the old cookie must not work: the session row is gone.
    auth_client.cookies.set("session", token)
    assert auth_client.get("/api/v1/auth/me").status_code == 401


def test_garbage_session_cookie_rejected(client):
    client.cookies.set("session", "forged-token")
    assert client.get("/api/v1/auth/me").status_code == 401
