"""
Data loading and preprocessing utilities.
Handles NSL-KDD and any generic CSV with numeric + label column.
"""

import numpy as np
import os


def load_and_preprocess(filepath, target_col=None, preview_only=False):
    """
    Load a CSV file, detect the label column, encode labels, return numpy arrays.
    If preview_only=True returns metadata only (no full arrays).
    """
    import csv

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        sample = f.read(4096)
    dialect = csv.Sniffer().sniff(sample, delimiters=",\t;")
    sep = dialect.delimiter

    # Read all rows
    rows, header = [], None
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f, delimiter=sep)
        for i, row in enumerate(reader):
            if i == 0:
                header = [h.strip().strip('"') for h in row]
                continue
            rows.append([v.strip().strip('"') for v in row])

    if not header or not rows:
        raise ValueError("Empty or unreadable CSV file.")

    if preview_only:
        return {
            "rows":    len(rows),
            "columns": header,
            "n_cols":  len(header),
        }

    # Detect label column
    label_synonyms = ["label", "class", "target", "attack", "attack_type",
                      "category", "type", "threat", "attack_cat"]
    label_idx = None

    if target_col and target_col in header:
        label_idx = header.index(target_col)
    else:
        for syn in label_synonyms:
            for i, h in enumerate(header):
                if syn in h.lower():
                    label_idx = i
                    break
            if label_idx is not None:
                break

    feature_indices = [i for i in range(len(header)) if i != label_idx]
    feature_indices = feature_indices[:41]   # cap at 41 (NSL-KDD)

    # Parse numeric features
    X_raw, y_raw = [], []
    for row in rows:
        if len(row) < len(feature_indices):
            continue
        try:
            feats = [_to_float(row[i]) for i in feature_indices]
        except Exception:
            continue
        X_raw.append(feats)
        if label_idx is not None and label_idx < len(row):
            y_raw.append(row[label_idx].strip().lower())
        else:
            y_raw.append("unknown")

    if not X_raw:
        raise ValueError("No numeric rows found in the file.")

    X = np.array(X_raw, dtype=np.float32)

    # Encode labels
    unique_labels = sorted(set(y_raw))
    # Put 'normal' / 'benign' / '0' first so index 0 = normal
    priority = {"normal", "benign", "0", "legitimate"}
    normal_labels = [l for l in unique_labels if l in priority]
    other_labels  = [l for l in unique_labels if l not in priority]
    ordered = normal_labels + sorted(other_labels)

    label_map  = {l: i for i, l in enumerate(ordered)}
    y          = np.array([label_map[l] for l in y_raw], dtype=np.int32)

    # Nice display names
    display_names = []
    for l in ordered:
        d = l.replace("_", " ").title()
        display_names.append(d)

    return {
        "X":           X,
        "y":           y,
        "label_names": display_names,
        "n_features":  X.shape[1],
        "n_classes":   len(ordered),
        "rows":        len(X),
        "columns":     header,
        "n_cols":      len(header),
    }


def _to_float(v):
    """Convert a cell value to float, encoding strings as hash-based float."""
    try:
        return float(v)
    except ValueError:
        # Ordinal encoding for categorical features
        return float(abs(hash(v)) % 1000) / 1000.0
