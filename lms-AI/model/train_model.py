import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os
import numpy as np

# Create model directory if it doesn't exist
os.makedirs('model', exist_ok=True)

# Enhanced dataset with 500 samples
np.random.seed(42)

# Generate synthetic data that maintains realistic patterns
def generate_student_data(n_samples):
    study_hours = np.clip(np.random.normal(6, 2.5, n_samples), 0.5, 12)
    attendance = np.clip(np.random.normal(75, 15, n_samples), 30, 100)
    
    grades = []
    for h, a in zip(study_hours, attendance):
        # Base score weighted 60% study hours, 40% attendance
        score = (h * 6) + (a * 0.4) + np.random.normal(0, 3)
        
        if score > 85:
            grade = 'A'
        elif score > 75:
            grade = 'B'
        elif score > 65:
            grade = 'C'
        elif score > 55:
            grade = 'D'
        else:
            grade = 'F'
        grades.append(grade)
    
    return pd.DataFrame({
        'study_hours': np.round(study_hours, 1),
        'attendance': np.round(attendance, 1),
        'grade': grades
    })

# Generate 500 samples
df = generate_student_data(500)

# Data validation
print("Grade Distribution:")
print(df['grade'].value_counts())

print("\nAverage Study Hours by Grade:")
print(df.groupby('grade')['study_hours'].mean())

print("\nAverage Attendance by Grade:")
print(df.groupby('grade')['attendance'].mean())

# Prepare features and target
X = df[['study_hours', 'attendance']]
y = df['grade']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model with improved parameters
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    min_samples_split=5,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate model
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"\nTraining Accuracy: {train_score:.2f}")
print(f"Testing Accuracy: {test_score:.2f}")

# Save the model with versioning
model_version = "1.0"
model_filename = f"model/student_grade_predictor_v{model_version}.joblib"
joblib.dump(model, model_filename)

print(f"\nModel successfully trained and saved as {model_filename}")

# Save the training data for reference
df.to_csv('model/training_data.csv', index=False)