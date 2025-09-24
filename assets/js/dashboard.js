
document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

   

    
    let allMeetings = [];
    let calendar;
    let roomMap = {}; 
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek', 
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            slotMinTime: "07:00:00", 
            slotMaxTime: "24:00:00", 
            allDaySlot: false, 
            height: "auto", 
            events: []
        });
        calendar.render();
    }

    fetch(`https://localhost:7203/User/count`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(r => {
        if (!r.ok) { refresh(); throw new Error('Response not OK (Users)'); }
        return r.json();
    })
    .then(count => {
        const userCountDisplay = document.getElementById('userCount');
        if (userCountDisplay) userCountDisplay.textContent = count;
    })
    .catch(err => console.error('User count error:', err));

    fetch(`https://localhost:7203/Room/count`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(r => {
        if (!r.ok) { refresh(); throw new Error('Response not OK (Rooms)'); }
        return r.json();
    })
    .then(count => {
        const roomCountDisplay = document.getElementById('roomCount');
        if (roomCountDisplay) roomCountDisplay.textContent = count;
    })
    .catch(err => console.error('Room count error:', err));

    fetch(`https://localhost:7203/Meeting`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(r => {
        if (!r.ok) { refresh(); throw new Error('Response not OK (Meetings)'); }
        return r.json();
    })
    .then(meetings => {
        const now = new Date();

        allMeetings = meetings.map(m => ({
            ...m,
            startDate: new Date(m.startDate),
            endDate: new Date(m.endDate)
        }));

        const today = now.toDateString();
        const todayMeetings = allMeetings.filter(m => m.startDate.toDateString() === today);
        const meetingsTodayDisplay = document.getElementById('meetingsToday');
        if (meetingsTodayDisplay) meetingsTodayDisplay.textContent = todayMeetings.length;

        const activeMeetings = allMeetings.filter(m => m.startDate <= now && now <= m.endDate);
        const activeMeetingsDisplay = document.getElementById('activeMeetings');
        if (activeMeetingsDisplay) activeMeetingsDisplay.textContent = activeMeetings.length;

        const upcomingMeetings = allMeetings
            .filter(m => m.startDate > now)
            .sort((a, b) => a.startDate - b.startDate);

        const upcomingContainer = document.getElementById('upcomingMeetingsList');
        if (upcomingContainer) {
            upcomingContainer.innerHTML = "";
            if (upcomingMeetings.length === 0) {
                upcomingContainer.innerHTML = "<p>No upcoming meetings</p>";
            } else {
                let html = '';
                upcomingMeetings.forEach((meeting, index) => {
                    const time = meeting.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const date = meeting.startDate.toLocaleDateString();
                    const roomName = roomMap[meeting.roomId] || meeting.roomId; 
                    html += `
                      <div class="upcoming-meeting-item">
                        <input type="radio" name="upcoming-meeting" id="meeting-${meeting.id}" ${index === 0 ? "checked" : ""}>
                        <label class="upcoming-meeting-label" for="meeting-${meeting.id}">
                          ${meeting.title} - Room ${roomName}
                          <span class="badge badge-primary badge-pill">${date}-${time}</span>
                        </label>
                      </div>
                    `;
                });
                upcomingContainer.innerHTML = html;
            }
        }

        const roomSelect = document.getElementById('roomSelect');
        if (roomSelect) {
            roomSelect.addEventListener('change', () => {
                const selectedRoomId = parseInt(roomSelect.value, 10);
                const roomMeetings = allMeetings.filter(m => m.roomId === selectedRoomId);

                if (calendar) {
                    calendar.removeAllEvents();
                    calendar.addEventSource(roomMeetings.map(m => ({
                        id: m.id,
                        title: `${m.title} - ${roomMap[m.roomId] || m.roomId}`,
                        start: m.startDate,
                        end: m.endDate
                    })));
                }
            });
        }
    })
    .catch(err => console.error('Meetings error:', err));

    fetch(`https://localhost:7203/Room`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(r => {
        if (!r.ok) { refresh(); throw new Error('Response not OK (Rooms Select)'); }
        return r.json();
    })
    .then(rooms => {
        const roomSelect = document.getElementById('roomSelect');
        if (roomSelect) {
            roomSelect.innerHTML = "";
              const defaultOption = document.createElement('option');
              defaultOption.value = "";
              defaultOption.textContent = "Select Room";
              roomSelect.appendChild(defaultOption);
            rooms.forEach(room => {
                roomMap[room.id] = room.name; 
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                roomSelect.appendChild(option);
            });

           
        }
    })
    .catch(err => console.error('Rooms select error:', err));
});
