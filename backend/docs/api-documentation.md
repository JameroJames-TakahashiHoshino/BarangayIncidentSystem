# Barangay Incident Reporting System API (MVP)

Base URL:
- `http://localhost:5000`

Auth header for protected endpoints:
- `Authorization: Bearer <token>`

## 1) Authentication Endpoints

### POST /api/auth/register
Description:
- Register a new user.

Request body:
```json
{
  "fullName": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "secret123",
  "role": "resident"
}
```

Success response (201):
```json
{
  "message": "User registered successfully.",
  "data": {
    "id": "...",
    "fullName": "Juan Dela Cruz",
    "email": "juan@example.com",
    "role": "resident",
    "token": "..."
  }
}
```

### POST /api/auth/login
Description:
- Login existing user.

Request body:
```json
{
  "email": "juan@example.com",
  "password": "secret123"
}
```

Success response (200):
```json
{
  "message": "Login successful.",
  "data": {
    "id": "...",
    "fullName": "Juan Dela Cruz",
    "email": "juan@example.com",
    "role": "resident",
    "token": "..."
  }
}
```

### GET /api/auth/me
Description:
- Get current logged in user profile.
- Protected: resident, admin, personnel

Success response (200):
```json
{
  "message": "Profile fetched successfully.",
  "data": {
    "_id": "...",
    "fullName": "Juan Dela Cruz",
    "email": "juan@example.com",
    "role": "resident"
  }
}
```

## 2) Resident Incident Endpoints

### POST /api/incidents
Description:
- Create incident report.
- Protected: resident only

Request body:
```json
{
  "title": "Street Fight",
  "description": "A fight happened near the market.",
  "location": "Barangay Hall Street",
  "incidentDate": "2026-04-24"
}
```

Success response (201):
```json
{
  "message": "Incident reported successfully.",
  "data": {
    "_id": "...",
    "title": "Street Fight",
    "status": "submitted"
  }
}
```

### GET /api/incidents/my-reports
Description:
- Get incidents created by logged in resident.
- Protected: resident only

## 3) Admin Incident Endpoints

### GET /api/incidents/admin/all
Description:
- Get all incidents.
- Protected: admin only

### PATCH /api/incidents/admin/:id
Description:
- Update incident status, assignment, and admin notes.
- Protected: admin only

Request body example:
```json
{
  "status": "assigned",
  "assignedTo": "<personnelUserId>",
  "adminNotes": "Please respond immediately."
}
```

## 4) Personnel Incident Endpoints

### GET /api/incidents/personnel/assigned
Description:
- Get incidents assigned to logged in personnel.
- Protected: personnel only

### PATCH /api/incidents/personnel/:id
Description:
- Update assigned incident status and personnel notes.
- Protected: personnel only

Request body example:
```json
{
  "status": "in_progress",
  "personnelNotes": "Team dispatched to location."
}
```

## 5) Common Error Format

Validation error (400):
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Title is required.",
      "path": "title",
      "location": "body"
    }
  ]
}
```

Unauthorized (401):
```json
{
  "message": "Unauthorized. Invalid token."
}
```

Forbidden (403):
```json
{
  "message": "Forbidden. Insufficient role."
}
```
