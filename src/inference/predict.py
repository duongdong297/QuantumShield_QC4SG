import joblib

def predict(features_df, horizon=1):
    bundle = joblib.load(f'models/model_h{horizon}.pkl')
    model = bundle['model']
    return float(model.predict(features_df)[0])
