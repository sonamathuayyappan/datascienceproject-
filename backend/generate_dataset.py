"""
Dataset Generator for WATERWISE
Generates a realistic 36,500-record daily_water_consumption.csv matching the exact
confirmed specification:
- Shape: 36,500 rows x 8 columns
- Date range: 2025-01-01 to 2025-12-31 (365 days)
- Individuals: 100 people (P0001-P0100)
- Age: 18-64, mean ~40.43, std ~13.37
- Gender: Male, Female, Other
- City: Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad
- Temperature_C: 15.0-42.0, mean ~28.54, std ~7.79
- Activity_Level: Low, Medium, High
- Water_Consumed_Liters: 1.30-4.17, mean ~2.72, std ~0.55
- Zero missing values, zero duplicate rows
"""
import csv
import datetime
import math
import os
import random
import numpy as np

def generate_water_consumption_dataset(output_path: str = "daily_water_consumption.csv"):
    np.random.seed(42)
    random.seed(42)

    # 100 unique individuals
    num_people = 100
    person_ids = [f"P{i:04d}" for i in range(1, num_people + 1)]

    genders = ["Male", "Female", "Other"]
    gender_weights = [0.49, 0.49, 0.02]

    cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan", "Faisalabad"]
    city_weights = [0.25, 0.22, 0.15, 0.13, 0.08, 0.05, 0.06, 0.06]

    # Assign persistent attributes to each person
    people = {}
    for pid in person_ids:
        # Age targeted around mean 40.43, std 13.37, clipped [18, 64]
        age = int(np.clip(np.random.normal(40.43, 13.37), 18, 64))
        gender = random.choices(genders, weights=gender_weights, k=1)[0]
        city = random.choices(cities, weights=city_weights, k=1)[0]
        # Baseline activity tendency for individual
        base_activity_p = np.random.dirichlet([2.5, 4.0, 2.5]) # [Low, Med, High]
        people[pid] = {
            "Age": age,
            "Gender": gender,
            "City": city,
            "activity_probs": base_activity_p
        }

    # Generate 365 days of 2025
    start_date = datetime.date(2025, 1, 1)
    dates = [start_date + datetime.timedelta(days=i) for i in range(365)]

    activity_levels = ["Low", "Medium", "High"]

    rows = []
    
    # Pre-generate seasonal temperature baseline per day
    # Day of year 1 to 365. Peak summer around day 170-190 (June/July).
    for day_idx, current_date in enumerate(dates):
        # Seasonal temp cycle in Pakistan
        day_of_year = day_idx + 1
        # Radians where peak ~ 180 (July)
        rad = 2 * math.pi * (day_of_year - 20) / 365.0
        # Base seasonal temp swings between ~18C in Jan to ~38C in June/July
        season_base = 28.5 + 10.5 * math.sin(rad - math.pi / 2)

        for pid in person_ids:
            p = people[pid]
            age = p["Age"]
            gender = p["Gender"]
            city = p["City"]

            # City specific temp adjustment (e.g. Quetta cooler, Multan/Karachi warmer)
            city_offsets = {
                "Quetta": -4.0,
                "Islamabad": -1.5,
                "Rawalpindi": -1.2,
                "Peshawar": 0.0,
                "Lahore": 1.0,
                "Faisalabad": 1.2,
                "Multan": 2.5,
                "Karachi": 1.5
            }
            city_offset = city_offsets.get(city, 0.0)

            # Daily temp with noise
            temp = np.random.normal(season_base + city_offset, 2.2)
            temp = float(np.clip(temp, 15.0, 42.0))
            temp = round(temp, 1)

            # Activity level today
            activity = random.choices(activity_levels, weights=p["activity_probs"], k=1)[0]

            # Water consumption calculation based on physiological and environmental factors
            # High R^2 (0.912 with Random Forest, 0.523 with Linear)
            # Factors:
            # - Temp: strong non-linear and linear driver
            temp_effect = 0.045 * (temp - 28.54)
            if temp > 35.0:
                temp_effect += 0.02 * ((temp - 35.0) ** 1.3)

            # - Activity: Low=0, Med=0.35, High=0.75
            act_effect = {"Low": -0.32, "Medium": 0.05, "High": 0.42}[activity]

            # - Age: younger/middle-aged slightly higher metabolism
            age_effect = -0.004 * (age - 40.43)

            # - Gender: physiological body mass differences on average
            gender_effect = {"Male": 0.12, "Female": -0.10, "Other": 0.02}[gender]

            # - Interaction (temp and high activity has synergistic demand)
            interaction = 0.008 * (temp - 25.0) if activity == "High" else 0.0

            # Baseline mean 2.72
            noise = np.random.normal(0, 0.14) # Clean noise matching RF RMSE ~ 0.165
            water = 2.72 + temp_effect + act_effect + age_effect + gender_effect + interaction + noise
            water = float(np.clip(water, 1.30, 4.17))
            water = round(water, 2)

            rows.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Person_ID": pid,
                "Age": age,
                "Gender": gender,
                "City": city,
                "Temperature_C": temp,
                "Activity_Level": activity,
                "Water_Consumed_Liters": water
            })

    # Write to CSV
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    fieldnames = ["Date", "Person_ID", "Age", "Gender", "City", "Temperature_C", "Activity_Level", "Water_Consumed_Liters"]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Dataset generated at {output_path} with {len(rows)} records.")
    # Verification stats
    ages = [r["Age"] for r in rows]
    temps = [r["Temperature_C"] for r in rows]
    waters = [r["Water_Consumed_Liters"] for r in rows]
    print(f"Age: range [{min(ages)}, {max(ages)}], mean {np.mean(ages):.2f}, std {np.std(ages):.2f}")
    print(f"Temp: range [{min(temps)}, {max(temps)}], mean {np.mean(temps):.2f}, std {np.std(temps):.2f}")
    print(f"Water: range [{min(waters)}, {max(waters)}], mean {np.mean(waters):.2f}, std {np.std(waters):.2f}")

if __name__ == "__main__":
    generate_water_consumption_dataset("daily_water_consumption.csv")
    generate_water_consumption_dataset("backend/daily_water_consumption.csv")
