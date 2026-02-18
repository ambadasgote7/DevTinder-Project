# 🚀 DevTinder Backend

## 💡 Overview
DevTinder is a developer-matching platform — like Tinder, but for developers.  
This backend manages user authentication, profiles, connection requests, and feed logic for discovering other developers.  

It’s built with a modular, production-ready architecture designed for scalability, maintainability, and clean code practices.

---

## 🔥 Key Features
- JWT-based authentication with bcrypt password hashing  
- User signup, login, logout, and secure profile management  
- Developer feed excluding already connected or requested users  
- Connection system to send, accept, or reject requests  
- Middleware-based error handling and input validation  
- Role-based access control and modular routing  
- Pagination and optimized MongoDB queries with indexes  

---

## 🧰 Tech Stack
- Backend: Node.js, Express.js  
- Database: MongoDB with Mongoose  
- Authentication: JWT, bcrypt  
- Validation: Express middleware and Mongoose schema rules  
- Environment Management: dotenv  
- Deployment: AWS EC2 with Nginx reverse proxy  

---

## 📁 Project Structure

DevTinder/
├── controllers/ # Core business logic
├── middlewares/ # Auth, validation, error handlers
├── models/ # Mongoose schemas
├── routes/ # Express API routes
├── utils/ # Helper functions
├── config/ # Database and environment setup
└── app.js # Entry point

---

## ⚙️ Setup Instructions

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/ambadasgote7/DevTinder.git
cd DevTinder


2️⃣ Install Dependencies
npm install

3️⃣ Create Environment File
Make a .env file in the root directory with the following keys:
PORT=7777
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/devtinder
JWT_SECRET=your_secret_key
ALLOWED_ORIGIN=http://localhost:3000

4️⃣ Start the Server
npm start
Your API will now be available at:
http://localhost:7777

---

📡 Available APIs

Authentication
/auth/signup → Register a new developer account
/auth/login → Authenticate and return JWT token
/auth/logout → Logout and invalidate session

Profile
/profile → Get or update logged-in user details
/profile/password → Update password securely

Connections
/connections/send/:toUserId → Send a connection request
/connections/respond/:requestId → Accept or reject request
/connections/pending → View pending connection requests

Feed
/feed?page=1&limit=10 → Fetch suggested developers with pagination

---

💬 Chat System Overview
Once two developers connect (mutual acceptance), they can chat instantly.
    - Built using Socket.io for real-time bidirectional communication.
    - Messages are stored in MongoDB with sender, receiver, and timestamp.
    - Supports joining chat rooms per connection ID for secure messaging.
    - Emits live events for message delivery and read receipts.

Example event flow:
connect → joinRoom(connectionId)
sendMessage → broadcast to receiver
messageSaved → MongoDB persists chat

---

🚀 Future Enhancements

- Add online/offline status tracking
- Implement typing indicators
- Integrate message notifications
- Add message reactions and attachments
- Introduce chat read receipts and last seen status
- Deploy via Docker and CI/CD pipeline

---

👨‍💻 Author
Ambadas Gote
Backend Developer | MERN Stack Engineer

GitHub: ambadasgote7
LinkedIn: linkedin.com/in/ambadasgote7

⭐ Support
If this project helped you or inspired your own MERN journey, please consider giving it a ⭐ on GitHub — it keeps open-source projects alive.