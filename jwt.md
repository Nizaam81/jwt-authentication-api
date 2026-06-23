# JWT Authentication (Access Token + Refresh Token)

## What is Authentication?

Authentication is the process of verifying a user's identity.

Example:

```text
Email + Password
       ↓
Server verifies credentials
       ↓
User gets access
```

---

# What is JWT?

JWT (JSON Web Token) is a secure token used to identify authenticated users.

Example:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Instead of storing sessions on the server, JWT stores user information inside a signed token.

---

# JWT Structure

A JWT consists of 3 parts:

```text
Header.Payload.Signature
```

Example:

```text
xxxxx.yyyyy.zzzzz
```

---

## 1. Header

Contains information about the token.

Example:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

* `alg` → Algorithm used for signing.
* `typ` → Token type.

---

## 2. Payload

Contains actual user data.

Example:

```json
{
  "id": "123",
  "email": "user@gmail.com"
}
```

Payload is readable by anyone.

Never store:

* Passwords
* Credit card details
* Sensitive information

inside a JWT.

---

## 3. Signature

Created using:

```js
jwt.sign(payload, secret)
```

Purpose:

```text
Prevent token tampering.
```

If someone changes the payload, the signature becomes invalid and the token is rejected.

---

# What is Stateless?

Stateless means:

```text
Server does not remember users.
```

Every request must contain all information required to identify the user.

Example:

```text
Request
 ↓
JWT Sent
 ↓
Server Verifies
 ↓
Response
```

The server does not store session data.

---

# What is Scalability?

Scalability means:

```text
Ability to handle more users efficiently.
```

JWT is scalable because:

* No session storage
* No session database lookups
* Easy to distribute across multiple servers

---

# Why JWT Instead of Sessions?

### Session Authentication

```text
Login
 ↓
Server creates session
 ↓
Session stored on server
 ↓
Browser stores Session ID
```

### JWT Authentication

```text
Login
 ↓
Server creates JWT
 ↓
Browser stores JWT
 ↓
JWT sent with requests
```

JWT is easier to scale because the server does not store session information.

---

# Access Token

Purpose:

```text
Access protected APIs.
```

Contains:

```json
{
  "id": "123",
  "email": "user@gmail.com"
}
```

Lifetime:

```text
Short
(15 minutes, 30 minutes, etc.)
```

Storage:

```text
localStorage
```

Used on:

```text
Every protected request.
```

---

# Refresh Token

Purpose:

```text
Generate new Access Tokens.
```

Contains:

```json
{
  "id": "123"
}
```

Lifetime:

```text
Long
(7 days, 30 days, etc.)
```

Storage:

```text
HttpOnly Cookie
```

Used only when:

```text
Access Token expires.
```

---

# Why Access Token and Refresh Token?

Without Refresh Token:

```text
Access Token expires
        ↓
User logs in again
```

Poor user experience.

With Refresh Token:

```text
Access Token expires
        ↓
Refresh Token verified
        ↓
New Access Token created
        ↓
User stays logged in
```

---

# Are They Created Differently?

No.

Both are created using:

```js
jwt.sign(payload, secret, options)
```

The difference is:

| Access Token           | Refresh Token             |
| ---------------------- | ------------------------- |
| Access APIs            | Create new Access Tokens  |
| Short lifetime         | Long lifetime             |
| Stored in localStorage | Stored in HttpOnly Cookie |
| Sent on every request  | Sent only for refresh     |

---

# JWT Methods

## Create Token

```js
jwt.sign(payload, secret)
```

Creates a new JWT.

---

## Verify Token

```js
jwt.verify(token, secret)
```

Checks:

```text
Was this token created by me?
```

If valid:

```text
Request allowed
```

If invalid:

```text
Request rejected
```

---

# Axios Interceptors

An interceptor runs automatically before a request or after a response.

## Request Interceptor

```text
Request
 ↓
Interceptor
 ↓
Add Access Token
 ↓
Server
```

Purpose:

```text
Automatically attach JWT to requests.
```

---

## Response Interceptor

```text
Server Response
 ↓
Interceptor
 ↓
401 Unauthorized?
 ↓
Refresh Token Flow
```

Purpose:

```text
Automatically generate a new Access Token when the old one expires.
```

---

# Complete Flow

```text
Login
 ↓
Verify Credentials
 ↓
Generate Access Token
 ↓
Generate Refresh Token
 ↓
Access Token → localStorage
 ↓
Refresh Token → HttpOnly Cookie
 ↓
Protected Request
 ↓
Access Token Verification
 ↓
Success

Access Token Expired
 ↓
401 Unauthorized
 ↓
Refresh Token Verification
 ↓
Generate New Access Token
 ↓
Retry Original Request
 ↓
Success
```
