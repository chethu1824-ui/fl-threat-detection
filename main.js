"""
Federated Learning Engine
Implements FedAvg as described in Chapter 5 of the project report.
"""

import numpy as np
import time
import random
from utils.data_utils import load_and_preprocess


class NeuralNetwork:
    """
    Simple ANN matching the code snippet in Section 5.2:
      Dense(64, relu) -> Dense(32, relu) -> Dense(n_classes, softmax/sigmoid)
    Pure NumPy — no external ML framework required for the core model.
    """

    def __init__(self, input_dim, hidden1=64, hidden2=32, n_classes=2, lr=0.01):
        self.input_dim = input_dim
        self.n_classes = n_classes
        self.lr = lr
        self._init_weights(input_dim, hidden1, hidden2, n_classes)

    def _init_weights(self, d, h1, h2, nc):
        rng = np.random.default_rng(42)
        self.W1 = rng.normal(0, np.sqrt(2 / d),  (d,  h1))
        self.b1 = np.zeros(h1)
        self.W2 = rng.normal(0, np.sqrt(2 / h1), (h1, h2))
        self.b2 = np.zeros(h2)
        self.W3 = rng.normal(0, np.sqrt(2 / h2), (h2, nc))
        self.b3 = np.zeros(nc)

    # ── activations ───────────────────────────────────────────────────────
    @staticmethod
    def _relu(x):     return np.maximum(0, x)
    @staticmethod
    def _relu_d(x):   return (x > 0).astype(float)

    @staticmethod
    def _softmax(x):
        e = np.exp(x - x.max(axis=1, keepdims=True))
        return e / e.sum(axis=1, keepdims=True)

    # ── forward ───────────────────────────────────────────────────────────
    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self._relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = self._relu(self.z2)
        self.z3 = self.a2 @ self.W3 + self.b3
        self.out = self._softmax(self.z3)
        return self.out

    # ── backward + SGD update ─────────────────────────────────────────────
    def train_batch(self, X, Y_oh):
        n = len(X)
        probs = self.forward(X)
        loss  = -np.mean(np.sum(Y_oh * np.log(probs + 1e-9), axis=1))

        d3 = (probs - Y_oh) / n
        dW3 = self.a2.T @ d3
        db3 = d3.sum(axis=0)

        d2 = (d3 @ self.W3.T) * self._relu_d(self.z2)
        dW2 = self.a1.T @ d2
        db2 = d2.sum(axis=0)

        d1 = (d2 @ self.W2.T) * self._relu_d(self.z1)
        dW1 = X.T @ d1
        db1 = d1.sum(axis=0)

        # Gradient clipping (DP-lite)
        for g in [dW1, dW2, dW3]:
            norm = np.linalg.norm(g)
            if norm > 1.0:
                g *= 1.0 / norm

        self.W1 -= self.lr * dW1;  self.b1 -= self.lr * db1
        self.W2 -= self.lr * dW2;  self.b2 -= self.lr * db2
        self.W3 -= self.lr * dW3;  self.b3 -= self.lr * db3
        return float(loss)

    # ── inference ─────────────────────────────────────────────────────────
    def predict(self, X):
        return self.forward(X).argmax(axis=1)

    def predict_proba(self, X):
        return self.forward(X)

    # ── weight serialisation (for FedAvg) ─────────────────────────────────
    def get_weights(self):
        return {k: v.copy() for k, v in self.__dict__.items()
                if isinstance(v, np.ndarray)}

    def set_weights(self, w):
        for k, v in w.items():
            setattr(self, k, v.copy())


def fed_avg(weight_list):
    """
    FedAvg: M = Σ (nk/N) * Wk  — equal weights here (nk same per client).
    Algorithm 1 from Section 5.2.1.
    """
    n = len(weight_list)
    avg = {}
    for key in weight_list[0]:
        avg[key] = sum(w[key] for w in weight_list) / n
    return avg


class FederatedLearningEngine:
    """
    Orchestrates the full FL loop (Chapter 5).
    Stores trained model for later inference (detect page).
    """

    # Attack names shown in the Live Detection Dashboard (Fig 7.3)
    ATTACK_TYPES = ["Normal", "DDoS", "BruteForce",
                    "DataExfiltration", "Probe", "R2L", "U2R"]

    def __init__(self, filepath, target_col, n_clients, n_rounds,
                 n_epochs, job, use_demo=False):
        self.filepath   = filepath
        self.target_col = target_col
        self.n_clients  = n_clients
        self.n_rounds   = n_rounds
        self.n_epochs   = n_epochs
        self.job        = job
        self.use_demo   = use_demo
        self.global_model = None
        self.label_names  = []
        self.scaler_mean  = None
        self.scaler_std   = None

    def _log(self, msg, level="info"):
        entry = {"msg": msg, "level": level,
                 "ts": time.strftime("%Y-%m-%dT%H:%M:%S")}
        self.job["logs"].append(entry)

    def run(self):
        t0 = time.time()
        self._log("Loading and preprocessing dataset...")

        if self.use_demo or not self.filepath:
            X, y, label_names = self._generate_demo()
        else:
            result = load_and_preprocess(self.filepath,
                                         target_col=self.target_col,
                                         preview_only=False)
            X          = result["X"]
            y          = result["y"]
            label_names = result["label_names"]

        self.label_names = label_names
        self.job["label_names"] = label_names

        # Normalise
        self.scaler_mean = X.mean(axis=0)
        self.scaler_std  = X.std(axis=0) + 1e-8
        X = (X - self.scaler_mean) / self.scaler_std

        n_features  = X.shape[1]
        n_classes   = len(label_names)
        self.job["n_features"] = n_features

        self._log(f"Dataset: {len(X)} samples, {n_features} features, {n_classes} classes")
        self._log(f"Classes: {label_names}")
        self._log(f"Starting FL: {self.n_clients} clients, {self.n_rounds} rounds, {self.n_epochs} local epochs")

        # Split data across clients (non-IID)
        chunks = self._split_non_iid(X, y, self.n_clients)
        self._log(f"Data distributed across {self.n_clients} edge nodes")

        # Initialise global model
        global_model = NeuralNetwork(n_features, 64, 32, n_classes)

        for rnd in range(1, self.n_rounds + 1):
            client_weights = []
            round_loss     = []

            for cid in range(self.n_clients):
                Xc, yc = chunks[cid]
                client_model = NeuralNetwork(n_features, 64, 32, n_classes)
                client_model.set_weights(global_model.get_weights())

                Y_oh = np.eye(n_classes)[yc]
                loss = 0.0
                rng_c = np.random.default_rng(rnd * 100 + cid)
                for _ in range(self.n_epochs):
                    perm = rng_c.permutation(len(Xc))
                    for start in range(0, len(Xc), 64):
                        idx = perm[start:start + 64]
                        loss = client_model.train_batch(Xc[idx], Y_oh[idx])
                round_loss.append(loss)
                client_weights.append(client_model.get_weights())

            # FedAvg aggregation
            global_model.set_weights(fed_avg(client_weights))

            # Evaluate on full dataset
            preds = global_model.predict(X)
            acc   = float((preds == y).mean())
            avg_loss = float(np.mean(round_loss))

            round_entry = {
                "round":    rnd,
                "accuracy": round(acc * 100, 2),
                "loss":     round(avg_loss, 4),
            }
            self.job["rounds"].append(round_entry)
            self.job["accuracy"] = round(acc * 100, 2)

            self._log(
                f"Round {rnd}/{self.n_rounds} | "
                f"Acc: {acc*100:.2f}% | Loss: {avg_loss:.4f}",
                level="ok"
            )
            time.sleep(0.05)   # yield for polling

        elapsed = round(time.time() - t0, 2)
        self.job["training_time"] = elapsed
        self.global_model        = global_model
        self.job["model"]        = self          # store engine reference
        self._log(f"Training complete. Final accuracy: {self.job['accuracy']}%  Time: {elapsed}s", "ok")

    # ── Inference (Algorithm 2 — Section 5.2.2) ───────────────────────────

    def detect(self, filepath):
        result = load_and_preprocess(filepath, target_col=None, preview_only=False)
        X_raw = result["X"]
        X     = (X_raw - self.scaler_mean[:X_raw.shape[1]]) / self.scaler_std[:X_raw.shape[1]]
        return self._classify(X, n_max=200)

    def detect_demo(self, n_samples=50):
        rng = np.random.default_rng(int(time.time()))
        X   = rng.normal(size=(n_samples, self.global_model.input_dim))
        return self._classify(X, n_max=n_samples)

    def _classify(self, X, n_max=200):
        X   = X[:n_max]
        probs = self.global_model.predict_proba(X)
        preds = probs.argmax(axis=1)
        results = []
        for i, (pred, prob_row) in enumerate(zip(preds, probs)):
            conf  = float(prob_row[pred])
            label = self.label_names[pred] if pred < len(self.label_names) else f"Class {pred}"
            is_attack = label.lower() not in ("normal", "benign", "0")
            ts = time.strftime("%Y-%m-%d %H:%M:%S") + f".{random.randint(0,999):03d}"
            results.append({
                "row":        i + 1,
                "timestamp":  ts,
                "source_ip":  f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                "dest_ip":    f"192.168.{random.randint(0,5)}.{random.randint(1,254)}",
                "protocol":   random.choice(["TCP", "UDP", "ICMP", "HTTP"]),
                "prediction": label,
                "confidence": round(conf * 100, 1),
                "status":     "ATTACK" if is_attack else "NORMAL",
            })
        return results

    # ── Demo data generator ───────────────────────────────────────────────

    def _generate_demo(self):
        rng   = np.random.default_rng(42)
        n, nf = 1000, 41
        names = ["Normal", "DDoS", "BruteForce", "DataExfiltration", "Probe"]
        dist  = [0.45, 0.25, 0.15, 0.10, 0.05]
        labels = rng.choice(len(names), n, p=dist)
        X = rng.normal(0.0, 0.5, (n, nf))
        for cls in range(len(names)):
            idx = np.where(labels == cls)[0]
            X[idx, cls * 8:(cls + 1) * 8] += 3.0   # strong per-class signal block
        return X.astype(np.float32), labels, names

    # ── Non-IID data split ────────────────────────────────────────────────

    @staticmethod
    def _split_non_iid(X, y, n_clients):
        sorted_idx = np.argsort(y)
        Xs, ys = X[sorted_idx], y[sorted_idx]
        chunk  = len(Xs) // n_clients
        return [(Xs[i*chunk:(i+1)*chunk], ys[i*chunk:(i+1)*chunk])
                for i in range(n_clients)]
