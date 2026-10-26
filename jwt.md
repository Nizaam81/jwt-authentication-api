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


---

# Token Rotation, Blacklisting, and Revocation

## 1. Refresh Token Rotation

Refresh token rotation means issuing a new refresh token whenever an existing refresh token is successfully used.

The old refresh token is invalidated, and the new refresh token is used for the next refresh request.

### Example

```text
Access Token A expires
          ↓
Browser sends Refresh Token A
          ↓
Server verifies Refresh Token A
          ↓
Server invalidates Refresh Token A
          ↓
Server generates:
  - New Access Token B
  - New Refresh Token B
          ↓
Browser uses the new tokens
```

### Why is Refresh Token Rotation Important?

Suppose an attacker steals Refresh Token A.

1. The legitimate user uses Refresh Token A to obtain new tokens.
2. The server invalidates Refresh Token A and issues Refresh Token B.
3. The attacker tries to use the old Refresh Token A.
4. The server detects that the token has already been used.
5. If refresh token reuse detection is implemented, the server can revoke the entire token family and require the user to log in again.

This helps detect stolen refresh tokens.

**Important:** Refresh token rotation does not automatically prevent every attack. The server must track token usage and implement reuse detection correctly.

---

## 2. What Is Token Blacklisting?

Token blacklisting means marking a token as revoked before its expiration time.

Normally, a JWT remains valid until it expires, provided its signature and other required checks pass.

However, sometimes we need to invalidate a token immediately.

Examples:

- A user logs out.
- A token is stolen.
- An administrator disables an account.
- A security incident requires a session to be terminated.

Token blacklisting allows the backend to reject a revoked token even if it has not expired.

### Example

Suppose an access token has a lifetime of 15 minutes.

```text
10:00 AM → User logs in
10:00 AM → Access token is issued
10:03 AM → User logs out
10:03 AM → Token is revoked
10:05 AM → Someone tries to use the token
```

Although the token has not expired, the backend rejects it because it has been revoked.

### How Does Token Blacklisting Work?

```text
User logs out
      ↓
Backend revokes the token
      ↓
Token ID or token hash is stored
in a blacklist or revocation store
      ↓
A new API request arrives
      ↓
Middleware verifies the JWT
      ↓
Middleware checks the revocation store
      ↓
Token revoked?
      ↓
Yes → Reject the request
```

### Where Are Blacklisted Tokens Stored?

Common options include:

- **Redis:** Fast lookups and automatic expiration using TTL.
- **Database:** Persistent storage for revoked-token records.
- **In-memory storage:** Useful for learning, but unsuitable for most production applications.

The server can store a token identifier (`jti`) or a hash of the token rather than storing the raw JWT.

Blacklist entries generally only need to remain until the corresponding token expires.

---

## 3. Token Revocation

Token revocation means making a token or session no longer valid before its normal expiration.

Blacklisting is one way to implement revocation.

Revocation can also be implemented by marking a refresh-token record or session as revoked in a database.

### Example

```text
User logs out
      ↓
Backend revokes the refresh session
      ↓
Refresh token can no longer be used
      ↓
User cannot obtain new access tokens
```

However, revoking only the refresh token does not automatically invalidate an already-issued access token.

If immediate rejection of an access token is required, the backend must also check its revocation status or use another appropriate server-side mechanism.

---

## 4. Refresh Token Rotation vs. Token Blacklisting

| Feature | Refresh Token Rotation | Token Blacklisting |
|---|---|---|
| Purpose | Replace refresh tokens and help detect reuse | Reject revoked tokens |
| When it happens | When a refresh token is used | When a token or session is revoked |
| Old token | Invalidated after successful rotation | Rejected if recorded as revoked |
| Common use case | Refreshing access tokens securely | Logout and security-related revocation |

Both techniques can be used together in the same authentication system.

---

## 5. Access Token vs. Refresh Token Revocation

These two concepts are important to understand.

### Access Token Revocation

An access token is used to access protected APIs.

If an access token is revoked, the backend must check its revocation status before allowing access.

```text
Request with Access Token
          ↓
Verify JWT
          ↓
Check revocation status
          ↓
Revoked → Reject request
```

### Refresh Token Revocation

A refresh token is used to obtain new access tokens.

If a refresh token is revoked, the backend must reject attempts to use it to generate new tokens.

```text
Refresh Request
      ↓
Validate Refresh Token
      ↓
Check session status
      ↓
Revoked → Reject refresh
```

Revoking a refresh token does not necessarily revoke an access token that has already been issued.

---

## 6. How Middleware Handles a Revoked JWT

A protected API typically performs the following checks:

1. Extract the access token from the request.
2. Verify the JWT signature.
3. Check expiration and required claims.
4. Check the revocation store if immediate revocation is supported.
5. Continue to the controller only if all required checks pass.

### Simplified Express Example

```js
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Access token required"
      });
    }

    // Verify the JWT signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check server-side revocation status
    const revoked = await isTokenRevoked(token);

    if (revoked) {
      return res.status(401).json({
        message: "Token has been revoked"
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}
```

`isTokenRevoked()` represents a function that checks Redis or a database. It must be implemented separately.

In production, the revocation check must fail safely if the application cannot reliably determine whether a token is revoked.

---

## 7. Important Security Rules

- Keep access tokens short-lived.
- Store browser refresh tokens in appropriately configured `HttpOnly`, `Secure` cookies when using a cookie-based design.
- Protect cookie-based authentication against CSRF where necessary.
- Avoid storing sensitive information in JWT payloads because the payload is readable.
- Rotate refresh tokens and implement reuse detection where appropriate.
- Revoke refresh sessions when a user logs out.
- Use access-token revocation checks if immediate access-token invalidation is required.
- Never assume that deleting a token from the frontend invalidates a stolen copy.
- Protect JWT signing keys and never expose them to the frontend.

---

## 8. Complete Authentication Flow With Rotation

```text
LOGIN
  ↓
Verify email and password
  ↓
Generate Access Token A
Generate Refresh Token A
  ↓
Store tokens according to the security design
  ↓
ACCESS PROTECTED API
  ↓
Verify Access Token A
  ↓
Valid? → Allow request
Expired? → Request token refresh
  ↓
REFRESH TOKEN FLOW
  ↓
Validate Refresh Token A
  ↓
Check whether it is revoked or already used
  ↓
Generate Access Token B
Generate Refresh Token B
  ↓
Invalidate Refresh Token A
  ↓
Use the new tokens
  ↓
LOGOUT
  ↓
Revoke the refresh session
  ↓
Revoke the access token too if immediate
access-token invalidation is required
```

## Final Summary

- **Token expiration:** A token becomes invalid after its expiration time.
- **Refresh token rotation:** A used refresh token is replaced with a new one.
- **Token blacklisting:** A token is recorded as revoked so the backend can reject it.
- **Token revocation:** A token or session is made invalid before its normal expiration.
- **Reuse detection:** The server detects attempts to reuse an invalidated refresh token and can revoke the related token family.
