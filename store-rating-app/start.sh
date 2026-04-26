#!/bin/bash
echo "======================================="
echo " RateStore - Store Rating Platform"
echo "======================================="
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
  echo "⚠️  MySQL not found. Please install MySQL 8.0+ and ensure it's running."
fi

echo "Step 1: Setting up database..."
echo "  Run: mysql -u root -p < database/schema.sql"
echo ""

echo "Step 2: Configure backend..."
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "  Created backend/.env — please edit with your DB credentials"
else
  echo "  backend/.env already exists"
fi
echo ""

echo "Step 3: Install & seed backend..."
cd backend
npm install
node seed.js
cd ..
echo ""

echo "Step 4: Install frontend..."
cd frontend
npm install
cd ..
echo ""

echo "======================================="
echo "✅ Setup complete!"
echo ""
echo "Start backend:  cd backend && npm run start:dev"
echo "Start frontend: cd frontend && npm start"
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:4000/api"
echo ""
echo "Default admin: admin@storerating.com / Admin@1234"
echo "======================================="
