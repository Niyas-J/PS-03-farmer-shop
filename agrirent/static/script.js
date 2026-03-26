// script.js

let map;
let userPos = { lat: 12.9716, lng: 77.5946 }; // Default: Bangalore
let userMarker = null;
let equipments = [];
let markers = [];
let markerCluster = null;

// Initialize Google Maps
function initApp() {
    // Attempt to get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setupMap();
            },
            () => {
                showLocationError();
                setupMap();
            }
        );
    } else {
        showLocationError();
        setupMap();
    }
}

function showLocationError() {
    document.getElementById('locationAlert').style.display = 'block';
}

function setupMap() {
    document.getElementById('mapLoader').style.display = 'none';

    map = new google.maps.Map(document.getElementById('map'), {
        center: userPos,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // User marker
    userMarker = new google.maps.Marker({
        position: userPos,
        map: map,
        title: "You are here",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    // Fetch equipments
    fetchEquipments();
}

async function fetchEquipments() {
    try {
        const mockedEquipments = [
            { id: '1', name: 'Mahindra 575 DI Tractor', price: 600, unit: 'hour', category: 'Tractors', availability: 'Available', description: 'Reliable generic tractor for heavy-duty farming.', image: '/static/tractor.jpg' },
            { id: '2', name: 'Drone Sprayers', price: 550, unit: 'hour', category: 'Drone Sprayers', availability: 'Available', description: 'Advanced agricultural drone for efficient crop spraying and analysis.', image: '/static/drone.jpg' },
            { id: '3', name: 'John Deere Harvester', price: 2000, unit: 'hour', category: 'Harvesters', availability: 'Available', description: 'Advanced combine harvester for efficient crop harvesting.', image: '/static/harvester.jpg' },
            { id: '4', name: 'Kubota Power Tiller', price: 400, unit: 'hour', category: 'Power tillers', availability: 'Available', description: 'Compact and easy-to-use power tiller for small farms.', image: '/static/powertiller.png' },
            { id: '5', name: 'Motorized Sprayer', price: 300, unit: 'hour', category: 'Sprayers', availability: 'Available', description: 'High-pressure commercial sprayer for pest control.', image: '/static/sprayer.jpg' },
            { id: '6', name: 'Rotavator', price: 500, unit: 'hour', category: 'Rotavators', availability: 'Available', description: 'Heavy-duty rotavator for excellent soil preparation.', image: '/static/rotavator.jpg' },
            { id: '7', name: 'Cultivator', price: 350, unit: 'hour', category: 'Cultivators', availability: 'Available', description: 'Durable 9-tine cultivator for breaking soil surface.', image: '/static/cultivator.jpg' },
            { id: '8', name: 'Seed Drill Machine', price: 450, unit: 'hour', category: 'Seed drills', availability: 'Available', description: 'Precision seed drill for accurate seed placement.', image: '/static/seed-drill.png' },
            { id: '9', name: 'Thresher Machine', price: 700, unit: 'hour', category: 'Threshers', availability: 'Available', description: 'Multi-crop thresher for wheat, maize, and soybeans.', image: '/static/thresher.png' },
            { id: '10', name: 'Mini Transport Vehicle', price: 400, unit: 'trip', category: 'Mini transport vehicles', availability: 'Available', description: 'Light transport vehicle for carrying farm produce.', image: '/static/minitransport.png' },
            { id: '11', name: 'Agricultural Water Pump', price: 200, unit: 'hour', category: 'Water pumps', availability: 'Available', description: 'Heavy-duty diesel water pump for irrigation.', image: '/static/waterpump.jpg' }
        ];

        // Add actual lat/lng based on user
        equipments = mockedEquipments.map(eq => {
            return {
                ...eq,
                lat: userPos.lat + (Math.random() - 0.5) * 0.02,
                lng: userPos.lng + (Math.random() - 0.5) * 0.02,
                distance: 0 // to be calculated
            };
        });

        calculateDistances();
        renderMapMarkers();
        renderEquipmentCards(equipments);
        setupFilters();
    } catch (error) {
        console.error("Error setting equipments:", error);
    }
}

// Haversine formula distance or Google Maps Geometry distance
function calculateDistances() {
    equipments.forEach(eq => {
        const p1 = new google.maps.LatLng(userPos.lat, userPos.lng);
        const p2 = new google.maps.LatLng(eq.lat, eq.lng);
        // Returns distance in meters
        const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        eq.distance = dist / 1000; // in km
    });
    // Sort by distance initially
    equipments.sort((a, b) => a.distance - b.distance);
}

function renderMapMarkers() {
    // Clear existing
    if (markerCluster) markerCluster.clearMarkers();
    markers.forEach(m => m.setMap(null));
    markers = [];

    const infoWindow = new google.maps.InfoWindow();

    equipments.forEach(eq => {
        const pos = { lat: eq.lat, lng: eq.lng };

        let iconColor = 'red';
        if (eq.availability === 'Available') iconColor = 'green';

        const marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: eq.name,
            icon: `http://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`
        });

        // Click event opens popup
        marker.addListener('click', () => {
            const content = `
                <div class="info-window">
                    <img src="${eq.image}" class="info-img" alt="${eq.name}">
                    <h3 style="margin-bottom:5px;">${eq.name}</h3>
                    <p style="font-size: 0.9em; margin-bottom:5px;"><b>Price:</b> ₹${eq.price}/${eq.unit || 'hour'} <br><b>Dist:</b> ${eq.distance.toFixed(1)} km</p>
                    <p class="card-status ${eq.availability === 'Available' ? 'status-available' : 'status-booked'}">${eq.availability}</p>
                    ${eq.availability === 'Available' ?
                    `<button class="btn-primary" style="padding: 5px 10px; width: 100%; margin-top:5px;" onclick="openModal('${eq.id}', '${eq.name}', '${eq.price}')">Book Now</button>`
                    : ''}
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
        eq.marker = marker; // Keep reference
    });

    // Implement Marker Clustering
    // Check if the script loaded properly
    if (typeof markerClusterer !== "undefined") {
        markerCluster = new markerClusterer.MarkerClusterer({ map, markers });
    }
}

function renderEquipmentCards(items) {
    const list = document.getElementById('equipmentList');
    list.innerHTML = '';

    if (items.length === 0) {
        list.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No equipment found matching criteria.</p>`;
        return;
    }

    items.forEach(eq => {
        const isAvail = eq.availability === 'Available';
        const distStr = eq.distance.toFixed(1);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${eq.image}" alt="${eq.name}" class="card-img" loading="lazy">
            <div class="card-content">
                <div class="card-category">${eq.category} • ${distStr} km away</div>
                <h3 class="card-title">${eq.name}</h3>
                <p class="card-status ${isAvail ? 'status-available' : 'status-booked'}">${eq.availability}</p>
                <div class="card-desc">${eq.description}</div>
                <div class="card-price">₹${eq.price} / ${eq.unit || 'hour'}</div>
                <button class="btn-primary btn-block" ${!isAvail ? 'disabled' : ''} onclick="openModal('${eq.id}', '${eq.name}', '${eq.price}')">
                    ${isAvail ? 'Book Now' : 'Currently Booked'}
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

// Search and Filter functionality
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const catFilter = document.getElementById('categoryFilter');

    const filterData = () => {
        const query = searchInput.value.toLowerCase();
        const cat = catFilter.value;

        const filtered = equipments.filter(eq => {
            const matchesSearch = eq.name.toLowerCase().includes(query) || eq.category.toLowerCase().includes(query);
            const matchesCat = cat === 'All' || eq.category === cat;
            return matchesSearch && matchesCat;
        });

        renderEquipmentCards(filtered);
    };

    searchInput.addEventListener('input', filterData);
    catFilter.addEventListener('change', filterData);
}

function findNearest() {
    if (equipments.length === 0) return;

    // Nearest is first since array is sorted by distance initially
    const nearest = equipments.find(e => e.availability === 'Available') || equipments[0];

    // Pan to marker
    map.setZoom(15);
    map.panTo(nearest.marker.getPosition());

    // Simulate click on marker to show info window
    google.maps.event.trigger(nearest.marker, 'click');
}

// Modal and Booking functionality
function openModal(id, name, price) {
    document.getElementById('modalEquipmentId').value = id;
    document.getElementById('modalEquipmentName').value = name;
    document.getElementById('modalPrice').textContent = `Total Estimated: ₹${price}`;
    document.getElementById('bookingModal').classList.add('active');
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

async function submitBooking() {
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    const eqId = document.getElementById('modalEquipmentId').value;
    const eqName = document.getElementById('modalEquipmentName').value;

    if (!date || !time) {
        alert("Please select both date and time.");
        return;
    }

    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipment_id: eqId, date, time })
        });

        const result = await response.json();

        if (result.success) {
            alert(`Booking Confirmed for ${eqName}! You will now be redirected to WhatsApp.`);

            // Build WhatsApp link
            const waNumber = '918217469646'; // Ensure this uses country code properly
            const msg = `Hello! I would like to book the *${eqName}* on ${date} at ${time}. Can you confirm?`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

            // Open WA in new tab
            window.open(waUrl, '_blank');

            closeModal();
            // Refresh equipments to update availability
            fetchEquipments();
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert("Server error occurred!");
    }
}
