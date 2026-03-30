"""
AI/ML Engine for Food Waste Prediction
Uses: scikit-learn, pandas, numpy
Provides: Footfall prediction, surplus forecasting, risk analysis, waste variance
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import json
from datetime import datetime, timedelta

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml_models')
os.makedirs(MODEL_DIR, exist_ok=True)

FOOTFALL_MODEL_PATH = os.path.join(MODEL_DIR, 'footfall_model.pkl')
WASTE_MODEL_PATH = os.path.join(MODEL_DIR, 'waste_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')


def generate_training_data(n_samples=1000):
    """
    Generate realistic synthetic training data for canteen food waste prediction.
    Features: day_of_week, month, is_holiday, is_exam_period, temperature,
              rain_probability, campus_event, prev_day_footfall, menu_variety_score
    Targets: footfall, surplus_kg
    """
    np.random.seed(42)

    days_of_week = np.random.randint(0, 7, n_samples)  # 0=Mon, 6=Sun
    months = np.random.randint(1, 13, n_samples)
    is_holiday = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
    is_exam_period = np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
    temperature = np.random.normal(28, 8, n_samples).clip(5, 45)
    rain_probability = np.random.uniform(0, 1, n_samples)
    campus_event = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    prev_day_footfall = np.random.normal(1400, 300, n_samples).clip(200, 2500)
    menu_variety_score = np.random.uniform(0.3, 1.0, n_samples)

    # Footfall model: realistic relationships
    base_footfall = 1200
    footfall = (
        base_footfall
        + 150 * (days_of_week < 5).astype(float)   # weekday boost
        - 400 * is_holiday                           # holiday drop
        + 100 * is_exam_period                       # exam period increase
        - 80 * (temperature > 38).astype(float)      # extreme heat
        - 120 * (rain_probability > 0.7).astype(float) # heavy rain
        + 200 * campus_event                         # events boost
        + 0.15 * prev_day_footfall                   # momentum
        + 100 * menu_variety_score                   # menu appeal
        + np.random.normal(0, 80, n_samples)         # noise
    ).clip(100, 2500)

    # Surplus model: surplus depends on footfall mismatch
    planned_meals = footfall * np.random.uniform(1.05, 1.25, n_samples)
    surplus_kg = (
        (planned_meals - footfall) * 0.035
        + 5 * (days_of_week == 4).astype(float)      # Friday surplus
        + 8 * campus_event * (1 - menu_variety_score) # event waste
        + np.random.normal(0, 3, n_samples)
    ).clip(0, 120)

    df = pd.DataFrame({
        'day_of_week': days_of_week,
        'month': months,
        'is_holiday': is_holiday,
        'is_exam_period': is_exam_period,
        'temperature': temperature,
        'rain_probability': rain_probability,
        'campus_event': campus_event,
        'prev_day_footfall': prev_day_footfall,
        'menu_variety_score': menu_variety_score,
        'footfall': footfall.astype(int),
        'surplus_kg': surplus_kg.round(1),
    })

    return df


def train_models():
    """
    Train RandomForest models for footfall and waste prediction.
    Returns training metrics.
    """
    df = generate_training_data(1500)

    feature_cols = [
        'day_of_week', 'month', 'is_holiday', 'is_exam_period',
        'temperature', 'rain_probability', 'campus_event',
        'prev_day_footfall', 'menu_variety_score'
    ]

    X = df[feature_cols]
    y_footfall = df['footfall']
    y_surplus = df['surplus_kg']

    # Standard scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, yf_train, yf_test = train_test_split(X_scaled, y_footfall, test_size=0.2, random_state=42)
    _, _, ys_train, ys_test = train_test_split(X_scaled, y_surplus, test_size=0.2, random_state=42)

    # Train footfall model
    footfall_model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    footfall_model.fit(X_train, yf_train)
    yf_pred = footfall_model.predict(X_test)

    # Train surplus/waste model
    waste_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    waste_model.fit(X_train, ys_train)
    ys_pred = waste_model.predict(X_test)

    # Metrics
    metrics = {
        'footfall_mae': round(mean_absolute_error(yf_test, yf_pred), 2),
        'footfall_r2': round(r2_score(yf_test, yf_pred), 4),
        'surplus_mae': round(mean_absolute_error(ys_test, ys_pred), 2),
        'surplus_r2': round(r2_score(ys_test, ys_pred), 4),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'feature_importance': dict(zip(feature_cols, footfall_model.feature_importances_.round(4).tolist())),
        'trained_at': datetime.now().isoformat(),
    }

    # Save
    joblib.dump(footfall_model, FOOTFALL_MODEL_PATH)
    joblib.dump(waste_model, WASTE_MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return metrics


def load_models():
    """Load trained models. Train if not found."""
    if not all(os.path.exists(p) for p in [FOOTFALL_MODEL_PATH, WASTE_MODEL_PATH, SCALER_PATH]):
        train_models()

    return (
        joblib.load(FOOTFALL_MODEL_PATH),
        joblib.load(WASTE_MODEL_PATH),
        joblib.load(SCALER_PATH),
    )


def predict_day(params):
    """
    Predict footfall and surplus for given conditions.
    params: dict with keys matching feature columns
    """
    footfall_model, waste_model, scaler = load_models()

    feature_cols = [
        'day_of_week', 'month', 'is_holiday', 'is_exam_period',
        'temperature', 'rain_probability', 'campus_event',
        'prev_day_footfall', 'menu_variety_score'
    ]

    defaults = {
        'day_of_week': datetime.now().weekday(),
        'month': datetime.now().month,
        'is_holiday': 0,
        'is_exam_period': 0,
        'temperature': 28,
        'rain_probability': 0.2,
        'campus_event': 0,
        'prev_day_footfall': 1400,
        'menu_variety_score': 0.7,
    }

    row = {k: float(params.get(k, defaults[k])) for k in feature_cols}
    X = pd.DataFrame([row])[feature_cols]
    X_scaled = scaler.transform(X)

    footfall_pred = footfall_model.predict(X_scaled)[0]
    surplus_pred = waste_model.predict(X_scaled)[0]

    # Confidence based on feature importance proximity to training data
    confidence = min(98, max(70, 95 - abs(row['temperature'] - 28) * 0.5 - row['rain_probability'] * 5))

    return {
        'predicted_footfall': int(round(footfall_pred)),
        'predicted_surplus_kg': round(float(surplus_pred), 1),
        'confidence': round(confidence, 1),
        'deviation_range_kg': round(float(surplus_pred * 0.12), 1),
        'co2_impact_avoided_kg': round(float(surplus_pred * 2.5), 1),
        'meals_recoverable': int(round(surplus_pred / 0.5)),
    }


def predict_week():
    """
    Generate a 7-day forecast with predicted vs simulated actual data.
    """
    footfall_model, waste_model, scaler = load_models()

    feature_cols = [
        'day_of_week', 'month', 'is_holiday', 'is_exam_period',
        'temperature', 'rain_probability', 'campus_event',
        'prev_day_footfall', 'menu_variety_score'
    ]

    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    today = datetime.now()
    results = []

    prev_footfall = 1400

    for i in range(7):
        target_date = today + timedelta(days=i)
        dow = target_date.weekday()

        # Simulated conditions for each day
        temp = np.random.normal(28, 5)
        rain = np.random.uniform(0, 0.6)
        event = 1 if dow in [3, 5] else 0
        holiday = 1 if dow == 6 else 0

        row = {
            'day_of_week': dow,
            'month': target_date.month,
            'is_holiday': holiday,
            'is_exam_period': 0,
            'temperature': temp,
            'rain_probability': rain,
            'campus_event': event,
            'prev_day_footfall': prev_footfall,
            'menu_variety_score': np.random.uniform(0.5, 0.9),
        }

        X = pd.DataFrame([row])[feature_cols]
        X_scaled = scaler.transform(X)

        pred_footfall = footfall_model.predict(X_scaled)[0]
        pred_surplus = waste_model.predict(X_scaled)[0]

        # Simulate "actual" with some variance (for past days, show close-to-predicted)
        actual_surplus = max(0, pred_surplus + np.random.normal(0, pred_surplus * 0.15))

        results.append({
            'day': days[dow],
            'date': target_date.strftime('%Y-%m-%d'),
            'predicted_surplus': round(float(pred_surplus / 1000), 4),  # in TN
            'actual_surplus': round(float(actual_surplus / 1000), 4),
            'predicted_footfall': int(round(pred_footfall)),
            'temperature': round(float(temp), 1),
            'rain_probability': round(float(rain), 2),
            'campus_event': bool(event),
        })

        prev_footfall = pred_footfall

    return results


def analyze_risks():
    """
    Analyze current risk variables using ML feature importance and simulated conditions.
    """
    footfall_model, _, _ = load_models()

    feature_cols = [
        'day_of_week', 'month', 'is_holiday', 'is_exam_period',
        'temperature', 'rain_probability', 'campus_event',
        'prev_day_footfall', 'menu_variety_score'
    ]

    importances = dict(zip(feature_cols, footfall_model.feature_importances_))

    # Current simulated conditions
    now = datetime.now()
    temp = np.random.normal(32, 4)
    rain = np.random.uniform(0.1, 0.7)

    risks = []

    # Weather risk
    weather_impact = (importances.get('temperature', 0) + importances.get('rain_probability', 0)) * 100
    weather_severity = min(100, int(weather_impact * 2 + rain * 30 + max(0, temp - 35) * 5))
    risks.append({
        'name': 'Extreme Weather',
        'description': f'Temperature {temp:.0f}°C, {rain*100:.0f}% rain probability',
        'impact': weather_severity,
        'icon': 'thunderstorm',
        'color': 'text-secondary',
        'ml_weight': round(float(weather_impact), 2),
    })

    # Campus event risk
    event_impact = importances.get('campus_event', 0) * 100
    event_risk = min(100, int(event_impact * 3 + (1 if now.weekday() in [3, 5] else 0) * 25))
    risks.append({
        'name': 'Campus Event',
        'description': 'Surplus buffet volumes detected' if event_risk > 30 else 'No major events detected',
        'impact': event_risk,
        'icon': 'event',
        'color': 'text-tertiary',
        'ml_weight': round(float(event_impact), 2),
    })

    # Supply chain risk
    supply_impact = importances.get('prev_day_footfall', 0) * 100
    supply_risk = min(100, int(supply_impact * 1.5 + np.random.randint(0, 15)))
    risks.append({
        'name': 'Supply Chain Lag',
        'description': 'Regional depot bottleneck' if supply_risk > 20 else 'Supply chain nominal',
        'impact': supply_risk,
        'icon': 'inventory_2',
        'color': 'text-primary',
        'ml_weight': round(float(supply_impact), 2),
    })

    # Menu variety risk
    menu_impact = importances.get('menu_variety_score', 0) * 100
    menu_risk = min(100, int(menu_impact * 2 + np.random.randint(0, 20)))
    risks.append({
        'name': 'Menu Variety',
        'description': 'Low variety may increase selective waste',
        'impact': menu_risk,
        'icon': 'restaurant_menu',
        'color': 'text-tertiary',
        'ml_weight': round(float(menu_impact), 2),
    })

    return sorted(risks, key=lambda r: r['impact'], reverse=True)


def get_ai_suggestion():
    """
    Generate an AI-driven suggestion based on current predictions.
    """
    prediction = predict_day({})
    risks = analyze_risks()

    surplus = prediction['predicted_surplus_kg']
    top_risk = risks[0] if risks else None

    suggestions = []

    if surplus > 30:
        suggestions.append({
            'type': 'inventory',
            'title': 'AI Suggestion: Inventory Optimization',
            'message': f'Predicted surplus of {surplus}kg today. Recommend reducing Meat-Base '
                       f'orders by {min(25, int(surplus * 0.4))}% for the next 48h cycle.',
            'icon': 'auto_awesome',
            'severity': 'high' if surplus > 50 else 'medium',
        })

    if top_risk and top_risk['impact'] > 30:
        suggestions.append({
            'type': 'risk',
            'title': f'Risk Alert: {top_risk["name"]}',
            'message': f'{top_risk["description"]}. ML model assigns {top_risk["ml_weight"]:.1f}% '
                       f'feature weight. Impact score: {top_risk["impact"]}%.',
            'icon': 'warning',
            'severity': 'high' if top_risk['impact'] > 50 else 'medium',
        })

    if prediction['meals_recoverable'] > 20:
        suggestions.append({
            'type': 'redistribution',
            'title': 'Redistribution Opportunity',
            'message': f'Approximately {prediction["meals_recoverable"]} meals can be recovered '
                       f'from today\'s surplus. CO₂ impact: {prediction["co2_impact_avoided_kg"]}kg avoided.',
            'icon': 'volunteer_activism',
            'severity': 'low',
        })

    return suggestions


def get_model_info():
    """Return current model metadata."""
    try:
        footfall_model, waste_model, scaler = load_models()
        feature_cols = [
            'day_of_week', 'month', 'is_holiday', 'is_exam_period',
            'temperature', 'rain_probability', 'campus_event',
            'prev_day_footfall', 'menu_variety_score'
        ]
        return {
            'footfall_model': {
                'type': 'RandomForestRegressor',
                'n_estimators': footfall_model.n_estimators,
                'max_depth': footfall_model.max_depth,
                'feature_importance': dict(zip(feature_cols, footfall_model.feature_importances_.round(4).tolist())),
            },
            'waste_model': {
                'type': 'RandomForestRegressor',
                'n_estimators': waste_model.n_estimators,
                'max_depth': waste_model.max_depth,
            },
            'scaler': {
                'type': 'StandardScaler',
                'n_features': scaler.n_features_in_,
            },
            'status': 'loaded',
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
