"""
Real-Time Cyber Threat Detection Using Federated Learning
Flask Backend — Global Academy of Technology, CSE (AI & ML)
Team: Abhaya Adithya R, Chethan Kumar L, Chethan M, Chethan V
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import time
import threading
import uuid

from models.federated import FederatedLearningEngine
from utils.data_utils import load_and_preprocess

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# In-memory job store (use Redis/DB for production)
jobs = {}


# ─────────────────────────── ROUTES ───────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/train", methods=["GET"])
def train_page():
    return render_template("train.html")


@app.route("/detect", methods=["GET"])
def detect_page():
    return render_template("detect.html")


@app.route("/dashboard", methods=["GET"])
def dashboard_page():
    return render_template("dashboard.html")


# ─────────────────────────── API ──────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload_dataset():
    """Upload CSV dataset and return column info."""
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        info = load_and_preprocess(filepath, preview_only=True)
        return jsonify({"success": True, "file_id": filename, **info})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/train", methods=["POST"])
def start_training():
    """Start federated learning training job."""
    data = request.json
    file_id   = data.get("file_id")
    target_col = data.get("target_col", "label")
    n_clients  = int(data.get("n_clients", 3))
    n_rounds   = int(data.get("n_rounds", 10))
    n_epochs   = int(data.get("n_epochs", 10))
    use_demo   = data.get("use_demo", False)

    job_id = uuid.uuid4().hex
    jobs[job_id] = {
        "status": "running",
        "logs": [],
        "rounds": [],
        "accuracy": 0,
        "training_time": 0,
        "model": None,
        "label_names": [],
        "n_features": 0,
    }

    def _run():
        try:
            filepath = None
            if not use_demo and file_id:
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], file_id)

            engine = FederatedLearningEngine(
                filepath=filepath,
                target_col=target_col,
                n_clients=n_clients,
                n_rounds=n_rounds,
                n_epochs=n_epochs,
                job=jobs[job_id],
                use_demo=use_demo,
            )
            engine.run()
            jobs[job_id]["status"] = "done"
        except Exception as e:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["logs"].append(f"ERROR: {e}")

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return jsonify({"job_id": job_id})


@app.route("/api/job/<job_id>", methods=["GET"])
def job_status(job_id):
    """Poll training job status."""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    j = jobs[job_id]
    return jsonify({
        "status": j["status"],
        "logs": j["logs"],
        "rounds": j["rounds"],
        "accuracy": j["accuracy"],
        "training_time": j["training_time"],
        "label_names": j["label_names"],
        "n_features": j["n_features"],
    })


@app.route("/api/detect", methods=["POST"])
def detect():
    """Run detection on uploaded CSV using trained model from a job."""
    data = request.json
    job_id  = data.get("job_id")
    file_id = data.get("file_id")

    if job_id not in jobs or jobs[job_id]["status"] != "done":
        return jsonify({"error": "Model not ready"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file_id)
    engine = jobs[job_id]["model"]

    try:
        results = engine.detect(filepath)
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/demo_detect", methods=["POST"])
def demo_detect():
    """Demo detection without uploading (uses built-in demo model)."""
    data = request.json
    job_id = data.get("job_id")
    if job_id not in jobs or jobs[job_id]["status"] != "done":
        return jsonify({"error": "Model not ready"}), 400
    engine = jobs[job_id]["model"]
    results = engine.detect_demo(n_samples=50)
    return jsonify({"success": True, "results": results})


@app.route("/api/download_results", methods=["POST"])
def download_results():
    """Download detection results as CSV."""
    import io, csv
    data = request.json
    results = data.get("results", [])
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["row", "timestamp", "source_ip", "dest_ip",
                                                 "protocol", "prediction", "confidence", "status"])
    writer.writeheader()
    writer.writerows(results)
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name="threat_detection_results.csv",
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
