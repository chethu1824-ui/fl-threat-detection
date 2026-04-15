# Real-Time Cyber Threat Detection Using Federated Learning



---

## Overview

A real-time cyber threat detection system built with **Federated Machine Learning (FML)**. Models train locally on distributed edge nodes — only weight updates are shared with the central aggregator via **FedAvg**. Raw data never leaves the device.

### Features
- Upload any CSV dataset (NSL-KDD, CIC-IDS, UNSW-NB15, custom)
- Configurable FL: clients, rounds, local epochs
- FedAvg aggregation with gradient clipping (differential privacy)
- Live attack detection dashboard (Fig 7.3 in report)
- Accuracy vs Loss convergence charts (Fig 7.2)
- Attack classification: Normal, DDoS, BruteForce, DataExfiltration, Probe, R2L, U2R
- Download results as CSV

---

## Project Structure

```
cyber_threat_fl/
├── app.py                  # Flask application (routes + API)
├── requirements.txt
├── models/
│   ├── __init__.py
│   └── federated.py        # FedAvg engine + Neural Network (Algorithm 1 & 2)
├── utils/
│   ├── __init__.py
│   └── data_utils.py       # CSV parsing, label encoding, normalisation
├── templates/
│   ├── base.html           # Dark-themed navbar layout
│   ├── index.html          # Home page
│   ├── train.html          # Training config + progress + curves (Fig 7.1, 7.2)
│   ├── detect.html         # Live detection page (Fig 7.3)
│   └── dashboard.html      # System dashboard
├── static/
│   ├── css/style.css       # Dark blue theme matching report screenshots
│   └── js/
│       ├── main.js         # Shared utilities + drag-drop
│       ├── train.js        # Training page logic + Chart.js rendering
│       ├── detect.js       # Detection + results table
│       └── dashboard.js    # Dashboard charts + feed
└── uploads/                # Uploaded datasets (git-ignored)
```

---

## Installation & Run

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cyber_threat_fl.git
cd cyber_threat_fl

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
python app.py
```

Open [http://localhost:5000](http://localhost:5000)

---

## Usage

### Step 1 — Train
1. Go to **Train** page
2. Upload your CSV dataset **or** click "Use Built-In Demo Dataset"
3. Select the target/label column, set number of clients, rounds, epochs
4. Click **Start Training** — watch round-by-round accuracy and loss live

### Step 2 — Detect
1. Go to **Detect** page (model is stored in session after training)
2. Upload a new CSV for detection **or** click "Run Demo Detection"
3. Results table shows each flow: timestamp, source IP, prediction, confidence, ATTACK/NORMAL

### Step 3 — Dashboard
- View accuracy/loss curves, attack distribution pie chart, and full live detection feed

---

## Supported Datasets

| Dataset | Label column | Notes |
|---|---|---|
| NSL-KDD | `label` | Normal, DoS, Probe, R2L, U2R |
| CIC-IDS2017 | `Label` | BENIGN + 14 attack types |
| UNSW-NB15 | `label` | Normal + 9 attack categories |
| Custom CSV | any column | Auto-detected |

---

## Algorithms

**Algorithm 1 — FedAvg** (Section 5.2.1):
```
Initialize global model M
For each round t:
  For each client k:
    Send M to client k
    Train locally for E epochs on dataset Dk
    Compute local update Uk
  Server aggregates: M = Σ (nk/N) * Uk
Return M
```

**Algorithm 2 — Threat Classification** (Section 5.2.2):
```
Input: Network data sample X
Load Global Model M
Predict = M(X)
If Predict == 'Malicious': Trigger Alert
Else: Allow Activity
```

---

## Tech Stack

- **Backend:** Python 3.8+, Flask
- **ML:** NumPy (pure — no TensorFlow/PyTorch required for core model)
- **Frontend:** Vanilla JS, Chart.js 4.x
- **Architecture:** ANN — Dense(64, ReLU) → Dense(32, ReLU) → Dense(n_classes, Softmax)

---

## References

See Bibliography in project report (10 IEEE/ACM papers, 2024–2025).

---

## License

MIT — for academic/educational use.
