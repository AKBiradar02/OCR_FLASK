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

### 1. Set Up Environment Variables

Copy `.env-example` to `.env` and update the values as needed:

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///ocr_app.db
FLASK_DEBUG=0
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Flask Backend

First, activate your Python virtual environment (if you're using one) and start the Flask server:

```bash
# From the project root (cur_ocr)
python app.py
```

The Flask server will run on http://localhost:5000.

### 4. Start the React Frontend

In a separate terminal, navigate to the frontend directory and start the React development server:

```bash
# From the project root
cd frontend
npm install  # if not already done
npm run dev
```

The React development server will run on http://localhost:3000 or http://localhost:3001.

### 5. Access the Application

Open your browser and go to:
- http://localhost:3000 (or 3001) to access the React frontend

## Environment Variables

- `FLASK_APP`: Entry point for Flask (usually `app.py`)
- `FLASK_ENV`: Flask environment (`development` or `production`)
- `SECRET_KEY`: Secret key for session management
- `DATABASE_URL`: Database connection string (default: SQLite)
- `FLASK_DEBUG`: Set to `1` to enable debug mode

## Configuration Options (config.py)

- `SECRET_KEY`: Used for session security
- `SQLALCHEMY_DATABASE_URI`: Database URI (default: SQLite)
- `SQLALCHEMY_TRACK_MODIFICATIONS`: SQLAlchemy event system (default: False)
- `UPLOAD_FOLDER`: Path for uploaded files
- `MAX_CONTENT_LENGTH`: Maximum upload size (default: 16MB)

## Main Dependencies

- Flask==2.3.3
- flask-login==0.6.3
- flask-wtf==1.2.2
- flask-cors==4.0.0
- email-validator==2.1.0
- Werkzeug==3.0.1
- SQLAlchemy==2.0.27
- wtforms==3.0.1
- easyocr==1.7.2
- numpy==1.26.4
- PyMuPDF==1.25.0
- pdf2image==1.17.0
- gunicorn==21.2.0
- python-dotenv==1.0.1

## Database Models

### User
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password_hash`: Hashed password
- `ocr_results`: Relationship to OCR results

### OCRResult
- `id`: Primary key
- `filename`: Name of the uploaded file
- `file_path`: Path to the file
- `text_content`: Extracted text
- `timestamp`: Upload time
- `user_id`: Foreign key to User

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
