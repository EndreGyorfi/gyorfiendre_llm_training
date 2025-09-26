# Product Management System

A full-stack product management application with React frontend and FastAPI backend.

## Project Structure

- `05_design/` - React frontend with Material-UI
- `fastapi-template/` - Python FastAPI backend with SQLite database

## Features

- ✅ View all products in a responsive grid layout
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Search products by name and description
- ✅ Real-time stock management
- ✅ RESTful API with FastAPI
- ✅ SQLite database with SQLAlchemy ORM

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd fastapi-template
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy[asyncio] aiosqlite
```

3. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd 05_design
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` or `http://localhost:5174`

## API Endpoints

- `GET /products/` - Get all products
- `POST /products/` - Create a new product
- `GET /products/{id}` - Get a specific product
- `PUT /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

## Technology Stack

### Frontend
- React 18
- Material-UI (MUI) v5
- Vite (build tool)
- ESLint (linting)

### Backend
- FastAPI
- SQLAlchemy (ORM)
- SQLite (database)
- Pydantic (data validation)
- Uvicorn (ASGI server)

## Next Steps: Shopping Cart Feature

This project is ready for implementing the shopping cart system as described in the requirements:

1. Create a new branch for the shopping cart feature
2. Add cart management endpoints to the backend
3. Implement cart UI components in the frontend
4. Add Plus buttons to products
5. Display cart in the bottom left corner

## Development

Both the frontend and backend support hot reloading during development. Make sure both servers are running when developing.
