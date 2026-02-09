Table users {
  id bigint [pk, increment]
  email varchar [unique, not null]
  name varchar [not null]
  password_hash varchar [not null]
  type varchar [not null]
  created_by bigint [ref: > users.id, null]
}

Table tests {
  id bigint [pk, increment]
  title varchar
  description text
  created_by bigint [not null, ref: > users.id]
  start_time datetime
  end_time datetime
  total_marks int
  published boolean
  max_attempts int
}

Table questions {
  id bigint [pk, increment]
  test_id bigint [not null, ref: > tests.id]
  question_text text
  marks int
  question_type varchar

  option_a varchar
  option_b varchar
  option_c varchar
  option_d varchar
  correct_option varchar
  correct_answer varchar
}

Table test_attempts {
  id bigint [pk, increment]
  test_id bigint [not null, ref: > tests.id]
  student_id bigint [not null, ref: > users.id]
  attempt_number int [not null]
  started_at datetime
  submitted_at datetime
  score int
  completed boolean
}

Table answers {
  id bigint [pk, increment]
  attempt_id bigint [not null, ref: > test_attempts.id]
  question_id bigint [not null, ref: > questions.id]
  answer_text varchar
  correct boolean
}

Table session_reports {
  id bigint [pk, increment]
  attempt_id bigint [not null, unique, ref: > test_attempts.id]

  heads_turned int
  head_tilts int
  look_aways int
  multiple_people int
  face_visibility_issues int
  mobile_detected int
  audio_incidents int

  is_valid_test boolean
  invalid_reason text

  created_at datetime
  updated_at datetime
}

### Base URL, auth, and headers
- Base path: `/api`
- Public endpoints: `/api/auth/**`
- All other endpoints require JWT Bearer token in header:
  - `Authorization: Bearer <JWT>`
  - `Content-Type: application/json`

 host/port, e.g., `http://localhost:8080`.

---

### 1) Auth and hierarchy setup

#### 1.1 Create the initial SUPERADMIN (one-time)
```
POST /api/auth/init-superadmin
Content-Type: application/json
{
  "name": "Super",
  "email": "super@lms.com",
  "password": "superpass"
}
```

#### 1.2 Login as SUPERADMIN to get token
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "super@lms.com",
  "password": "superpass"
}
```
Response body contains `data.token` — save it as `SUPER_TOKEN`.


#### 1.3 SUPERADMIN creates an ADMIN
```
POST /api/auth/create-admin
Authorization: Bearer ${SUPER_TOKEN}
Content-Type: application/json
{
  "name": "Admin A",
  "email": "adminA@lms.com",
  "password": "adminpass"
}
```

#### 1.4 Login as ADMIN
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "adminA@lms.com",
  "password": "adminpass"
}
```

#### 1.5 ADMIN creates USERS (students)
```
POST /api/auth/create-user
Authorization: Bearer ${ADMIN_TOKEN}
Content-Type: application/json
{
  "name": "John",
  "email": "john@lms.com",
  "password": "johnpass"
}
```
Repeat for Mary:
```
{
  "name": "Mary",
  "email": "mary@lms.com",
  "password": "marypass"
}
```

#### 1.6 Login as USER (student)
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@lms.com",
  "password": "johnpass"
}
```
Save token as `JOHN_TOKEN`.

---

### 2) Tests (ADMIN)

#### 2.1 Create a test
```
POST /api/tests
Authorization: Bearer ${ADMIN_TOKEN}
Content-Type: application/json
{
  "title": "Java Basics",
  "description": "Intro to Java",
  "startTime": "2026-01-10T10:00:00",
  "endTime": "2026-01-10T11:00:00",
  "totalMarks": 20,
  "published": true,
  "maxAttempts": 1
}
```
Note: If the current time is outside the window, students won't see/start it. Use near-now times while testing.

Response returns the created test with `id` (use as `${TEST_ID}`).

#### 2.2 Update test meta/times
```
PATCH /api/tests/{id}
Authorization: Bearer ${ADMIN_TOKEN}
Content-Type: application/json
{
  "title": "Java Basics v2",
  "description": "Updated",
  "startTime": "2026-01-10T10:00:00",
  "endTime": "2026-01-10T11:05:00",
  "totalMarks": 25
}
```

#### 2.3 Publish test (idempotent)
```
PATCH /api/tests/{id}/publish
Authorization: Bearer ${ADMIN_TOKEN}
```

#### 2.4 List my tests (ADMIN) or all (SUPERADMIN)
```
GET /api/tests/mine
Authorization: Bearer ${ADMIN_TOKEN}
```

#### 2.5 List available tests (for a USER within time window and published)
```
GET /api/tests/available
Authorization: Bearer ${JOHN_TOKEN}
```

---

### 3) Questions (ADMIN or SUPERADMIN)
Add questions to the created test `${TEST_ID}`.

Common header:
- `Authorization: Bearer ${ADMIN_TOKEN}`
- `Content-Type: application/json`

#### 3.1 MCQ (single correct)
```
POST /api/tests/{testId}/questions
{
  "questionType": "MCQ",
  "questionText": "What is JVM?",
  "marks": 10,
  "negativeMarks": 0,
  "optionA": "Java Virtual Machine",
  "optionB": "Java Variable Method",
  "optionC": "Java Vendor Machine",
  "optionD": "None",
  "correctOption": "A"
}
```

#### 3.2 MAQ (multiple correct)
```
POST /api/tests/{testId}/questions
{
  "questionType": "MAQ",
  "questionText": "Select all OOP principles.",
  "marks": 10,
  "negativeMarks": 0,
  "optionA": "Encapsulation",
  "optionB": "Polymorphism",
  "optionC": "Compilation",
  "optionD": "Inheritance",
  "correctOptionsCsv": "A,B,D"
}
```

#### 3.3 FILL_BLANK
Normalization: case-insensitive, trims, removes spaces/dashes/underscores before compare.
```
POST /api/tests/{testId}/questions
{
  "questionType": "FILL_BLANK",
  "questionText": "Java is an _____ language.",
  "marks": 5,
  "negativeMarks": 0,
  "correctAnswer": "object-oriented"
}
```

#### 3.4 List questions
```
GET /api/tests/{testId}/questions
Authorization: Bearer ${ADMIN_TOKEN}
```

#### 3.5 Update a question (full or partial)
```
PUT /api/questions/{questionId}
Authorization: Bearer ${ADMIN_TOKEN}
Content-Type: application/json
{
  "questionType": "MCQ",
  "questionText": "What does JVM stand for?",
  "marks": 10,
  "negativeMarks": 0,
  "optionA": "Java Virtual Machine",
  "optionB": "Java Variable Method",
  "optionC": "Java Vendor Machine",
  "optionD": "None",
  "correctOption": "A"
}
```

#### 3.6 Delete a question
```
DELETE /api/questions/{questionId}
Authorization: Bearer ${ADMIN_TOKEN}
```

---

### 4) Attempts & answering (USER)

#### 4.1 Start an attempt
```
POST /api/tests/{testId}/attempts
Authorization: Bearer ${JOHN_TOKEN}
Content-Type: application/json
{}
```
Response returns attempt with `id` — save as `${ATTEMPT_ID}`.

#### 4.2 Submit/Update an answer
- For MCQ single: `"A"`
- For MAQ multiple: `"A,B,D"` (order doesn’t matter)
- For FILL_BLANK: free text, normalization applied as noted
```
POST /api/attempts/{attemptId}/answers
Authorization: Bearer ${JOHN_TOKEN}
Content-Type: application/json
{
  "questionId": 201,
  "answerText": "A"
}
```
Another example (MAQ):
```
{
  "questionId": 202,
  "answerText": "B,A,D"
}
```

#### 4.3 Submit attempt (finalize and compute score)
```
POST /api/attempts/{attemptId}/submit
Authorization: Bearer ${JOHN_TOKEN}
```

#### 4.4 Get my attempt
```
GET /api/attempts/{attemptId}
Authorization: Bearer ${JOHN_TOKEN}
```

---

### 5) Session reports (proctoring)
Allowed for the student who owns the attempt and the admin who owns the test.

#### 5.1 Upsert/incremental update during test
```
POST /api/attempts/{attemptId}/session-report
Authorization: Bearer ${JOHN_TOKEN}   # or ADMIN_TOKEN
Content-Type: application/json
{
  "headsTurned": 1,
  "headTilts": 0,
  "lookAways": 2,
  "multiplePeople": 0,
  "faceVisibilityIssues": 0,
  "mobileDetected": 0,
  "audioIncidents": 0
}
```

#### 5.2 Finalize validity
```
POST /api/attempts/{attemptId}/session-report/finalize
Authorization: Bearer ${ADMIN_TOKEN}   # or JOHN_TOKEN
Content-Type: application/json
{
  "isValidTest": true,
  "invalidReason": null
}
```

#### 5.3 Get session report
```
GET /api/attempts/{attemptId}/session-report
Authorization: Bearer ${ADMIN_TOKEN}   # or JOHN_TOKEN
```

---

### 6) Results

#### 6.1 Admin: all results for my tests (Superadmin: all)
```
GET /api/admin/results
Authorization: Bearer ${ADMIN_TOKEN}   # SUPERADMIN sees all when using SUPER_TOKEN
```

#### 6.2 Admin/Superadmin: results for a specific test
```
GET /api/admin/tests/{testId}/results
Authorization: Bearer ${ADMIN_TOKEN}
```

#### 6.3 User: my own results
```
GET /api/me/results
Authorization: Bearer ${JOHN_TOKEN}
```

---