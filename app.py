from app import create_app, db
from app.models.user import User, OCRResult

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'OCRResult': OCRResult}

# Create tables when app starts
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True) 