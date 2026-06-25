import pandas as pd

df = pd.read_csv("raw_data/dengue.csv")

# print(df["adm_1_name"].unique())
# print(df["adm_1_name"].value_counts())

df = df[df["S_res"] == "Admin1"].copy()
print(df.shape)