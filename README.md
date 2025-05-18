# QA Home Assignment

## 🧪 Project Overview

This project is a backend API testing assignment for a simple Python Flask service running inside Docker. It exposes three endpoints:

- `GET /api-1`: Returns a basic success response.
- `POST /api-2`: Authenticates a user and returns a numeric token valid for 120 seconds.
- `POST /api-3`: Accepts two numbers and returns their sum. Requires a valid token in the `Authorization` header.

## 🚀 Setup Instructions

### Prerequisites:

- Docker + Docker Compose
- Node.js and npm (for running automated tests)

### Running the Backend:

```bash
# Build and start the containers
docker-compose up --build

# To run in detached mode
docker-compose up -d --build

# To stop the containers
docker-compose down
```

Once running, the APIs should be accessible at http://localhost:8080.

## ✅ How to Run Tests

### Manual Test Cases

All manual test cases are documented in `API_Test_Cases.xlsx`. This file contains test scenarios, expected results, and test data for each endpoint.

### Automated Tests (Mocha + Chai HTTP):

Install dependencies:

```bash
# Install project dependencies
npm install
```

Run tests:

```bash
# Run all tests
npm test


## 💡 Test Design Commentary

### API-1 (Basic Success Check)

**Why:** Verifies basic connectivity and that the endpoint responds as expected.

**Includes:**

- Status code validation (200 OK)
- Invalid method test (POST, PUT, DELETE)
- Query parameter handling
- Response format validation

### API-2 (Authentication Logic)

**Why:** Tests valid and invalid login flows, including:

- Case sensitivity of username
- Handling of missing, empty, or malformed fields
- Proper token issuance and format
- Token expiration (120 seconds)

**Covers:** Both positive (valid credentials) and negative (wrong or malformed input) scenarios.

### API-3 (Arithmetic Operations)

**Why:** Tests input validation, token verification, and type handling.

**Covers:**

- Missing token / invalid token
- Type coercion with strings
- Missing fields
- null / undefined values
- Extra payload fields
- Large number handling
- Decimal number handling

### Concurrency & Parallelism

**Why:** Simulates real-world usage under concurrent load.

**Tests include:**

- Multiple valid sessions
- Simultaneous login and arithmetic requests
- Handling of invalid concurrent requests
- Token expiration during concurrent requests

## 📦 File Structure

```
/tests                  # Mocha test files
  ├── api1.test.js     # Tests for basic success endpoint
  ├── api2.test.js     # Tests for authentication endpoint
  └── api3.test.js     # Tests for arithmetic endpoint
docker-compose.yml      # Spins up Flask backend
API_Test_Cases.xlsx     # Manual test cases
README.md              # Project documentation
package.json           # Node.js dependencies and scripts
```

## 🛠 Suggested Improvements for the Backend

While working on the tests, I noticed a few things in the backend that could be cleaned up or improved to make it more solid and production-ready:

### 1. Missing `Content-Type: application/json`

- **What’s happening:** The API responses return JSON data, but the `Content-Type` header isn’t explicitly set.
- **Why it matters:** Some clients might not treat the response as proper JSON, which could cause unexpected issues.
- **Quick fix:** Add `content_type='application/json'` in the `Response()` calls.

### 2. Dangerous Token Format

- **What’s happening:** Tokens are a UNIX timestamp.
- **Why it matters:** These are predictable and not really secure.
- **Suggestion:** Use some kind of random token with an expiration time.

### 3. Error Handling

- **What’s happening:** Most errors return a 501, even if it’s a bad request or auth issue.
- **Why it matters:** This makes it harder for clients to handle errors properly.
- **Suggestion:** Return appropriate status codes like 400, 401, 404, or 500 based on the situation.

### 4. No Input Validation

- **What’s happening:** There’s almost no validation on the incoming data.
- **Why it matters:** This could lead to type conversion issues or even crashes.
- **Suggestion:** Add basic checks or use a library.

### 5. Missing Method Handling

- **What’s happening:** If you send a wrong method (like POST to `/api-1`), you get a default HTML error page.
- **Why it matters:** That’s not ideal for APIs.
- **Suggestion:** Add proper method handling and return clean JSON error responses.
