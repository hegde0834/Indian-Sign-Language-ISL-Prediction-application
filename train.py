"""Train the XGBoost sign classifier on data/dataset.csv."""
import json

import numpy as np
import pandas as pd  # installed with scikit-learn's usual stack; pip install pandas if missing
import xgboost as xgb
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

import config


def main():
    df = pd.read_csv(config.DATASET_PATH)
    X = df.drop(columns=["label"]).values.astype(np.float32)
    le = LabelEncoder()
    y = le.fit_transform(df["label"].values)
    print(f"{len(df)} samples, {len(le.classes_)} classes")

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        n_estimators=600,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.8,
        eval_metric="mlogloss",
        early_stopping_rounds=30,
        tree_method="hist",
        n_jobs=-1,
    )
    model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)

    pred = model.predict(X_te)
    print(f"Test accuracy: {accuracy_score(y_te, pred) * 100:.2f}%")
    print(classification_report(y_te, pred, target_names=le.classes_, zero_division=0))

    model.get_booster().save_model(config.MODEL_PATH)
    with open(config.LABELS_PATH, "w") as f:
        json.dump(list(le.classes_), f)
    print(f"Saved model -> {config.MODEL_PATH}")


if __name__ == "__main__":
    main()
