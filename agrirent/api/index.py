from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import random

import os

template_dir = os.path.abspath(os.path.dirname(__file__) + '/../templates')
static_dir = os.path.abspath(os.path.dirname(__file__) + '/../static')
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
app.secret_key = 'agrirent_super_secret_key'

# Generate 50+ realistic farm equipments
import urllib.parse

def generate_equipments():
    categories = [
        "Tractors", "Harvesters", "Rotavators", "Sprayers", 
        "Cultivators", "Seed drills", "Power tillers", 
        "Threshers", "Mini transport vehicles", "Water pumps", "Drone sprayers"
    ]
    brands = ["Mahindra", "Swaraj", "John Deere India", "Sonalika", "Kubota", "TAFE"]
    
    equipments = []
    for i in range(1, 61):  # 60 items
        category = random.choice(categories)
        brand = random.choice(brands)
        name = f"{brand} {category} Model-{random.randint(100, 999)}"
        
        # Indian price ranges per hour/trip
        if category == "Tractors":
            price = random.randint(500, 800)
        elif category == "Harvesters":
            price = random.randint(1500, 2500)
        elif category in ["Sprayers", "Water pumps", "Drone sprayers"]:
            price = random.randint(200, 500)
        elif category in ["Rotavators", "Cultivators", "Seed drills"]:
            price = random.randint(400, 700)
        elif category == "Mini transport vehicles":
            price = random.randint(300, 600)
        else:
            price = random.randint(300, 800)
            
        # Specific search-based image logic replacing generic photos
        query = f"{brand} {category} agriculture india farm realistic photography"
        query_encoded = urllib.parse.quote(query)
        image_url = f"https://image.pollinations.ai/prompt/{query_encoded}?width=400&height=300&nologo=true&seed={i}"
            
        equipments.append({
            "id": i,
            "name": name,
            "category": category,
            "price": price,
            "description": f"Reliable {category.lower()} by {brand}. Well maintained and ready for your farm. High performance guaranteed.",
            "availability": random.choice(["Available", "Available", "Available", "Booked"]),
            "image": image_url,
            "lat_offset": (random.random() - 0.5) * 0.05,
            "lng_offset": (random.random() - 0.5) * 0.05
        })
    return equipments

# In-memory storage for demo
EQUIPMENTS = generate_equipments()
BOOKINGS = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/equipments')
def api_equipments():
    return jsonify(EQUIPMENTS)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        session['user'] = username
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    # Get user's bookings
    user_bookings = [b for b in BOOKINGS if b['user'] == session['user']]
    return render_template('dashboard.html', bookings=user_bookings, equipments=EQUIPMENTS)

@app.route('/book', methods=['POST'])
def book():
    data = request.json
    equipment_id = data.get('equipment_id')
    date = data.get('date')
    time = data.get('time')
    user = session.get('user', 'Guest User')
    
    for eq in EQUIPMENTS:
        if eq['id'] == int(equipment_id):
            if eq['availability'] == 'Booked':
                return jsonify({'success': False, 'message': 'Equipment is already booked!'})
            
            eq['availability'] = 'Booked' # Update status
            
            booking = {
                'id': len(BOOKINGS) + 1,
                'user': user,
                'equipment': eq['name'],
                'date': date,
                'time': time,
                'price': eq['price']
            }
            BOOKINGS.append(booking)
            return jsonify({'success': True, 'booking': booking, 'equipment': eq})
            
    return jsonify({'success': False, 'message': 'Equipment not found'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
