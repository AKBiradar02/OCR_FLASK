from app import create_app, db
from app.models.user import User, OCRResult
import sys

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'OCRResult': OCRResult}


# db.create_all() removed - using Flask-Migrate in render_start.sh instead

if __name__ == '__main__':
    # Get port from command line arguments or use default 5000
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    print(f"\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
    print(f"  FLASK API SERVER STARTING")
    print(f"=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
    print(f"  This is a REST API server for the React frontend.")
    print(f"  To use the full application:")
    print(f"  1. Keep this server running")
    print(f"  2. Open a new terminal and run: cd frontend && npm run dev")
    print(f"  3. Visit http://localhost:3000 in your browser")
    print(f"")
    print(f"  API server will be available at: http://localhost:{port}")
    print(f"  For troubleshooting: http://localhost:3000/server-help.html")
    print(f"=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n")

    # Run the Flask application
    app.run(debug=True, port=port, host='0.0.0.0', use_reloader=True)
