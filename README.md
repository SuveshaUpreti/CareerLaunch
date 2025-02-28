

# ResumeAI 📝🚀
**AI-powered Cover Letter Generator**

## **📌 Overview**
**ResumeAI** is a full-stack application that helps users generate professional resumes and cover letters using AI. It features:
- A **React + TypeScript frontend** powered by **Vite**.
- A **Node.js + Express backend** connected to **MongoDB**.
- Secure authentication with **JWT**.
- AI-powered resume and cover letter generation using **Gemini API**.

---

## **🛠 Tech Stack**
### **Frontend (Client)**
- React + TypeScript
- Vite
- Tailwind CSS
- Axios (for API calls)

### **Backend (Server)**
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- dotenv (for environment variables)
- Axios (for AI API integration)

---

## **🚀 Installation & Setup**
### **1️⃣ Clone the Repository**
```bash
git clone git@github.com:SuveshaUpreti/ResumeAI.git
cd ResumeAI
```

---

## **🖥️ Frontend Setup (React + TypeScript)**
### **📌 Install Dependencies**
```bash
cd frontend
npm install
```
### **🔧 Start the Frontend**
```bash
npm run dev
```
**Runs on:** `http://localhost:5173`

---

## **🖥️ Backend Setup (Node.js + Express)**
### **📌 Install Dependencies**
```bash
cd backend
npm install
```
### **🔑 Environment Variables**
Create a `.env` file inside the `backend` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### **🚀 Start the Backend**
```bash
node server.js
```
**Runs on:** `http://localhost:5001`

---

## **📡 API Endpoints**
### **🔹 Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | User login (returns JWT) |

### **🔹 Profile Management**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/profile` | Fetch user profile (Requires JWT) |
| `POST` | `/api/profile` | Update user profile (Requires JWT) |

### **🔹 AI Cover Letter Generation**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/generate-chronological-cover-letter` | Generate detailed cover letter |
| `POST` | `/api/generate-short-cover-letter` | Generate concise cover letter |

---

## **🎯 Features**
✔️ **User Authentication** (JWT-based)  
✔️ **Resume & Cover Letter Generation** (via AI)  
✔️ **MongoDB for Data Storage**  
✔️ **React + TypeScript for UI**  
✔️ **RESTful API Architecture**  
✔️ **Secure `.env` Configuration**  

---

## **🐛 Troubleshooting**
- If **MongoDB connection fails**, check if `MONGO_URI` is correct.
- If **authentication fails**, ensure `JWT_SECRET` is set properly.
- If **frontend doesn't start**, make sure **Node.js v16+** is installed.



## **👨‍💻 Author**
Developed by **Suvesha Upreti** 🚀  
🔗 **GitHub**: [SuveshaUpreti](https://github.com/SuveshaUpreti)  

