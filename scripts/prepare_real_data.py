import pandas as pd
import os

def main():
    print("Preparing real data for Vietnam...")
    base_dir = "data/rorygibb/output/model_data"
    dengue_path = os.path.join(base_dir, "ModelData_Dengue_VietAll.csv")
    climate_path = os.path.join(base_dir, "ModelData_ClimateLags_VietAll.csv.gz")

    if not os.path.exists(dengue_path) or not os.path.exists(climate_path):
        print("Required dataset files not found!")
        return

    # Read dengue data
    df_dengue = pd.read_csv(dengue_path)
    
    # Read climate data
    df_climate = pd.read_csv(climate_path, compression='gzip', usecols=['areaid', 'date', 'tmean', 'precip_0m', 'spei1_0m'])
    
    # Merge on areaid and date
    df_merged = pd.merge(df_dengue, df_climate, on=['areaid', 'date'], how='inner')
    
    # Group by province, year, month
    # We want to sum cases, and get average temperature and precipitation for the province
    # Map column names to our model's expectation
    # temperature -> tmean, humidity -> spei1_0m (proxy), rainfall -> precip_0m
    
    df_grouped = df_merged.groupby(['province', 'year', 'month']).agg({
        'cases': 'sum',
        'tmean': 'mean',
        'spei1_0m': 'mean',
        'precip_0m': 'mean'
    }).reset_index()
    
    # Rename columns to match what the ML model expects
    df_grouped.rename(columns={
        'province': 'region',
        'tmean': 'temperature',
        'spei1_0m': 'humidity', # Just a proxy
        'precip_0m': 'rainfall',
        'cases': 'dengue_cases'
    }, inplace=True)
    
    # Save the output
    out_dir = "data/final"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "real_vietnam_dataset.csv")
    df_grouped.to_csv(out_path, index=False)
    print(f"Data saved to {out_path}")
    print(f"Included provinces: {df_grouped['region'].unique()}")

if __name__ == "__main__":
    main()
