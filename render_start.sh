#!/bin/bash
export FLASK_APP=app.app
flask db upgrade
gunicorn -w 1 -b 0.0.0.0:$PORT app.app:app --timeout 180
