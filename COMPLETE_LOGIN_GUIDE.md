# 🔐 Complete Login & Dashboard Guide

## Current Status
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5174
- ❌ Getting 401 Unauthorized when trying to fetch quizzes
- ❌ Token not being sent with requests

---

## Root Cause
The token is not being properly passed from the frontend to the backend API calls. This happens because:
1. Token might not be saving to localStorage after login
2. Token format might be incorrect
3. Auth interceptor might not be working

---

## Solution: Step-by-Step

### Step 1: Clear Everything
Open browser console (F12) and run:
```javascript
// Clear all storage
localStorage.clear()
sessionStorage.clear()

// Verify it's cleared
console.log('localStorage:', localStorage)
```

### Step 2: Close and Reopen Browser
1. Close browser completely
2. Reopen and go to: `http://localhost:5174`

### Step 3: Sign Up / Login
**Option A: Sign Up (Recommended)**
```
Go to: http://localhost:5174/signup
Fill in:
  Name: Test Student
  Email: student123@test.com
  Password: Student123
  Role: Student
Click: Sign Up
```

**Option B: Login (if student already exists)**
```
Go to: http://localhost:5174/login
Fill in:
  Email: student123@test.com
  Password: Student123
Click: Login
```

### Step 4: Debug the Token
After signup/login, open browser Console (F12) and run:
```javascript
// Check localStorage
const auth = localStorage.getItem('auth-storage')
console.log('Auth storage:', auth)

// Parse and check token
if (auth) {
  const parsed = JSON.parse(auth)
  console.log('Parsed auth:', parsed)
  console.log('Token exists:', !!parsed.state?.token)
  console.log('Token:', parsed.state?.token)
}
```

**Expected output:**
```javascript
{
  state: {
    user: { ... },
    token: "eyJhbGc...",  // JWT token
    isAuthenticated: true
  }
}
```

### Step 5: Check Console Logs
After signup/login, you should see console logs like:
```
✅ Signup response: {...}
✅ Auth storage: exists
✅ Token: exists
```

### Step 6: Go to Dashboard
After successful login, you should be redirected to:
- **Student:** `/dashboard`
- **Instructor:** `/instructor/dashboard`

### Step 7: Check Dashboard Console
On the dashboard, open Console (F12) and you should see:
```
✅ Fetching assigned quizzes...
✅ Auth storage: exists
✅ Token: exists
✅ Quizzes response: { quizzes: [...] }
```

---

## If You're Getting 401 Unauthorized

### Debug Check 1: Is Token Being Sent?
```javascript
// Run in Console (F12) while on dashboard
// Open Network tab
// Reload page
// Look for request to: GET /api/quizzes/student/assigned
// Click on it
// Go to "Headers" tab
// Find: Authorization: Bearer eyJ...
// If NOT there, token is not being sent!
```

### Debug Check 2: Is Token Valid?
```javascript
// Decode JWT token to check if expired
const token = JSON.parse(localStorage.getItem('auth-storage')).state.token

// Install jwt-decode in browser console:
// (or go to: https://jwt.io and paste token there)

// Check the payload to see:
// - exp: expiration time
// - sub: user ID
// - role: user role
```

### Debug Check 3: Is Backend Rejecting Token?
Go to backend terminal and look for:
```
[05/Dec/2025 20:XX:XX] GET /api/quizzes/student/assigned HTTP/1.1" 401 -
```

This means backend received the request but rejected the token.

---

## Common Issues & Fixes

### Issue 1: 401 Unauthorized
**Symptoms:**
- Console shows: "Failed to load quizzes: AxiosError"
- Network tab shows: 401 Unauthorized

**Solutions:**
```javascript
// A. Check if token is valid
const auth = localStorage.getItem('auth-storage')
console.log(auth)  // Should show token

// B. Try logging out and logging back in
localStorage.clear()
// Then go to login page and login again

// C. Check if role is correct
const parsed = JSON.parse(localStorage.getItem('auth-storage'))
console.log('Role:', parsed.state.user.role)  // Should be "student"

// D. If role is "instructor", that's the problem!
// Instructors can't use /api/quizzes/student/assigned
// Use /api/quizzes instead
```

### Issue 2: "Only students can view assigned quizzes"
**Symptoms:**
- Error message: "Only students can view assigned quizzes"
- You logged in as Instructor

**Solution:**
Sign up as Student instead:
```
Email: student@test.com
Password: Student123
Role: Student  <-- Make sure to select this!
```

### Issue 3: No Quizzes Showing
**Symptoms:**
- Token is valid
- No 401 error
- But dashboard shows empty

**Reason:** No quizzes exist in the database

**Solution:**
Login as instructor and create a quiz:
```
1. Go to: http://localhost:5174/instructor/dashboard
2. Create Quiz button
3. Fill: Title, Description, Times, Duration
4. Click Create
5. Go back to Student Dashboard
6. Quizzes should appear
```

---

## Complete Fresh Start (Nuclear Option)

If nothing works, do this:

### Terminal 1: Reset Backend
```powershell
cd "c:\DOCUMENTS\3 YEAR SUBJECTS\TERM 2\FE WD\PROJECT FE DEV\backend"
rm instance/quiz_portal.db
python app.py
```

### Terminal 2: Reset Frontend
```powershell
cd "c:\DOCUMENTS\3 YEAR SUBJECTS\TERM 2\FE WD\PROJECT FE DEV\frontend"
npm run dev
```

### Browser:
1. Open: http://localhost:5174
2. Press: Ctrl+Shift+Delete (clear cache)
3. Run in Console: `localStorage.clear()`
4. Sign up as student
5. Check console logs

---

## What Happens During Login

```
1. User fills form and clicks "Sign Up"
   ↓
2. Frontend sends: POST /api/auth/signup
   Data: { name, email, password, role }
   ↓
3. Backend processes and returns:
   { user: {...}, access_token: "eyJ..." }
   ↓
4. Frontend saves to localStorage:
   auth-storage: { state: { user, token, isAuthenticated } }
   ↓
5. apiClient interceptor reads localStorage
   ↓
6. When calling API (e.g., /api/quizzes/student/assigned):
   - Read token from localStorage
   - Add header: Authorization: Bearer {token}
   - Send request with token
   ↓
7. Backend verifies token with @token_required decorator
   ↓
8. If valid: Process request and return data
   If invalid: Return 401 Unauthorized
```

---

## The Token in Detail

### What It Looks Like
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NDk0NzIwMiwianRpIjoiODI2NTRjOWUtOWRlYy00Mzk0LWIxMmEtNDQ5MGYwMDE3MjQ0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImNhZDlmMDRmLWFiZGItNDJkMy04NDA5LTc0OGE1YTFjZGQ0MCIsIm5iZiI6MTc2NDk0NzIwMiwiZXhwIjoxNzY0OTUwODAyfQ.Zh332d1z6TkHENI0i1E-sqwEwUPcglocnrThBOdVgEI
```

### What's Inside (Decoded)
```json
{
  "fresh": false,
  "iat": 1764947202,
  "jti": "82654c9e-9dec-4394-b12a-4490f0017244",
  "type": "access",
  "sub": "cad9f04f-abdb-42d3-8409-748a5a1cdd40",  // user ID
  "nbf": 1764947202,
  "exp": 1764950802  // expiration timestamp
}
```

---

## Testing Checklist

- [ ] Backend running: `python app.py`
- [ ] Frontend running: `npm run dev`
- [ ] Browser: http://localhost:5174
- [ ] Console (F12): Open and watch for messages
- [ ] localStorage cleared: `localStorage.clear()`
- [ ] Sign up as student with email: student@test.com
- [ ] Check console for "Signup response"
- [ ] Check if redirected to /dashboard
- [ ] Dashboard should show "Fetching assigned quizzes..."
- [ ] Console shows "Quizzes response: {...}"
- [ ] Quizzes display on page (or "No quizzes" if none exist)

---

## Quick Test Command

Run this in browser Console to simulate API request:
```javascript
fetch('http://localhost:5000/api/quizzes/student/assigned', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage')).state.token}`
  }
})
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err))
```

Expected response:
```json
{
  "quizzes": [...]  // Array of quiz objects
}
```

---

## Still Stuck?

1. **Take a screenshot** of the browser console (F12) showing the error
2. **Copy the exact error message** from the console
3. **Check the Network tab** → Find the failing request → Check the Response
4. **Check backend logs** → Look for the request in the terminal
5. **Try the fresh start** → Delete database and restart both servers

Remember: **The Console is your best friend!** It will tell you exactly what's wrong. 🔍

