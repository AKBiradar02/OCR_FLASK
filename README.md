# OCR Web Application

This is a web application built with Flask that allows users to extract text from images and PDF documents using OCR (Optical Character Recognition) technology.

## Features

- User authentication (register, login, logout)
- OCR processing for images (JPG, PNG) and PDF files
- Result management (view, delete saved results)
- Simple and intuitive user interface

## Technologies Used

- **Backend**: Flask (Python)
- **Database**: SQLite
- **OCR Engine**: EasyOCR
- **PDF Processing**: PyMuPDF, pdf2image
- **Frontend**: HTML, CSS, Bootstrap

## Installation

### Prerequisites

- Python 3.8+
- Poppler (for PDF processing)

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ocr-web-app.git
   cd ocr-web-app
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory with the following content:
     ```
     SECRET_KEY=your-secret-key
     ```

5. Initialize the database:
   ```
   python app.py
   ```

## Usage

1. Start the application:
   ```
   python app.py
   ```

2. Open your web browser and go to `http://localhost:5000`

3. Register a new account or login with existing credentials

4. Upload an image or PDF file to extract text

5. View and manage your OCR results

## Project Structure

```
ocr-web-app/
├── app/                    # Application package
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── static/             # Static files (CSS, JS)
│   ├── templates/          # HTML templates
│   ├── utils/              # Utility functions
│   └── __init__.py         # App initialization
├── instance/               # Instance-specific data
├── .env-example            # Example environment variables
├── .gitignore              # Git ignore file
├── app.py                  # Application entry point
├── config.py               # Configuration
├── requirements.txt        # Dependencies
└── README.md               # This file
```

## Deployment

The application can be deployed to various platforms:

- **PythonAnywhere**: Simple hosting for Flask applications
- **Heroku**: Cloud platform that supports Python applications
- **DigitalOcean**: VPS provider with App Platform support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 