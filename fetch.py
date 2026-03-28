import requests
import json
import os
from datetime import datetime, timedelta
import time

# --- CONFIGURATION ---
API_KEY = "AACJH8eI3w37v5UTST7j86gjKSoOBRdGaf8whlUZ" # Put your single API key here
DATA_FILE = "astrology_data_2026_2027.json"
TARGET_START_DATE = datetime(2026, 3, 19)
TARGET_END_DATE = datetime(2027, 4, 6)
DAYS_PER_RUN = 16
# ---------------------

def fetch_astrology_data(endpoint, payload):
    url = f"https://json.freeastrologyapi.com/{endpoint}"
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[-] API Error {response.status_code} on {endpoint}: {response.text}")
        return None

def main():
    astrology_database = []
    start_date = TARGET_START_DATE
    
    # 1. LOAD PREVIOUS PROGRESS
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            try:
                astrology_database = json.load(f)
                if len(astrology_database) > 0:
                    last_saved_date_str = astrology_database[-1]['date']
                    last_saved_date = datetime.strptime(last_saved_date_str, '%Y-%m-%d')
                    start_date = last_saved_date + timedelta(days=1)
                    print(f"[+] Found existing data. Resuming from {start_date.strftime('%Y-%m-%d')}...")
            except json.JSONDecodeError:
                print("[-] Data file corrupted or empty. Starting fresh.")
    else:
        print(f"[+] Starting fresh fetch from {start_date.strftime('%Y-%m-%d')}...")

    # 2. CHECK IF WE ARE ALREADY DONE
    if start_date > TARGET_END_DATE:
        print("[+] All data up to April 6, 2027 has already been fetched!")
        return

    # 3. FETCH EXACTLY 16 DAYS
    current_date = start_date
    days_fetched_today = 0
    
    print(f"[*] Fetching up to {DAYS_PER_RUN} days of data...")
    print("-" * 30)
    
    while current_date <= TARGET_END_DATE and days_fetched_today < DAYS_PER_RUN:
        print(f"Fetching: {current_date.strftime('%Y-%m-%d')} (Day {days_fetched_today + 1}/{DAYS_PER_RUN})")
        
        payload = {
            "year": current_date.year,
            "month": current_date.month,
            "date": current_date.day,
            "hours": 6, "minutes": 0, "seconds": 0,
            "latitude": 17.38333,
            "longitude": 78.4666,
            "timezone": 5.5,
            "config": {
                "observation_point": "topocentric",
                "ayanamsha": "lahiri"
            }
        }
        
# Fetch the three endpoints with a 1-second pause in between
        tithi_data = fetch_astrology_data("tithi-durations", payload)
        time.sleep(1) # Tell the script to pause for 1 second
        
        nakshatra_data = fetch_astrology_data("nakshatra-durations", payload)
        time.sleep(1)
        
        month_data = fetch_astrology_data("lunarmonthinfo", payload)
        time.sleep(1)
        
        # If any request failed (like hitting the rate limit early), stop immediately
        if not tithi_data or not nakshatra_data or not month_data:
            print("\n[!] API rejected a request. Stopping early to save current progress.")
            break
            
        daily_record = {
            "date": current_date.strftime('%Y-%m-%d'),
            "tithi": tithi_data,
            "nakshatra": nakshatra_data,
            "lunar_month": month_data
        }
        
        astrology_database.append(daily_record)
        days_fetched_today += 1
        current_date += timedelta(days=1)
        
        time.sleep(1) # Be polite to the API server

    # 4. SAVE PROGRESS TO DISK
    with open(DATA_FILE, 'w') as f:
        json.dump(astrology_database, f, indent=4)
        
    print("-" * 30)
    print(f"[+] Done for today! Fetched {days_fetched_today} days.")
    print(f"[+] Database now holds {len(astrology_database)} total days of data.")
    
    if current_date <= TARGET_END_DATE:
        print(f"[*] Run this script again tomorrow to continue from {current_date.strftime('%Y-%m-%d')}.")
    else:
        print("[*] Project complete! You reached the target end date.")

if __name__ == "__main__":
    main()