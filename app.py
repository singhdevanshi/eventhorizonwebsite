from flask import Flask
from database.signup import app as signup_app

# Create the Flask app
app = Flask(__name__)
app.register_blueprint(signup_app)

if __name__ == "__main__":
    app.run(debug=True)
