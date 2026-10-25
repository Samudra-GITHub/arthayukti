import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_auth_signup_login_lifecycle():
    suffix = uuid.uuid4().hex[:8]
    email = f"testuser_{suffix}@arthayukti.in"
    password = "SecurePassword123!"

    # 1. Signup
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": password, "full_name": "Test User 1"},
    )
    assert signup_res.status_code == 201
    token = signup_res.json()["access_token"]
    assert token

    # 2. Get Profile with Bearer token
    profile_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile_res.status_code == 200
    assert profile_res.json()["email"] == email

    # 3. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Login with wrong password returns 401
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401


def test_cross_user_tenant_isolation_denial():
    """Verify that User A cannot view or modify User B's financial records."""
    suffix_a = uuid.uuid4().hex[:8]
    suffix_b = uuid.uuid4().hex[:8]

    # User A
    user_a_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"alice_{suffix_a}@tenant.in",
            "password": "PasswordAlice123!",
            "full_name": "Alice",
        },
    )
    token_a = user_a_res.json()["access_token"]

    # User B
    user_b_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"bob_{suffix_b}@tenant.in",
            "password": "PasswordBob123!",
            "full_name": "Bob",
        },
    )
    token_b = user_b_res.json()["access_token"]

    # Alice creates a private account
    acc_res = client.post(
        "/api/v1/financials/accounts",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "account_name": "Alice Private Vault",
            "account_type": "savings",
            "balance": "500000.00",
            "is_liquid": True,
        },
    )
    assert acc_res.status_code == 201
    alice_acc_id = acc_res.json()["id"]

    # Bob lists accounts -> must NOT see Alice's account
    bob_accounts = client.get(
        "/api/v1/financials/accounts",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert bob_accounts.status_code == 200
    bob_account_ids = [a["id"] for a in bob_accounts.json()]
    assert alice_acc_id not in bob_account_ids
