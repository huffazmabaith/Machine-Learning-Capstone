from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
import joblib

app = Flask(__name__)

# Load the model
model = tf.keras.models.load_model('rec_model.h5')

# Load the scaler
scaler = joblib.load('scaler.pkl')

# Load the label encoders
le_category = joblib.load('le_category.pkl')
le_city = joblib.load('le_city.pkl')

# Load the data
data = pd.read_excel('Data_v.5.xlsx')

# Fit the encoders with all unique categories and cities
le_category.fit(data['Category'].unique())
le_city.fit(data['City'].unique())

# Transform the actual data
data['Category'] = data['Category'].apply(lambda x: le_category.transform([x])[0] if x in le_category.classes_ else -1)
data['City'] = data['City'].apply(lambda x: le_city.transform([x])[0] if x in le_city.classes_ else -1)

# Handle unknown categories and cities
if -1 in data['Category'].values:
    max_category = data['Category'].max()
    data.loc[data['Category'] == -1, 'Category'] = max_category + 1
    le_category.classes_ = np.append(le_category.classes_, 'Unknown')

if -1 in data['City'].values:
    max_city = data['City'].max()
    data.loc[data['City'] == -1, 'City'] = max_city + 1
    le_city.classes_ = np.append(le_city.classes_, 'Unknown')

X = data[['Category', 'City', 'Rating', 'Price','Lat','Long']].values

scaler = MinMaxScaler()
X[:, 2:] = scaler.fit_transform(X[:, 2:])

# Step 2: Feature Encoding
num_categories = len(le_category.classes_)
num_cities = len(le_city.classes_)
X_encoded = np.zeros((X.shape[0], num_categories + num_cities + 4))
X_encoded[:, :num_categories] = tf.keras.utils.to_categorical(X[:, 0], num_classes=num_categories)
X_encoded[:, num_categories:num_categories+num_cities] = tf.keras.utils.to_categorical(X[:, 1], num_classes=num_cities)
X_encoded[:, -4:] = X[:, 2:]  # Rating and Price

input_dim = X_encoded.shape[1]
hidden_dim = 64

@app.route('/recommend', methods=['GET'])
def recommend():
    attraction_name = request.args.get('attraction_name')
    if not attraction_name:
        return jsonify({"error": "No attraction name provided"}), 400

    recommendations = get_recommendations(attraction_name)
    return jsonify(recommendations)

def get_feature_vector(attraction_name):
    attraction = data[data['Place_Name'] == attraction_name].iloc[0]
    features = [
        attraction['Category'],
        attraction['City'],
        attraction['Rating'],
        attraction['Price'],
        attraction['Lat'],
        attraction['Long']
    ]
    
    encoded = np.zeros((1, input_dim))
    encoded[0, :num_categories] = tf.keras.utils.to_categorical(features[0], num_classes=num_categories)
    encoded[0, num_categories:num_categories+num_cities] = tf.keras.utils.to_categorical(features[1], num_classes=num_cities)
    encoded[0, -4:] = scaler.transform([features[2:]])
    
    return encoded

def get_recommendations(attraction_name, top_k=10):
    query_vector = get_feature_vector(attraction_name)
    query_embedding = model.predict(query_vector)
    
    all_embeddings = model.predict(X_encoded)
    similarities = np.dot(all_embeddings, query_embedding.T).flatten()
    
    top_indices = similarities.argsort()[::-1][1:top_k+1]  # Exclude the query itself
    top_attractions = data.iloc[top_indices]['Place_Name'].tolist()
    top_similarities = similarities[top_indices].tolist()
    
    recommendations = []
    for idx, (attraction, similarity) in enumerate(zip(top_attractions, top_similarities)):
        attraction_data = data[data['Place_Name'] == attraction].iloc[0]
        
        try:
            category = le_category.inverse_transform([attraction_data['Category']])[0]
        except ValueError:
            category = 'Unknown'
        
        try:
            city = le_city.inverse_transform([attraction_data['City']])[0]
        except ValueError:
            city = 'Unknown'
        
        recommendations.append({
            'rank': int(idx + 1),  
            'name': attraction,
            'similarity': float(similarity),  
            'category': category,
            'city': city,
            'rating': float(attraction_data['Rating']),  
            'price': float(attraction_data['Price']), 
            'lat': float(attraction_data['Lat']),  
            'long': float(attraction_data['Long'])  
        })
    
    return recommendations

if __name__ == '__main__':
    app.run(debug=True)
