import os
import uuid
import json
from flask import Flask, request, render_template, jsonify
import requests
from werkzeug.utils import secure_filename

app = Flask(__name__)

SIGNER_API_URL = "https://dk7rflfyrb.execute-api.us-east-1.amazonaws.com/prod/generate-upload-url"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    try:
        # Get file from frontend
        file = request.files.get("file")
        if file is None:
            return jsonify({"message": "No file received"}), 400

        filename = secure_filename(file.filename)
        ext = filename.split(".")[-1].lower()

        # STEP 1 — Call AWS signer to get presigned URL
        signer_response = requests.get(
            SIGNER_API_URL,
            params={"fileName": filename}
        ).json()

        upload_url = signer_response["upload_url"]
        file_key   = signer_response["file_key"]

        # STEP 2 — Upload file directly to S3
        upload_headers = {
            "Content-Type": f"image/{ext}"
        }

        put_res = requests.put(upload_url, data=file.read(), headers=upload_headers)
        if put_res.status_code != 200:
            return jsonify({"message": "Failed to upload to S3"}), 500

        return jsonify({
            "message": "Upload successful",
            "file_key": file_key
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
