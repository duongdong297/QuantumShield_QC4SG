import os
import time
import requests
import pandas as pd

coords_file = "raw_data/centroid.csv"
output_file = "thailand_weather_2015_2025.csv"


coords = pd.read_csv(coords_file)


successful_provinces = set()
if os.path.exists(output_file):
    try:
        existing_df = pd.read_csv(output_file)
        if not existing_df.empty and "province" in existing_df.columns:
           
            successful_provinces = set(existing_df["province"].unique())
            print(f"Checkpoint found: {len(successful_provinces)} provinces already successfully downloaded.")
    except Exception as e:
        print(f"Error reading existing checkpoint file, starting fresh: {str(e)}")

missing_coords = coords[~coords["province"].isin(successful_provinces)]
print(f"Remaining queue size: {len(missing_coords)} provinces to download.")


session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})


for index, row in missing_coords.iterrows():
    province = row["province"]
    lat = row["lat"]
    lon = row["lon"]
    
    url = (
        "https://power.larc.nasa.gov/api/temporal/monthly/point"
        "?parameters=T2M,RH2M,PRECTOTCORR"
        "&community=AG"
        f"&latitude={lat}"
        f"&longitude={lon}"
        "&start=2015"
        "&end=2025"
        "&format=JSON"
    )
    
    success = False
    weather_rows = []
    
    for attempt in range(3):
        try:
         
            response = session.get(url, timeout=20)
            
            if response.status_code == 422:
                print(f"Attempt {attempt + 1}: Received HTTP 422 for {province}. Checking parameters.")
                time.sleep(5)
                continue
                
            if response.status_code != 200:
                print(f"Attempt {attempt + 1}: Skipping {province} due to HTTP error {response.status_code}")
                time.sleep(5)
                continue
                
            data = response.json()
            weather = data["properties"]["parameter"]
            months = weather["T2M"].keys()
            
            for month in months:
                if len(month) != 6:
                    continue
                if int(month) > 202503:
                    continue
                    
                weather_rows.append({
                    "province": province,
                    "month": month,
                    "temperature": weather["T2M"][month],
                    "humidity": weather["RH2M"][month],
                    "rainfall": weather["PRECTOTCORR"][month]
                })
                
            print(f"Download successful for {province}")
            success = True
            break 
                
        except Exception as e:
            print(f"Connection error at {province} (Attempt {attempt + 1}/3): {str(e)}")
            time.sleep(5)
            
    if success and weather_rows:
       
        batch_df = pd.DataFrame(weather_rows)
        
      
        if not os.path.exists(output_file):
            batch_df.to_csv(output_file, index=False)
        else:
            batch_df.to_csv(output_file, mode='a', header=False, index=False)
    else:
        print(f"Complete failure after 3 attempts for province: {province}. Will be retried on next run.")
    
    time.sleep(3.5)

print("All pipeline synchronization attempts completed.")