# SentraISMS API Test Suite — PowerShell
# Run from any directory: pwsh -File docs/testing/Test-API.ps1
# Requires: curl.exe (ships with Windows 10/11)

$BASE = "http://localhost:3001/api"
$tmp = $env:TEMP

function Invoke-API {
    param($Method, $Path, $Body, $Token)
    $args = @("-s", "-X", $Method, "$BASE$Path")
    if ($Token) { $args += @("-H", "Authorization: Bearer $Token") }
    if ($Body) {
        $file = [System.IO.Path]::GetTempFileName()
        $Body | Out-File -FilePath $file -Encoding utf8 -NoNewline
        $args += @("-H", "Content-Type: application/json", "-d", "@$file")
    }
    $result = & curl.exe @args
    if ($file) { Remove-Item $file -ErrorAction SilentlyContinue }
    return $result
}

function Extract-Field {
    param($Json, $Field)
    if ($Json -match "`"$Field`":`"([^`"]+)`"") { return $Matches[1] }
    if ($Json -match "`"$Field`":([0-9]+)") { return $Matches[1] }
    return $null
}

Write-Host "========================================================"
Write-Host " SentraISMS PowerShell Test Suite"
Write-Host " Backend must be running on http://localhost:3001"
Write-Host "========================================================"

# ── STEP 0: Obtain tokens ──────────────────────────────────────────
Write-Host "`n[STEP 0] Obtaining JWT tokens..."

$loginBody = '{"email":"o.chraibi@dekra.ma","password":"Dekra@2026"}'
$secResp = Invoke-API -Method POST -Path "/auth/login" -Body $loginBody
$TOKEN = Extract-Field $secResp "token"
Write-Host "Security Officer token: $($TOKEN.Substring(0, [Math]::Min(40,$TOKEN.Length)))..."

$empBody = '{"email":"l.bennani@dekra.ma","password":"Dekra@2026"}'
$empResp = Invoke-API -Method POST -Path "/auth/login" -Body $empBody
$EMP_TOKEN = Extract-Field $empResp "token"
Write-Host "Employee token:         $($EMP_TOKEN.Substring(0, [Math]::Min(40,$EMP_TOKEN.Length)))..."

$audBody = '{"email":"k.mansouri@dekra.ma","password":"Dekra@2026"}'
$audResp = Invoke-API -Method POST -Path "/auth/login" -Body $audBody
$AUD_TOKEN = Extract-Field $audResp "token"
Write-Host "Auditor token:          $($AUD_TOKEN.Substring(0, [Math]::Min(40,$AUD_TOKEN.Length)))..."

Write-Host "`n========================================================"

# ── TC-01: Successful login ────────────────────────────────────────
Write-Host "`n[TC-01] Login with valid credentials"
Write-Host "Expected: HTTP 201, token in response"
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "@$(($f=[System.IO.Path]::GetTempFileName()); '{"email":"o.chraibi@dekra.ma","password":"Dekra@2026"}' | Out-File $f -Encoding utf8 -NoNewline; $f)"
Write-Host "  HTTP Status: $code"

# ── TC-02: Wrong password ──────────────────────────────────────────
Write-Host "`n[TC-02] Login with wrong password"
Write-Host "Expected: HTTP 401"
$f2 = [System.IO.Path]::GetTempFileName()
'{"email":"o.chraibi@dekra.ma","password":"wrongpassword"}' | Out-File $f2 -Encoding utf8 -NoNewline
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "@$f2"
Remove-Item $f2
Write-Host "  HTTP Status: $code"

# ── TC-03: No auth header ──────────────────────────────────────────
Write-Host "`n[TC-03] GET /api/risks with no Authorization header"
Write-Host "Expected: HTTP 401"
$code = & curl.exe -s -o NUL -w "%{http_code}" -X GET "$BASE/risks"
Write-Host "  HTTP Status: $code"

# ── TC-04: RBAC — Employee calling DELETE ─────────────────────────
Write-Host "`n[TC-04] DELETE /api/risks/:id with Employee token"
Write-Host "Expected: HTTP 403"
$code = & curl.exe -s -o NUL -w "%{http_code}" -X DELETE "$BASE/risks/00000000-0000-0000-0000-000000000000" -H "Authorization: Bearer $EMP_TOKEN"
Write-Host "  HTTP Status: $code"

# ── TC-05: Create a risk ──────────────────────────────────────────
Write-Host "`n[TC-05] POST /api/risks — create risk (likelihood=4, impact=5, riskScore=20)"
Write-Host "Expected: HTTP 201, riskScore=20"
$f5 = [System.IO.Path]::GetTempFileName()
'{"title":"Test Risk PFE TC-05","category":"Technical","likelihood":4,"impact":5,"riskScore":20,"owner":"Omar Chraibi","treatment":"Mitigate","status":"Open"}' | Out-File $f5 -Encoding utf8 -NoNewline
$riskResp = & curl.exe -s -X POST "$BASE/risks" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f5"
Remove-Item $f5
$RISK_ID = Extract-Field $riskResp "id"
Write-Host "  Response: $riskResp"
Write-Host "  Risk ID: $RISK_ID"

# ── TC-06a: Link risk to control ──────────────────────────────────
Write-Host "`n[TC-06a] POST /api/risk-controls — first link"
Write-Host "Expected: HTTP 201"
$f6a = [System.IO.Path]::GetTempFileName()
"{`"riskId`":`"$RISK_ID`",`"controlId`":`"ctrl-a-5-1`",`"notes`":`"Initial link TC-06a`"}" | Out-File $f6a -Encoding utf8 -NoNewline
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/risk-controls" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f6a"
Remove-Item $f6a
Write-Host "  HTTP Status: $code"

# ── TC-06b: Duplicate link (upsert) ───────────────────────────────
Write-Host "`n[TC-06b] POST /api/risk-controls — duplicate (upsert, notes updated)"
Write-Host "Expected: HTTP 201, no 409"
$f6b = [System.IO.Path]::GetTempFileName()
"{`"riskId`":`"$RISK_ID`",`"controlId`":`"ctrl-a-5-1`",`"notes`":`"Updated notes via upsert TC-06b`"}" | Out-File $f6b -Encoding utf8 -NoNewline
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/risk-controls" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f6b"
Remove-Item $f6b
Write-Host "  HTTP Status: $code"

# ── TC-08a: Create incident ────────────────────────────────────────
Write-Host "`n[TC-08a] POST /api/incidents — create (status: Open)"
Write-Host "Expected: HTTP 201"
$f8a = [System.IO.Path]::GetTempFileName()
'{"title":"Test Incident PFE TC-08","severity":"High","type":"Phishing","status":"Open","reporter":"Omar Chraibi","description":"Simulated phishing for PFE testing"}' | Out-File $f8a -Encoding utf8 -NoNewline
$incResp = & curl.exe -s -X POST "$BASE/incidents" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f8a"
Remove-Item $f8a
$INC_ID = Extract-Field $incResp "id"
Write-Host "  Response: $incResp"
Write-Host "  Incident ID: $INC_ID"

# ── TC-08b: Update to In Progress ────────────────────────────────
Write-Host "`n[TC-08b] PUT /api/incidents/:id — In Progress"
Write-Host "Expected: HTTP 200"
$f8b = [System.IO.Path]::GetTempFileName()
'{"status":"In Progress","assignee":"Omar Chraibi"}' | Out-File $f8b -Encoding utf8 -NoNewline
$code = & curl.exe -s -o NUL -w "%{http_code}" -X PUT "$BASE/incidents/$INC_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f8b"
Remove-Item $f8b
Write-Host "  HTTP Status: $code"

# ── TC-08c: Close incident ────────────────────────────────────────
Write-Host "`n[TC-08c] PUT /api/incidents/:id — Closed"
Write-Host "Expected: HTTP 200, status=Closed"
$f8c = [System.IO.Path]::GetTempFileName()
'{"status":"Closed","resolution":"Phishing attempt blocked. User re-trained.","rootCause":"Social engineering via spoofed email"}' | Out-File $f8c -Encoding utf8 -NoNewline
$closeResp = & curl.exe -s -X PUT "$BASE/incidents/$INC_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "@$f8c"
Remove-Item $f8c
$closedStatus = Extract-Field $closeResp "status"
Write-Host "  Status in response: $closedStatus"

# ── TC-07a: Evidence upload — small file ──────────────────────────
Write-Host "`n[TC-07a] POST /api/evidence/upload — small PDF"
Write-Host "Expected: HTTP 201"
$pdfPath = "$tmp\test-evidence-pfe.pdf"
"%PDF-1.4 SentraISMS PFE test evidence file" | Out-File $pdfPath -Encoding ascii
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/evidence/upload" -H "Authorization: Bearer $TOKEN" -F "file=@$pdfPath" -F "title=Test Evidence PFE TC-07" -F "type=Document"
Remove-Item $pdfPath
Write-Host "  HTTP Status: $code"

# ── TC-07b: Evidence upload — oversized file ──────────────────────
Write-Host "`n[TC-07b] POST /api/evidence/upload — 11 MB file"
Write-Host "Expected: HTTP 413"
$bigPath = "$tmp\large-test-pfe.bin"
$bytes = New-Object byte[] (11 * 1024 * 1024)
[System.IO.File]::WriteAllBytes($bigPath, $bytes)
$code = & curl.exe -s -o NUL -w "%{http_code}" -X POST "$BASE/evidence/upload" -H "Authorization: Bearer $TOKEN" -F "file=@$bigPath" -F "title=Oversized file test"
Remove-Item $bigPath
Write-Host "  HTTP Status: $code"

# ── TC-09: Audit log retrieval ─────────────────────────────────────
Write-Host "`n[TC-09] GET /api/audit-logs?take=10 — Auditor token"
Write-Host "Expected: HTTP 200"
$code = & curl.exe -s -o NUL -w "%{http_code}" -X GET "$BASE/audit-logs?take=10" -H "Authorization: Bearer $AUD_TOKEN"
Write-Host "  HTTP Status: $code"

Write-Host "`n========================================================"
Write-Host " All tests completed. Compare HTTP codes above."
Write-Host "========================================================"
