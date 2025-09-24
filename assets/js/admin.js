document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');

    async function loadLocations() {
        try {
            const res = await fetch('https://localhost:7203/Location', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const locations = await res.json();
            const select = document.getElementById('new-room-location');
            select.innerHTML = '<option value="">Select Location</option>';

            locations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.id;
                option.textContent = `${loc.city}, ${loc.country}`;
                select.appendChild(option);
            });
        } catch (err) {
            console.error('Error loading locations:', err);
        }
    }

    async function loadRooms() {
        try {
            const roomsRes = await fetch(`https://localhost:7203/Room`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const rooms = await roomsRes.json();
            const roomList = document.getElementById('room-list');
            roomList.innerHTML = "";

            for (const room of rooms) {
                const html = `
                  <div class="room-list-item" id="room-${room.id}">
                    <div>
                      <h6>${room.name}</h6>
                      <p class="text-muted">Capacity: ${room.capacity}</p>
                      <p class="text-muted features" id="features-${room.id}">Features: <span>Loading...</span></p>
                    </div>
                    <div>
                      <button class="btn btn-warning btn-sm edit-room" data-id="${room.id}">Edit</button>
                      <button class="btn btn-danger btn-sm delete-room" data-id="${room.id}">Delete</button>
                    </div>
                  </div>
                `;
                roomList.insertAdjacentHTML('beforeend', html);

                try {
                    const featuresRes = await fetch(`https://localhost:7203/Room/${room.id}/features`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    const features = featuresRes.ok ? await featuresRes.json() : [];
                    const featureContainer = document.getElementById(`features-${room.id}`);
                    featureContainer.innerHTML = features.length > 0
                        ? features.map(f => f.feature1).join(", ")
                        : "No features assigned";
                } catch (err) {
                    console.error(`Error loading features for room ${room.id}:`, err);
                    document.getElementById(`features-${room.id}`).innerHTML = "Could not load features";
                }
            }
        } catch (err) {
            console.error('Rooms fetch error:', err);
        }
    }
    async function loadUsers() {
        try {
            const usersRes = await fetch(`https://localhost:7203/User`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const users = await usersRes.json();
            const userList = document.getElementById('user-list');
            userList.innerHTML = "";

            users.forEach(user => {
                const roles = user.roles.join(", ");
                const html = `
                  <div class="user-list-item" id="user-${user.id}">
                    <div>
                      <h6>${user.name}</h6>
                      <p class="text-muted">${user.email}, Role: ${roles}</p>
                    </div>
                    <div>
                      <button class="btn btn-warning btn-sm edit-user" data-id="${user.id}">Edit</button>
                      <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Delete</button>
                    </div>
                  </div>
                `;
                userList.insertAdjacentHTML('beforeend', html);
            });
        } catch (err) {
            console.error('Users fetch error:', err);
        }
    }
    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.classList.contains('delete-room')) {
            const id = target.dataset.id;
            if (confirm("Are you sure you want to delete this room?")) {
                try {
                    const res = await fetch(`https://localhost:7203/Room/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (res.ok) document.getElementById(`room-${id}`).remove();
                    else alert("Failed to delete room");
                } catch (err) {
                    console.error(err);
                    alert("Error deleting room");
                }
            }
        }

        if (target.classList.contains('delete-user')) {
            const id = target.dataset.id;
            if (confirm("Are you sure you want to delete this user?")) {
                try {
                    const res = await fetch(`https://localhost:7203/User/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (res.ok) document.getElementById(`user-${id}`).remove();
                    else alert("Failed to delete user");
                } catch (err) {
                    console.error(err);
                    alert("Error deleting user");
                }
            }
        }

        if (target.classList.contains('edit-room')) {
            const id = target.dataset.id;
            window.location.href = `editRoom.html?id=${id}`;
        }

        if (target.classList.contains('edit-user')) {
            const id = target.dataset.id;
            window.location.href = `editUser.html?id=${id}`;
        }
    });

    document.getElementById('create-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-user-name').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        const role = document.getElementById('new-user-role').value.trim();
        const password = document.getElementById('new-user-password').value;

        try {
            const res = await fetch(`https://localhost:7203/User`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, role, password })
            });
            if (res.ok) {
                alert("User created successfully!");
                e.target.reset();
                loadUsers();
            } else {
                const error = await res.json();
                alert("Error creating user: " + (error.message || res.statusText));
            }
        } catch (err) {
            console.error(err);
            alert("Error creating user");
        }
    });
    document.getElementById('create-room-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-room-name').value.trim();
        const capacity = parseInt(document.getElementById('new-room-capacity').value);
        const locationId = document.getElementById('new-room-location').value;

        if (!locationId) {
            alert("Please select a location");
            return;
        }

        try {
            const res = await fetch(`https://localhost:7203/Room`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, capacity, locationId })
            });

            if (res.ok) {
                alert("Room created successfully!");
                e.target.reset();
                loadRooms();
            } else {
                const error = await res.json();
                alert("Error creating room: " + (error.message || res.statusText));
            }
        } catch (err) {
            console.error(err);
            alert("Error creating room");
        }
    });

    loadLocations();
    loadRooms();
    loadUsers();
});
