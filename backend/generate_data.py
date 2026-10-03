"""
Generate a realistic synthetic used-car dataset for demonstration purposes.
This data does NOT represent actual market prices.
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 3000

BRANDS = [
    "Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota",
    "Kia", "Mahindra", "Volkswagen", "Skoda", "Renault"
]

# Base price multipliers (₹ in lakhs) – relative premium per brand
BRAND_BASE = {
    "Maruti Suzuki": 4.5,
    "Hyundai": 5.5,
    "Tata": 5.0,
    "Honda": 6.5,
    "Toyota": 8.0,
    "Kia": 7.5,
    "Mahindra": 7.0,
    "Volkswagen": 9.0,
    "Skoda": 9.5,
    "Renault": 5.0,
}

FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]
TRANSMISSIONS = ["Manual", "Automatic"]

def fuel_multiplier(fuel):
    return {"Petrol": 1.0, "Diesel": 1.12, "CNG": 0.90, "Electric": 1.35, "Hybrid": 1.25}[fuel]

def trans_multiplier(tr):
    return 1.10 if tr == "Automatic" else 1.0

brand_col, year_col, km_col, fuel_col, trans_col, eng_col, owner_col, mileage_col, price_col = (
    [], [], [], [], [], [], [], [], []
)

for _ in range(N):
    brand = np.random.choice(BRANDS)
    year = int(np.random.randint(2010, 2025))
    age = 2025 - year

    fuel = np.random.choice(FUEL_TYPES, p=[0.50, 0.25, 0.08, 0.10, 0.07])
    trans = np.random.choice(TRANSMISSIONS, p=[0.60, 0.40])

    # Engine CC depends on fuel
    if fuel == "Electric":
        engine_cc = 0
    elif fuel == "CNG":
        engine_cc = int(np.random.choice([796, 998, 1197]))
    else:
        engine_cc = int(np.random.choice([796, 998, 1197, 1497, 1598, 1968, 2179, 2494],
                                         p=[0.05, 0.20, 0.25, 0.20, 0.10, 0.10, 0.05, 0.05]))

    owner_count = int(np.random.choice([1, 2, 3, 4], p=[0.55, 0.28, 0.12, 0.05]))

    # Mileage (km/l or km/kWh for EV labeled as 0 to flag)
    if fuel == "Electric":
        mileage = round(np.random.uniform(200, 450) / 100, 1)  # store as Wh/km proxy, UI handles it
    elif fuel == "CNG":
        mileage = round(np.random.uniform(20, 35) + np.random.randn() * 1.5, 1)
    elif fuel == "Diesel":
        mileage = round(np.random.uniform(15, 25) + np.random.randn() * 1.5, 1)
    elif fuel == "Hybrid":
        mileage = round(np.random.uniform(18, 28) + np.random.randn() * 1.5, 1)
    else:
        mileage = round(np.random.uniform(12, 22) + np.random.randn() * 1.5, 1)
    mileage = max(1.0, mileage)

    km_driven = int(np.random.exponential(scale=30000) + age * 8000)
    km_driven = max(500, min(km_driven, 300000))

    # Base price computation
    base = BRAND_BASE[brand]
    base *= fuel_multiplier(fuel)
    base *= trans_multiplier(trans)

    # Year effect: newer = more expensive
    year_effect = 1.0 + (year - 2010) * 0.06
    base *= year_effect

    # Engine effect
    if engine_cc > 0:
        base *= 1.0 + (engine_cc - 1000) / 10000

    # Km driven penalty
    km_penalty = 1.0 - (km_driven / 400000) * 0.5
    km_penalty = max(0.5, km_penalty)
    base *= km_penalty

    # Owner penalty
    owner_penalty = 1.0 - (owner_count - 1) * 0.07
    base *= owner_penalty

    # Random noise ±12%
    noise = np.random.uniform(0.88, 1.12)
    price_lakhs = base * noise
    price_lakhs = max(1.0, round(price_lakhs, 4))

    brand_col.append(brand)
    year_col.append(year)
    km_col.append(km_driven)
    fuel_col.append(fuel)
    trans_col.append(trans)
    eng_col.append(engine_cc)
    owner_col.append(owner_count)
    mileage_col.append(mileage)
    price_col.append(price_lakhs)  # in ₹ lakhs

df = pd.DataFrame({
    "brand": brand_col,
    "model_year": year_col,
    "kilometers_driven": km_col,
    "fuel_type": fuel_col,
    "transmission": trans_col,
    "engine_cc": eng_col,
    "owner_count": owner_col,
    "mileage": mileage_col,
    "price": price_col,
})

os.makedirs("data", exist_ok=True)
df.to_csv("data/car_data.csv", index=False)
print(f"Dataset created: {len(df)} rows -> data/car_data.csv")
print(df.describe())
