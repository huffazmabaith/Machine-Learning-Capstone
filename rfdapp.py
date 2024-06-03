import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the saved model
loaded_model = load_model('recommendation_model.h5')

# Load the df
df = pd.read_csv('Data_v.3.csv')

# Handle missing values
df.fillna(0, inplace=True)
mask = df['Category'] == 'Tourist attraction'
df = df[~mask].reset_index(drop=True)

# Encode categorical features
category_encoder = LabelEncoder()
city_encoder = LabelEncoder()
df['Category_Encoded'] = category_encoder.fit_transform(df['Category'])
df['City_Encoded'] = city_encoder.fit_transform(df['City'])

# Retain original price and rating
original_price = df['Price'].values
original_rating = df['Rating'].values

# Normalize numerical features
scaler = MinMaxScaler()
df[['Price', 'Rating', 'Lat', 'Long']] = scaler.fit_transform(df[['Price', 'Rating', 'Lat', 'Long']])

# Combine numerical features with categorical features
features = np.hstack((df[['Category_Encoded', 'City_Encoded', 'Price', 'Rating', 'Lat', 'Long']].values,))

# Get the embeddings using the loaded model
embeddings = loaded_model.predict(features)

# Function to get recommendations
def recommend(place_id, top_n=5):
    idx = df.index[df['Place_Id'] == place_id].tolist()[0]
    place_name = df.loc[idx, 'Place_Name']
    place_category = df.loc[idx, 'Category']
    place_city = df.loc[idx, 'City']
    place_embedding = embeddings[idx]

    # Filter places with the same category and different city
    filtered_df = df[(df['Category'] == place_category) & (df['City'] != place_city)]
    filtered_indices = filtered_df.index
    filtered_embeddings = embeddings[filtered_indices]

    similarities = np.dot(filtered_embeddings, place_embedding)
    recommended_indices = filtered_indices[np.argsort(similarities)[::-1]]

    # Restrict recommendations to maximum 2 places per city
    city_counts = {}
    recommended_places = []
    for index in recommended_indices:
        city = df.loc[index, 'City']
        if city not in city_counts:
            city_counts[city] = 0
        if city_counts[city] < 2:
            recommended_places.append(index)
            city_counts[city] += 1
        if len(recommended_places) >= top_n:
            break

    # If less than top_n places are recommended, add places from other cities
    if len(recommended_places) < top_n:
        additional_places = filtered_df[~filtered_df.index.isin(recommended_places)].index[:top_n - len(recommended_places)]
        recommended_places.extend(additional_places)

    recommended_places = df.iloc[recommended_places]

    # Sort recommended places by price and rating
    recommended_places = recommended_places.sort_values(by=['Price', 'Rating'], ascending=[True, False])

    # Restore original price and rating
    recommended_places['Price'] = original_price[recommended_places.index]
    recommended_places['Rating'] = original_rating[recommended_places.index]

    print(f"Similar places to {place_name} in the {place_category} category from different cities:")
    print(recommended_places[['Place_Name', 'Category', 'City', 'Price', 'Rating']])

    return recommended_places[['Place_Name', 'Category', 'City', 'Price', 'Rating']]

# API endpoint for getting recommendations
@app.route('/recommend/<int:place_id>', methods=['GET'])
def get_recommendations(place_id):
    try:
        top_n_str = request.args.get('top_n', '5')
        top_n = int(top_n_str)
    except ValueError:
        return jsonify({"error": "top_n must be an integer"}), 400
    
    recommendations = recommend(place_id, top_n)
    
    return jsonify(recommendations.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
