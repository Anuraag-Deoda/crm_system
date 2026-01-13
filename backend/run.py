from app.main import app, socketio

if __name__ == '__main__':
    print("Starting Satis Motor CRM Backend...")
    print("API running at http://localhost:5000")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
