# Backend Ledger API

A secure, scalable Node.js/Express backend API for managing financial accounts, transactions, and maintaining a complete audit ledger. Built with MongoDB for data persistence and JWT for authentication.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Future Enhancements](#future-enhancements-beginner-to-intermediate-level)
- [Contributing](#contributing)

## Features

✅ **User Authentication**
- User registration and login
- JWT-based session management
- Password hashing with bcrypt
- Secure logout with token blacklisting

✅ **Account Management**
- Create and manage multiple accounts per user
- View account details and history
- Account balance tracking

✅ **Transaction Processing**
- Record financial transactions (transfers, deposits, withdrawals)
- Complete transaction history
- Real-time ledger updates

✅ **Security**
- Password encryption
- JWT token validation
- Authorization middleware
- Environment variable protection

✅ **Email Notifications**
- User registration confirmation
- Transaction alerts
- Account updates

✅ **Audit Trail**
- Complete ledger of all transactions
- Immutable transaction records
- User action tracking

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js v5.2.1 |
| **Database** | MongoDB (Mongoose v9.7.4) |
| **Authentication** | JWT (jsonwebtoken v9.0.3) |
| **Password Security** | bcrypt v6.0.0 |
| **Email Service** | Nodemailer v9.0.3 |
| **Environment Config** | dotenv v17.4.2 |
| **Cookie Handling** | cookie-parser v1.4.7 |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Install MongoDB](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** (comes with Node.js)
- **Postman** or similar tool for API testing (optional)

## Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd BACKEND-LEDGER
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`:
- express
- mongoose
- jsonwebtoken
- bcrypt
- nodemailer
- cookie-parser
- dotenv

### Step 3: Create Environment File
Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ledger-db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

Email Configuration (Gmail via OAuth2)

EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token

Server Configuration

PORT=3000
NODE_ENV=development
```
 
**Note:** This project authenticates with Gmail using OAuth2, not a password/App Password. To get `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN`:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Gmail API, and set up an OAuth 2.0 Client ID under **APIs & Services → Credentials**
3. Use [Google's OAuth2 Playground](https://developers.google.com/oauthplayground) (or a similar script) with your client credentials to generate a refresh token for the Gmail account you want to send from

**⚠️ Known issue:** If your OAuth consent screen is in **Testing** status (Google Cloud Console → APIs & Services → OAuth consent screen), refresh tokens expire after **7 days**, and email sending will fail with `invalid_grant`. Either regenerate the refresh token periodically, or publish the app to remove the 7-day cap.
## Configuration

### Database Configuration (`src/config/db.js`)
The application automatically connects to MongoDB using the `MONGO_URI` from your `.env` file.

```javascript
// Connection is handled in server.js
require("dotenv").config()
const connectToDB = require("./src/config/db.js")
connectToDB()
```

### Email Configuration (`src/services/email.service.js`)
Email is sent via Gmail using OAuth2 (not username/password auth). See the `.env` setup above for the required `CLIENT_ID`/`CLIENT_SECRET`/`REFRESH_TOKEN` values and how to generate them.

## Running the Project

### Development Mode (with hot reload)
```bash
npm run dev
```
This uses **nodemon** to automatically restart the server when files change.

### Production Mode
```bash
npm start
```

**Expected Output:**
```
Server is connected to DB
server is running on port 3000
```

Access the API at: `http://localhost:3000`

## Project Structure

```
BACKEND-LEDGER/
├── server.js                 # Entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (create this)
├── .gitignore               # Git ignore rules
└── src/
    ├── app.js               # Express app setup and routes
    ├── config/
    │   └── db.js            # MongoDB connection logic
    ├── controllers/         # Request handlers
    │   ├── auth.controller.js        # Authentication logic
    │   ├── account.controller.js     # Account management
    │   └── transaction.controller.js # Transaction processing
    ├── models/              # Mongoose schemas
    │   ├── user.model.js            # User schema
    │   ├── account.model.js         # Account schema
    │   ├── transaction.model.js     # Transaction schema
    │   ├── ledger.model.js          # Ledger/audit trail
    │   └── blackList.model.js       # Revoked tokens
    ├── middleware/          # Custom middleware
    │   └── auth.middleware.js       # JWT verification
    ├── routes/              # API route definitions
    │   ├── auth.routes.js           # Auth endpoints
    │   ├── account.routes.js        # Account endpoints
    │   └── transaction.routes.js    # Transaction endpoints
    ├── services/            # Business logic and utilities
    │   └── email.service.js         # Email notifications
    └── utils/               # Helper functions
        ├── api-response.js  # Standardized response format
        ├── api-error.js     # Error handling
        └── async-handler.js # Async middleware wrapper
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout and blacklist token | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |

### Account Routes (`/api/accounts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/accounts/create` | Create new account | Yes |
| GET | `/api/accounts` | List all user accounts | Yes |
| GET | `/api/accounts/:id` | Get account details | Yes |
| PUT | `/api/accounts/:id` | Update account | Yes |
| DELETE | `/api/accounts/:id` | Delete account | Yes |

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transactions/create` | Create transaction | Yes |
| GET | `/api/transactions` | List all transactions | Yes |
| GET | `/api/transactions/:id` | Get transaction details | Yes |
| GET | `/api/transactions/account/:accountId` | Get account transactions | Yes |

### Example Request

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Create Account (requires JWT token):**
```bash
curl -X POST http://localhost:3000/api/accounts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accountType": "savings",
    "accountName": "My Savings"
  }'
```

## Database Models

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Account Model
```javascript
{
  userId: ObjectId (reference to User),
  accountType: String (e.g., "savings", "checking"),
  accountName: String,
  balance: Number,
  status: String (e.g., "active", "closed"),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  fromAccountId: ObjectId (reference to Account),
  toAccountId: ObjectId (reference to Account),
  amount: Number,
  type: String (e.g., "transfer", "deposit", "withdrawal"),
  status: String (e.g., "completed", "pending", "failed"),
  description: String,
  createdAt: Date
}
```

### Ledger Model
```javascript
{
  transactionId: ObjectId (reference to Transaction),
  userId: ObjectId (reference to User),
  action: String,
  details: Object,
  timestamp: Date
}
```

### BlackList Model
```javascript
{
  token: String (unique),
  blacklistedAt: Date,
  expiresAt: Date
}
```

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. User logs in and receives a JWT token
2. Token is stored in a cookie and/or request header
3. For protected routes, include the token in the Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
4. On logout, the token is added to the blacklist

### Auth Middleware
The `auth.middleware.js` verifies JWT tokens on protected routes and denies access if:
- Token is missing
- Token is invalid or expired
- Token is blacklisted

## Error Handling

The API uses standardized error responses:

```javascript
{
  success: false,
  statusCode: 400,
  message: "Error description",
  errors: [
    {
      field: "email",
      message: "Invalid email format"
    }
  ]
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token verification
- Token blacklisting on logout
- Environment variable protection
- Authorization middleware

✅ **Recommended Additions:**
- Rate limiting on login endpoints
- Request validation and sanitization
- CORS configuration
- HTTPS in production
- Regular security audits

## Development Tips

### View Logs
Check console output for debugging:
```bash
npm run dev
```

### Test Endpoints
Use Postman, Insomnia, or VS Code REST Client to test:
- Create a request with method and URL
- Add Authorization header if needed
- Send JSON body for POST/PUT requests

### Debug Database
Connect to MongoDB Atlas or local MongoDB to inspect data:
```bash
mongosh "mongodb+srv://cluster.mongodb.net/ledger-db"
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'express'` | Run `npm install` |
| `MongooseError: Cannot connect to MongoDB` | Check `MONGO_URI` in `.env` and MongoDB service status |
| `JWT is not defined` | Ensure `JWT_SECRET` is set in `.env` |
| `EADDRINUSE: address already in use :::3000` | Change port or kill process using port 3000 |
| `SMTP Error sending email` | Verify email credentials in `.env` and enable "Less secure apps" access |

## Next Steps

1. ✅ Install dependencies and configure `.env`
2. ✅ Start the server with `npm run dev`
3. ✅ Test authentication endpoints in Postman
4. ✅ Create accounts and transactions
5. ✅ Deploy to a server (Heroku, AWS, DigitalOcean, etc.)

## Future Enhancements (Beginner to Intermediate Level)

### ✨ Easy Wins (Start Here)
- **Password Reset** - Forgot password endpoint with email verification link
- **User Profile Update** - Allow users to update their name, email, and profile picture
- **Email Verification** - Send verification email on registration, resend option
- **Account Deactivate** - Let users temporarily disable their accounts
- **Transaction Search** - Search transactions by date range, amount, or type
- **Pagination** - Implement pagination for transaction and account listings
- **Sorting Options** - Sort transactions by date, amount, or status

### 🔒 Security Improvements
- **Input Validation** - Validate all user inputs (email format, password strength, amount)
- **Rate Limiting** - Limit login attempts to prevent brute force attacks
- **Sanitize Input** - Prevent SQL/NoSQL injection by sanitizing all inputs
- **CORS Configuration** - Set up proper CORS for frontend integration
- **API Request Validation** - Validate request body before processing

### 📊 Simple Analytics
- **Transaction Summary** - Total income, expenses, and balance by month
- **Export to CSV** - Download transaction history as CSV file
- **Account Statement** - Generate basic account statement with date range filter
- **Transaction Count** - Show total transactions by type (transfer, deposit, withdrawal)

### 🛠️ Developer Experience
- **Better Error Messages** - More descriptive error responses
- **Request Logging** - Log all API requests with timestamps
- **Postman Collection** - Create and export Postman API collection
- **API Response Standardization** - Ensure all responses follow same format
- **Swagger Documentation** - Add Swagger/OpenAPI documentation for endpoints

### 📧 Additional Features
- **Transaction Notifications** - Send email after each transaction
- **Balance Alerts** - Notify user when account balance drops below threshold
- **Login History** - Show user their last 5 logins with timestamp and IP
- **Account Lock** - Lock account after multiple failed login attempts
- **User Settings** - Store user preferences (notifications on/off, currency preference)

### 🧪 Testing
- **Write Unit Tests** - Test individual functions with Jest
- **Test Controllers** - Test API endpoints with sample data
- **Test Validation** - Test input validation functions
- **API Testing** - Test all endpoints using Postman or Insomnia

### 📱 Frontend Integration
- **Build Login Page** - HTML/React login UI
- **Build Dashboard** - Display user accounts and recent transactions
- **Build Transaction Form** - Create transaction UI
- **Integrate with Backend** - Connect frontend to your API endpoints


