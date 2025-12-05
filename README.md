**Proctored Online Quiz & Exam Portal**

A modern, full-stack, web-based examination system with advanced proctoring, real-time analytics, adaptive difficulty support, and role-based functionality for students, instructors, and administrators.

**📌 Overview**

This project provides a secure and scalable online exam platform designed for classrooms, universities, and corporate assessments.
It includes anti-cheat features, adaptive difficulty systems, performance analytics, and a highly responsive React + TypeScript UI.

📁 **Project Structure**
project-root/
├── backend/              # Flask REST API
│   ├── app.py           
│   ├── database.py      
│   ├── requirements.txt 
│   ├── .env.example     
│   ├── routes/          
│   │   ├── auth.py      
│   │   ├── quizzes.py   
│   │   ├── attempts.py  
│   │   ├── proctoring.py
│   │   ├── instructor.py
│   │   └── admin.py     
│   └── utils/           
│       ├── helpers.py   
│       └── decorators.py
└── frontend/             
    ├── src/
    │   ├── components/  
    │   ├── pages/       
    │   ├── utils/       
    │   ├── hooks/       
    │   ├── api.ts       
    │   ├── store.ts     
    │   ├── App.tsx      
    │   ├── main.tsx     
    │   └── index.css    
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── index.html

**✨ Features
🔐 Authentication & Security**

JWT-based authentication

Role-based access control (Student, Instructor, Admin)

Password change & profile management

📝 **Quiz & Exam Management**

Quiz creation and editing

Question bank with difficulty levels & tags

Auto-grading for MCQ and True/False

Real-time timer + autosave

Attempt tracking and results

👁️**Proctoring System**

Tab switching detection

Full-screen monitoring

Clipboard (copy/paste) blocking

Proctoring event logs

Webcam & face detection (coming soon)

📊 **Analytics**

Performance charts

Difficulty & topic breakdown

Proctoring summaries

Admin-level insights

🎨 **UI/UX**

Dark mode

Responsive design

Keyboard accessible

Tailwind CSS + Framer Motion animations

🚀 **Tech Stack**

Backend

Python + Flask

SQLAlchemy ORM

PostgreSQL / SQLite

Flask-JWT-Extended

Frontend

React 18 + TypeScript

Vite

Zustand (state management)

Tailwind CSS

Recharts & Framer Motion

🛠️ **Installation & Setup**
Prerequisites

Python ≥ 3.8

Node.js ≥ 18

PostgreSQL (optional, SQLite supported)

🗄️ **Database Models**

User
Quiz
Question
QuestionOption
Attempt
Answer
ProctoringEvent

📅 **Future Enhancements**
**Phase 2**
Webcam + face detection

Adaptive difficulty

Manual grading tools

PDF result export

Email notifications

**Phase 3**

Full unit & E2E tests

Accessibility review

Multi-language support

Offline mode

🤝 **Contributing**

Fork the repository
Create a feature branch
Commit your updates
Open a pull request

📄**License**

MIT License – free for personal and commercial use.


