# Flask OCR Application with React Frontend

This application consists of two parts:
1. A Flask backend API server
2. A React frontend web application

## Project Structure

```
cur_ocr/
  ├── app/                # Flask application code
  │    ├── controllers/   # Route handlers 
  │    ├── models/        # Database models (User, OCRResult)
  │    ├── static/        # Static files (uploads, etc.)
  │    ├── utils/         # Utility functions
  │    └── __init__.py    # App factory
  ├── frontend/           # React frontend code
  ├── instance/           # Instance folder for Flask (config, etc.)
  ├── uploads/            # Uploaded files (created when needed)
  ├── app.py              # Flask application entry point
  ├── config.py           # Application configuration
  ├── requirements.txt    # Python dependencies
  ├── .env-example        # Example environment variables
  └── README.md           # Project documentation
```

## How to Run the Application

### 1. Start the Flask Backend

First, activate your Python virtual environment (if you're using one) and start the Flask server:

```bash
# From the project root (cur_ocr)
python app.py
```

The Flask server will run on http://localhost:5000.

### 2. Start the React Frontend

In a separate terminal, navigate to the frontend directory and start the React development server:

```bash
# From the project root
cd frontend
npm run dev
```

The React development server will run on http://localhost:3000 or http://localhost:3001.

### 3. Access the Application

Open your browser and go to:
- http://localhost:3000 (or 3001) to access the React frontend

## Important Notes

- **The React frontend and Flask backend are separate applications** that communicate via API calls.
- **Do not try to access Flask templates directly** - the React application is the intended user interface.
- **Both servers must be running simultaneously** for the application to work correctly.

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/login` - Log in a user
- `POST /api/logout` - Log out a user
- `POST /api/register` - Create a new user
- `GET /api/user` - Get current authenticated user

### OCR
- `POST /api/ocr` - Process a file with OCR
- `GET /api/results` - Get a list of OCR results
- `GET /api/results/:id` - Get details of a specific result
- `DELETE /api/results/:id` - Delete a specific result

## Troubleshooting

If you encounter issues:

1. Ensure both servers are running in separate terminals
2. Check the browser's console (F12) for any error messages
3. Check the terminal running the Flask backend for error logs
4. Visit http://localhost:3000/server-help.html for more troubleshooting tips 
