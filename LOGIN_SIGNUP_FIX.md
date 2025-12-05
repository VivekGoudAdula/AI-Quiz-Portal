# 🔐 Login/Signup Fix Guide

## Problem Identified
You're seeing "Signup failed" error when trying to sign up as an instructor.

## What We Fixed ✅

We improved error handling in the signup/login pages to:
1. **Show exact error messages** from the backend
2. **Add console logging** for debugging
3. **Validate token responses** before attempting login
4. **Better error messages** instead of generic "failed"

## How to Test Now

### Step 1: Open Browser Developer Tools
```
Press: F12 (Windows)
Or: Right-click → Inspect → Console tab
```

### Step 2: Clear Previous Session
```javascript
// In browser console, run:
localStorage.clear()
```

### Step 3: Go to Signup Page
```
Navigate to: http://localhost:5174/signup
(or whatever port shows in your terminal)
```

### Step 4: Fill in the Form
```
Full Name: John Instructor
Email: john@test.com
Password: Password123
Role: Instructor
```

**Important:** Password must have:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one number (0-9)

### Step 5: Watch the Console
1. Click "Sign Up"
2. Look at the **Console tab** (F12)
3. You should see either:
   - ✅ `Signup response: {...}` - Success!
   - ❌ `Signup error: {...}` - Shows exact error

### Step 6: Verify Signup Success
If successful, you'll see:
- Redirect to Instructor Dashboard
- Console shows: `user: {...}, access_token: "eyJ..."`

---

## If Still Getting "Signup failed"

### Check 1: Backend is Running
```powershell
# In a terminal, check:
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"Test123"}'
```

Expected response: Either error about email not found OR success with token

**If error:** Backend is not running
```bash
cd backend
python app.py
```

### Check 2: Frontend Environment
Look at Console for errors like:
- "CORS error" → Backend not running or wrong port
- "Cannot read property..." → JavaScript error in signup component
- Network 500 → Backend error

### Check 3: Network Request
1. Open **Network** tab (F12)
2. Click Sign Up
3. Look for request to `POST /api/auth/signup`
4. Check the **Response** tab
5. You'll see the exact error from backend

---

## Common Errors & Solutions

### Error: "Email already registered"
**Solution:** Use a different email address or clear the database
```powershell
# Delete the database file (it will recreate on next startup)
cd backend
rm instance/quiz_portal.db

# Restart backend
python app.py
```

### Error: "Password must be 8+ chars..."
**Solution:** Make password stronger
- Wrong: `password` (lowercase only)
- Correct: `Password123` (uppercase + digit + 8 chars)

### Error: "Invalid email format"
**Solution:** Use proper email format
- Wrong: `testtest.com`
- Correct: `test@test.com`

### Error: CORS error or "Cannot connect to server"
**Solution:** Verify backend is running
```bash
# Terminal 1 - Start Backend
cd backend
python app.py

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

Check that you see:
- Backend: `Running on http://127.0.0.1:5000`
- Frontend: `Local: http://localhost:5174`

### Error: 500 Internal Server Error
**Solution:** Check backend logs
1. Look at the terminal running `python app.py`
2. Find the error message
3. Common causes:
   - Database locked
   - Missing table
   - Typo in field name

**Fix:** Restart backend
```bash
# Stop with Ctrl+C
python app.py
```

---

## Testing Quick Links

### Test Accounts (After First Signup)

**Instructor Account**
- Email: `john@test.com`
- Password: `Password123`

**Student Account**
- Email: `student@test.com`
- Password: `Student123`

---

## What Should Happen

### Successful Signup Flow
```
1. Fill form with valid data
2. Click "Sign Up"
3. 1-2 second loading
4. Console shows: Signup response: {...}
5. Redirect to Instructor Dashboard
6. See "Welcome, John Instructor"
```

### Successful Login Flow
```
1. Go to /login
2. Enter email and password
3. Click "Login"
4. 1-2 second loading
5. Console shows: Login response: {...}
6. Redirect to dashboard (based on role)
```

---

## Frontend Improvements Made

**File:** `frontend/src/pages/SignupPage.tsx`
- ✅ Added console logging for debugging
- ✅ Better error messages with actual error details
- ✅ Validate token before redirect
- ✅ Show network/server errors clearly

**File:** `frontend/src/pages/LoginPage.tsx`
- ✅ Added console logging for debugging
- ✅ Better error messages with actual error details
- ✅ Validate token before redirect
- ✅ Show network/server errors clearly

---

## Debugging Checklist

- [ ] Open browser F12 (Developer Tools)
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Go to signup page
- [ ] Watch Console tab while submitting
- [ ] Take screenshot of error message
- [ ] Check Network tab for API response
- [ ] Verify backend is running on port 5000
- [ ] Verify frontend is running on port 5174 (or 5173)

---

## Next Steps After Successful Login

1. ✅ Login as Instructor
2. ⏳ Go to Instructor Dashboard
3. ⏳ Create a Quiz
4. ⏳ Generate AI Questions
5. ⏳ Assign Quiz to Students
6. ⏳ Login as Student
7. ⏳ View Assigned Quizzes
8. ⏳ Take the Quiz

---

## Still Having Issues?

**What to check:**
1. Copy the exact error message from Console
2. Take a screenshot of the error
3. Check that both backend and frontend are running
4. Try deleting database and restarting backend
5. Clear browser cache: `Ctrl+Shift+Delete`

**Try these commands:**
```bash
# Terminal 1 - Clean backend
cd backend
rm instance/quiz_portal.db
python app.py

# Terminal 2 - Clean frontend
cd frontend
npm run dev
```

Then try signing up again with browser DevTools open (F12).

---

**Remember:** Check the **Console tab** (F12) - it will show you the exact error! 🔍

