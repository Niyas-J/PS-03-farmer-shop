"""
AgriRent Flask Backend
======================
A REST API for the AgriRent farm equipment rental platform.

Setup:
    pip install flask flask-cors flask-sqlalchemy

Run:
    python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from functools import wraps
import uuid
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///agrirent.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

db = SQLAlchemy(app)

# =============================================================================
# Database Models
# =============================================================================

class Equipment(db.Model):
    """Model for farm equipment available for rent."""
    __tablename__ = 'equipment'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price_per_hour = db.Column(db.Float, nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float, default=0.0)
    reviews_count = db.Column(db.Integer, default=0)
    location = db.Column(db.String(200), nullable=False)
    available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(500))
    features = db.Column(db.JSON, default=list)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='equipment', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'pricePerHour': self.price_per_hour,
            'pricePerDay': self.price_per_day,
            'rating': self.rating,
            'reviews': self.reviews_count,
            'location': self.location,
            'available': self.available,
            'image': self.image_url,
            'features': self.features or [],
        }


class User(db.Model):
    """Model for platform users (farmers and equipment owners)."""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default='farmer')  # 'farmer' or 'owner'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = db.relationship('Equipment', backref='owner', lazy='dynamic')
    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
        }


class Booking(db.Model):
    """Model for equipment bookings/rentals."""
    __tablename__ = 'bookings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = db.Column(db.String(36), db.ForeignKey('equipment.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    duration_hours = db.Column(db.Integer, nullable=False)
    pickup_location = db.Column(db.String(200))
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        eq = Equipment.query.get(self.equipment_id)
        return {
            'id': self.id,
            'equipmentId': self.equipment_id,
            'equipmentName': eq.name if eq else 'Unknown',
            'equipmentImage': eq.image_url if eq else '',
            'customerName': self.customer_name,
            'date': self.booking_date.isoformat(),
            'startTime': self.start_time,
            'duration': self.duration_hours,
            'status': self.status,
            'totalPrice': self.total_price,
            'location': self.pickup_location,
        }


# =============================================================================
# API Routes - Equipment
# =============================================================================

@app.route('/api/equipment', methods=['GET'])
def get_equipment():
    """
    Get all available equipment with optional filtering.
    
    Query Parameters:
        - category: Filter by equipment category (e.g., 'tractor', 'harvester')
        - search: Search by name or location
        - available: Filter by availability (true/false)
        - min_price: Minimum hourly price
        - max_price: Maximum hourly price
    
    Returns:
        JSON array of equipment objects
    """
    query = Equipment.query
    
    # Apply filters
    category = request.args.get('category')
    if category and category != 'all':
        query = query.filter(Equipment.category == category)
    
    search = request.args.get('search')
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Equipment.name.ilike(search_term),
                Equipment.location.ilike(search_term)
            )
        )
    
    available = request.args.get('available')
    if available:
        query = query.filter(Equipment.available == (available.lower() == 'true'))
    
    min_price = request.args.get('min_price', type=float)
    if min_price:
        query = query.filter(Equipment.price_per_hour >= min_price)
    
    max_price = request.args.get('max_price', type=float)
    if max_price:
        query = query.filter(Equipment.price_per_hour <= max_price)
    
    equipment = query.order_by(Equipment.rating.desc()).all()
    return jsonify([eq.to_dict() for eq in equipment])


@app.route('/api/equipment/<equipment_id>', methods=['GET'])
def get_equipment_by_id(equipment_id):
    """Get a single equipment item by ID."""
    equipment = Equipment.query.get_or_404(equipment_id)
    return jsonify(equipment.to_dict())


@app.route('/api/equipment', methods=['POST'])
def create_equipment():
    """
    Create a new equipment listing.
    
    Request Body:
        {
            "name": "John Deere 6M Tractor",
            "category": "tractor",
            "pricePerHour": 75,
            "pricePerDay": 450,
            "location": "Greenfield Farm, Iowa",
            "image": "https://...",
            "features": ["140 HP", "4WD", "GPS Ready"]
        }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['name', 'category', 'pricePerHour', 'pricePerDay', 'location']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    equipment = Equipment(
        name=data['name'],
        category=data['category'],
        price_per_hour=data['pricePerHour'],
        price_per_day=data['pricePerDay'],
        location=data['location'],
        image_url=data.get('image', ''),
        features=data.get('features', []),
        available=data.get('available', True),
    )
    
    db.session.add(equipment)
    db.session.commit()
    
    return jsonify(equipment.to_dict()), 201


@app.route('/api/equipment/<equipment_id>', methods=['PUT'])
def update_equipment(equipment_id):
    """Update an existing equipment listing."""
    equipment = Equipment.query.get_or_404(equipment_id)
    data = request.get_json()
    
    if 'name' in data:
        equipment.name = data['name']
    if 'category' in data:
        equipment.category = data['category']
    if 'pricePerHour' in data:
        equipment.price_per_hour = data['pricePerHour']
    if 'pricePerDay' in data:
        equipment.price_per_day = data['pricePerDay']
    if 'location' in data:
        equipment.location = data['location']
    if 'image' in data:
        equipment.image_url = data['image']
    if 'features' in data:
        equipment.features = data['features']
    if 'available' in data:
        equipment.available = data['available']
    
    db.session.commit()
    return jsonify(equipment.to_dict())


@app.route('/api/equipment/<equipment_id>', methods=['DELETE'])
def delete_equipment(equipment_id):
    """Delete an equipment listing."""
    equipment = Equipment.query.get_or_404(equipment_id)
    db.session.delete(equipment)
    db.session.commit()
    return jsonify({'message': 'Equipment deleted successfully'})


# =============================================================================
# API Routes - Bookings
# =============================================================================

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    """
    Get all bookings with optional filtering.
    
    Query Parameters:
        - status: Filter by booking status
        - equipment_id: Filter by equipment
        - from_date: Filter bookings from this date
        - to_date: Filter bookings until this date
    """
    query = Booking.query
    
    status = request.args.get('status')
    if status:
        query = query.filter(Booking.status == status)
    
    equipment_id = request.args.get('equipment_id')
    if equipment_id:
        query = query.filter(Booking.equipment_id == equipment_id)
    
    from_date = request.args.get('from_date')
    if from_date:
        query = query.filter(Booking.booking_date >= datetime.fromisoformat(from_date).date())
    
    to_date = request.args.get('to_date')
    if to_date:
        query = query.filter(Booking.booking_date <= datetime.fromisoformat(to_date).date())
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return jsonify([booking.to_dict() for booking in bookings])


@app.route('/api/bookings/<booking_id>', methods=['GET'])
def get_booking_by_id(booking_id):
    """Get a single booking by ID."""
    booking = Booking.query.get_or_404(booking_id)
    return jsonify(booking.to_dict())


@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """
    Create a new booking.
    
    Request Body:
        {
            "equipmentId": "uuid",
            "date": "2026-03-28",
            "startTime": "08:00",
            "duration": 8,
            "name": "John Doe",
            "phone": "+1 555 000 0000",
            "location": "Farm address (optional)",
            "totalPrice": 450
        }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['equipmentId', 'date', 'startTime', 'duration', 'name', 'phone', 'totalPrice']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if equipment exists and is available
    equipment = Equipment.query.get(data['equipmentId'])
    if not equipment:
        return jsonify({'error': 'Equipment not found'}), 404
    
    if not equipment.available:
        return jsonify({'error': 'Equipment is not available'}), 400
    
    # Check for booking conflicts
    booking_date = datetime.fromisoformat(data['date']).date()
    existing_booking = Booking.query.filter(
        Booking.equipment_id == data['equipmentId'],
        Booking.booking_date == booking_date,
        Booking.status.in_(['pending', 'confirmed'])
    ).first()
    
    if existing_booking:
        return jsonify({'error': 'Equipment is already booked for this date'}), 409
    
    # Create the booking
    booking = Booking(
        equipment_id=data['equipmentId'],
        user_id=data.get('userId', 'guest'),
        booking_date=booking_date,
        start_time=data['startTime'],
        duration_hours=data['duration'],
        pickup_location=data.get('location', equipment.location),
        total_price=data['totalPrice'],
        customer_name=data['name'],
        customer_phone=data['phone'],
        status='confirmed',
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify(booking.to_dict()), 201


@app.route('/api/bookings/<booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update a booking (e.g., change status)."""
    booking = Booking.query.get_or_404(booking_id)
    data = request.get_json()
    
    if 'status' in data:
        valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        booking.status = data['status']
    
    if 'date' in data:
        booking.booking_date = datetime.fromisoformat(data['date']).date()
    if 'startTime' in data:
        booking.start_time = data['startTime']
    if 'duration' in data:
        booking.duration_hours = data['duration']
    if 'location' in data:
        booking.pickup_location = data['location']
    
    db.session.commit()
    return jsonify(booking.to_dict())


@app.route('/api/bookings/<booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    """Cancel a booking."""
    booking = Booking.query.get_or_404(booking_id)
    
    if booking.status in ['completed', 'cancelled']:
        return jsonify({'error': f'Cannot cancel a {booking.status} booking'}), 400
    
    booking.status = 'cancelled'
    db.session.commit()
    
    return jsonify(booking.to_dict())


# =============================================================================
# API Routes - Dashboard & Analytics
# =============================================================================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Get dashboard statistics.
    
    Returns:
        {
            "totalBookings": 125,
            "activeRentals": 8,
            "totalRevenue": 45600,
            "equipmentCount": 24,
            "recentBookings": [...],
            "revenueByMonth": [...]
        }
    """
    # Total bookings
    total_bookings = Booking.query.count()
    
    # Active rentals (confirmed bookings for today or future)
    today = datetime.utcnow().date()
    active_rentals = Booking.query.filter(
        Booking.status == 'confirmed',
        Booking.booking_date >= today
    ).count()
    
    # Total revenue (from completed and confirmed bookings)
    revenue_result = db.session.query(db.func.sum(Booking.total_price)).filter(
        Booking.status.in_(['confirmed', 'completed'])
    ).scalar()
    total_revenue = float(revenue_result) if revenue_result else 0.0
    
    # Equipment count
    equipment_count = Equipment.query.count()
    
    # Recent bookings
    recent_bookings = Booking.query.order_by(
        Booking.created_at.desc()
    ).limit(5).all()
    
    # Revenue by month (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    revenue_by_month = db.session.query(
        db.func.strftime('%Y-%m', Booking.booking_date).label('month'),
        db.func.sum(Booking.total_price).label('revenue')
    ).filter(
        Booking.booking_date >= six_months_ago.date(),
        Booking.status.in_(['confirmed', 'completed'])
    ).group_by('month').order_by('month').all()
    
    return jsonify({
        'totalBookings': total_bookings,
        'activeRentals': active_rentals,
        'totalRevenue': total_revenue,
        'equipmentCount': equipment_count,
        'recentBookings': [b.to_dict() for b in recent_bookings],
        'revenueByMonth': [
            {'month': r[0], 'revenue': float(r[1]) if r[1] else 0}
            for r in revenue_by_month
        ],
    })


@app.route('/api/dashboard/availability', methods=['GET'])
def get_availability():
    """
    Get equipment availability for a specific date range.
    
    Query Parameters:
        - equipment_id: Equipment to check
        - from_date: Start of date range
        - to_date: End of date range
    """
    equipment_id = request.args.get('equipment_id')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    if not all([equipment_id, from_date, to_date]):
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Get existing bookings for this equipment in the date range
    bookings = Booking.query.filter(
        Booking.equipment_id == equipment_id,
        Booking.booking_date >= datetime.fromisoformat(from_date).date(),
        Booking.booking_date <= datetime.fromisoformat(to_date).date(),
        Booking.status.in_(['pending', 'confirmed'])
    ).all()
    
    booked_dates = [b.booking_date.isoformat() for b in bookings]
    
    return jsonify({
        'equipmentId': equipment_id,
        'fromDate': from_date,
        'toDate': to_date,
        'bookedDates': booked_dates,
    })


# =============================================================================
# Error Handlers
# =============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


# =============================================================================
# Database Initialization & Sample Data
# =============================================================================

def init_db():
    """Initialize the database with sample data."""
    db.create_all()
    
    # Check if data already exists
    if Equipment.query.first():
        return
    
    # Sample equipment
    sample_equipment = [
        Equipment(
            name="John Deere 6M Series Tractor",
            category="tractor",
            price_per_hour=75,
            price_per_day=450,
            rating=4.9,
            reviews_count=128,
            location="Greenfield Farm, Iowa",
            available=True,
            image_url="https://images.unsplash.com/photo-1605002255096-5e07de85e1c1?w=800",
            features=["140 HP", "4WD", "GPS Ready"],
        ),
        Equipment(
            name="Case IH Combine Harvester",
            category="harvester",
            price_per_hour=150,
            price_per_day=900,
            rating=4.8,
            reviews_count=89,
            location="Prairie Valley, Nebraska",
            available=True,
            image_url="https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800",
            features=["Large Capacity", "Auto-Steer", "Yield Monitor"],
        ),
        Equipment(
            name="Precision Seed Drill",
            category="seeder",
            price_per_hour=45,
            price_per_day=280,
            rating=4.7,
            reviews_count=56,
            location="Harvest Hills, Kansas",
            available=True,
            image_url="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
            features=["24 Row", "Variable Rate", "GPS Mapping"],
        ),
        Equipment(
            name="Self-Propelled Sprayer",
            category="sprayer",
            price_per_hour=85,
            price_per_day=520,
            rating=4.6,
            reviews_count=42,
            location="Sunny Acres, California",
            available=False,
            image_url="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
            features=["1200 Gallon", "90ft Boom", "Auto Section"],
        ),
    ]
    
    for eq in sample_equipment:
        db.session.add(eq)
    
    db.session.commit()
    print("Database initialized with sample data!")


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == '__main__':
    with app.app_context():
        init_db()
    
    # Run the development server
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
