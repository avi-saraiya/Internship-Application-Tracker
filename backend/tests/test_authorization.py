"""Users must never be able to see or modify another user's applications."""

BASE = "/api/v1/applications"


def test_users_cannot_access_each_others_applications(make_client):
    alice = make_client("alice@example.com")
    bob = make_client("bob@example.com")

    alice_app = alice.post(BASE, json={"company": "Shopify", "position": "Intern"}).json()
    bob.post(BASE, json={"company": "Stripe", "position": "Intern"})

    # Lists are scoped to the caller.
    assert [a["company"] for a in alice.get(BASE).json()] == ["Shopify"]
    assert [a["company"] for a in bob.get(BASE).json()] == ["Stripe"]

    # Direct access by id looks like "not found" to the other user.
    url = f"{BASE}/{alice_app['id']}"
    assert bob.get(url).status_code == 404
    assert bob.patch(url, json={"status": "REJECTED"}).status_code == 404
    assert bob.delete(url).status_code == 404

    # Alice's record is untouched.
    still_there = alice.get(url)
    assert still_there.status_code == 200
    assert still_there.json()["status"] == "SAVED"

    # Summaries are per-user.
    assert alice.get(f"{BASE}/summary").json()["total"] == 1
    assert bob.get(f"{BASE}/summary").json()["total"] == 1


def test_client_supplied_user_id_is_ignored(make_client):
    alice = make_client("alice@example.com")
    bob = make_client("bob@example.com")
    bob_id = bob.get("/api/v1/auth/me").json()["id"]

    alice.post(BASE, json={"company": "Sneaky", "position": "Intern", "user_id": bob_id})
    assert bob.get(BASE).json() == []
    assert len(alice.get(BASE).json()) == 1
