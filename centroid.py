import geopandas as gpd
import pandas as pd


gdf = gpd.read_file("gadm41_THA_shp/gadm41_THA_1.shp")

gdf["lat"] = gdf.geometry.representative_point().y
gdf["lon"] = gdf.geometry.representative_point().x

coords_df = gdf[["NAME_1", "lat", "lon"]].copy()
coords_df.rename(columns={"NAME_1": "province"}, inplace=True)

coords_df.to_csv("raw_data/centroid.csv", index=False)