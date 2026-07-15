#!/usr/bin/env bash
# =============================================================================
# SentraISMS — curl API Test Suite
# PFE Testing — SentraISMS ISO 27001:2022 Platform
# Base URL: http://localhost:3001/api
# All seeded users share password: Dekra@2026
# =============================================================================

BASE="http://localhost:3001/api"

echo "========================================================"
echo " SentraISMS curl Test Suite"
echo " Make sure the backend is running on port 3001"
echo " and the database is seeded before running these tests."
echo "========================================================"

# ─── STEP 0: Obtain tokens ──────────────────────────────────────────────────

echo ""
echo "[STEP 0] Obtaining JWT tokens..."

# Security Officer token (used for most write operations)
SEC_OFFICER_RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"o.chraibi@dekra.ma","password":"Dekra@2026"}')
TOKEN=$(echo "$SEC_OFFICER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Security Officer token: ${TOKEN:0:40}..."

# Employee token (for RBAC test)
EMP_RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"l.bennani@dekra.ma","password":"Dekra@2026"}')
EMP_TOKEN=$(echo "$EMP_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Employee token:         ${EMP_TOKEN:0:40}..."

# Auditor token (for audit log test)
AUD_RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"k.mansouri@dekra.ma","password":"Dekra@2026"}')
AUD_TOKEN=$(echo "$AUD_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Auditor token:          ${AUD_TOKEN:0:40}..."

echo ""
echo "========================================================"

# ─── TC-01: Successful login ─────────────────────────────────────────────────
echo ""
echo "[TC-01] Login with valid credentials (Security Officer)"
echo "Expected: HTTP 200, token in response body"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"o.chraibi@dekra.ma","password":"Dekra@2026"}'

# ─── TC-02: Login with wrong password ───────────────────────────────────────
echo ""
echo "[TC-02] Login with wrong password"
echo "Expected: HTTP 401"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"o.chraibi@dekra.ma","password":"wrongpassword"}'

# ─── TC-03: Access protected endpoint without token ─────────────────────────
echo ""
echo "[TC-03] GET /api/risks with no Authorization header"
echo "Expected: HTTP 401"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X GET "$BASE/risks"

# ─── TC-04: RBAC — Employee calling DELETE /risks/:id ────────────────────────
echo ""
echo "[TC-04] DELETE /api/risks/any-id with Employee token"
echo "Expected: HTTP 403 (requires ISMS Manager level)"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X DELETE "$BASE/risks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $EMP_TOKEN"

# Show the error message too
echo "  Response body:"
curl -s -X DELETE "$BASE/risks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $EMP_TOKEN" | python3 -m json.tool 2>/dev/null || \
  curl -s -X DELETE "$BASE/risks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $EMP_TOKEN"

# ─── TC-05: Create a risk ────────────────────────────────────────────────────
echo ""
echo "[TC-05] POST /api/risks — create risk (likelihood=4, impact=5, riskScore=20)"
echo "Expected: HTTP 201, riskScore=20 in response"
RISK_RESPONSE=$(curl -s -X POST "$BASE/risks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Risk — PFE TC-05",
    "category": "Technical",
    "likelihood": 4,
    "impact": 5,
    "riskScore": 20,
    "owner": "Omar Chraibi",
    "treatment": "Mitigate",
    "status": "Open"
  }')
echo "  Response: $RISK_RESPONSE"
RISK_ID=$(echo "$RISK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Created Risk ID: $RISK_ID"

# ─── TC-06a: Link risk to control ────────────────────────────────────────────
echo ""
echo "[TC-06a] POST /api/risk-controls — link risk to control (first time)"
echo "Expected: HTTP 201"
RC_RESPONSE=$(curl -s -X POST "$BASE/risk-controls" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"riskId\": \"$RISK_ID\",
    \"controlId\": \"ctrl-a-5-1\",
    \"notes\": \"Initial link for PFE test\"
  }")
echo "  Response: $RC_RESPONSE"

# ─── TC-06b: Duplicate Risk-Control link (upsert) ────────────────────────────
echo ""
echo "[TC-06b] POST /api/risk-controls — same riskId+controlId (upsert)"
echo "Expected: HTTP 200/201, notes updated (no 409 error)"
curl -s -w "\n  HTTP Status: %{http_code}\n" \
  -X POST "$BASE/risk-controls" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"riskId\": \"$RISK_ID\",
    \"controlId\": \"ctrl-a-5-1\",
    \"notes\": \"Updated notes via upsert — TC-06b\"
  }"

# ─── TC-08a: Create incident (status: Open) ──────────────────────────────────
echo ""
echo "[TC-08a] POST /api/incidents — create incident (status: Open)"
echo "Expected: HTTP 201, status=Open"
INC_RESPONSE=$(curl -s -X POST "$BASE/incidents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Incident — PFE TC-08",
    "severity": "High",
    "type": "Phishing",
    "status": "Open",
    "reporter": "Omar Chraibi",
    "description": "Simulated phishing attempt for PFE testing"
  }')
echo "  Response: $INC_RESPONSE"
INC_ID=$(echo "$INC_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Created Incident ID: $INC_ID"

# ─── TC-08b: Update incident to In Progress ──────────────────────────────────
echo ""
echo "[TC-08b] PUT /api/incidents/:id — status transition to In Progress"
echo "Expected: HTTP 200, status=In Progress"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X PUT "$BASE/incidents/$INC_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"In Progress","assignee":"Omar Chraibi"}'

# ─── TC-08c: Close incident ──────────────────────────────────────────────────
echo ""
echo "[TC-08c] PUT /api/incidents/:id — status transition to Closed"
echo "Expected: HTTP 200, status=Closed"
CLOSE_RESPONSE=$(curl -s -X PUT "$BASE/incidents/$INC_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "Closed",
    "resolution": "Phishing attempt blocked. User re-trained.",
    "rootCause": "Social engineering via spoofed email"
  }')
echo "  Status field in response: $(echo $CLOSE_RESPONSE | grep -o '"status":"[^"]*"' | head -1)"

# ─── TC-07a: Evidence upload — valid file ────────────────────────────────────
echo ""
echo "[TC-07a] POST /api/evidence/upload — upload a small PDF"
echo "Expected: HTTP 201, fileName in response"
echo "  (Create a small test PDF first: echo '%PDF-1.4 test' > /tmp/test.pdf)"
echo "%PDF-1.4 SentraISMS PFE test evidence file" > /tmp/test-evidence.pdf
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X POST "$BASE/evidence/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-evidence.pdf" \
  -F "title=Test Evidence PFE TC-07" \
  -F "type=Document"

# ─── TC-07b: Evidence upload — oversized file ────────────────────────────────
echo ""
echo "[TC-07b] POST /api/evidence/upload — file > 10 MB"
echo "Expected: HTTP 413 or 500 (multer LIMIT_FILE_SIZE)"
echo "  (Generating 11MB test file...)"
dd if=/dev/zero of=/tmp/large-test-file.bin bs=1M count=11 2>/dev/null
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X POST "$BASE/evidence/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/large-test-file.bin" \
  -F "title=Oversized file test"
rm -f /tmp/large-test-file.bin

# ─── TC-09: Audit log retrieval ──────────────────────────────────────────────
echo ""
echo "[TC-09] GET /api/audit-logs?take=10 — retrieve audit log (Auditor token)"
echo "Expected: HTTP 200, array of log entries"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" \
  -X GET "$BASE/audit-logs?take=10" \
  -H "Authorization: Bearer $AUD_TOKEN"

echo ""
echo "========================================================"
echo " All curl tests completed."
echo " Compare HTTP status codes against expected values above."
echo "========================================================"
