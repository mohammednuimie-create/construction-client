# Backend Server

## Requirements

- Node.js (v14+)
- MongoDB (local or Atlas)

## Installation

```bash
cd server
npm install
```

## Setup

1. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/construction-management
JWT_SECRET=your-secret-key
PORT=4000
```

2. Start MongoDB

## Run

```bash
npm run dev    # Development
npm start      # Production
```

Server runs on `http://localhost:4000`

## API Endpoints

- `GET /` - API info
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/projects` - Projects
- `GET /api/users` - Users
- `GET /api/materials` - Materials
- `GET /api/suppliers` - Suppliers
- `GET /api/purchases` - Purchases
- `GET /api/payments` - Payments
- `GET /api/issues` - Issues
- `GET /api/contracts` - Contracts
- `GET /api/requests` - Requests
- `GET /api/reports` - Reports

