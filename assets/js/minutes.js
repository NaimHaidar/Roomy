document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    const minutesForm = document.getElementById('minutesForm');
    const minuteIdInput = document.getElementById('minuteId');
    const typeInput = document.getElementById('type');
    const meetingSelect = document.getElementById('meetingSelect'); 
    const filterMeeting = document.getElementById('filterMeeting'); 
    const bodyInput = document.getElementById('body');
    const creationDateInput = document.getElementById('creationDate');
    const deadlineDateInput = document.getElementById('deadlineDate');
    const minutesTableBody = document.getElementById('minutesTableBody');

    let allMeetings = [];
    let allMinutes = [];

    creationDateInput.value = new Date().toISOString().split('T')[0];

    const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

    const resetForm = () => {
        minutesForm.reset();
        minuteIdInput.value = '';
        creationDateInput.value = new Date().toISOString().split('T')[0];
    };

    const loadMeetings = async () => {
        try {
            const res = await fetch('https://localhost:7203/Meeting', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch meetings');
            allMeetings = await res.json();

            meetingSelect.innerHTML = '<option value="">Select Meeting</option>';
            allMeetings.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = `${m.title} (${new Date(m.startDate).toLocaleDateString()})`;
                meetingSelect.appendChild(option);
            });

            filterMeeting.innerHTML = '<option value="">All Meetings</option>';
            allMeetings.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = `${m.title} (${new Date(m.startDate).toLocaleDateString()})`;
                filterMeeting.appendChild(option);
            });

        } catch (err) {
            console.error(err);
        }
    };

    const renderMinutes = (minutes) => {
        minutesTableBody.innerHTML = '';
        if (minutes.length === 0) {
            minutesTableBody.innerHTML = '<tr><td colspan="6">No minutes found</td></tr>';
            return;
        }

        minutes.forEach(m => {
            const meeting = allMeetings.find(mt => mt.id === m.meetingId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.id}</td>
                <td>${m.type}</td>
                <td>${meeting ? meeting.title : m.meetingId}</td>
                <td>${formatDate(m.creationDate)}</td>
                <td>${formatDate(m.deadlineDate)}</td>
                <td>
                    <button class="btn btn-sm btn-primary editBtn" data-id="${m.id}">Edit</button>
                    <button class="btn btn-sm btn-danger deleteBtn" data-id="${m.id}">Delete</button>
                </td>
            `;
            minutesTableBody.appendChild(tr);
        });
    };

    const loadMinutes = async (meetingId = '') => {
        try {
            let url = 'https://localhost:7203/MinutesOfMeeting';
            if (meetingId) url += `/by-meeting/${meetingId}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!res.ok) throw new Error('Failed to fetch minutes');
            allMinutes = await res.json();
            renderMinutes(allMinutes);
        } catch (err) {
            console.error(err);
        }
    };

    const saveMinute = async (data, id = '') => {
        try {
            const url = id ? `https://localhost:7203/MinutesOfMeeting/${id}` : 'https://localhost:7203/MinutesOfMeeting';
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to save minute');
            resetForm();
            loadMinutes(filterMeeting.value);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteMinute = async (id) => {
        if (!confirm('Are you sure you want to delete this minute?')) return;
        try {
            const res = await fetch(`https://localhost:7203/MinutesOfMeeting/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            loadMinutes(filterMeeting.value);
        } catch (err) {
            console.error(err);
        }
    };

    minutesForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!meetingSelect.value) return alert('Please select a meeting.');

        const id = minuteIdInput.value;
        const data = {
            type: typeInput.value,
            body: bodyInput.value,
            creationDate: id ? creationDateInput.value : new Date().toISOString().split('T')[0],
            deadlineDate: deadlineDateInput.value || null,
            userId,
            meetingId: meetingSelect.value
        };
        saveMinute(data, id);
    });

    document.getElementById('resetForm').addEventListener('click', resetForm);

    minutesTableBody.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('editBtn')) {
            const minute = allMinutes.find(m => m.id == id);
            if (!minute) return;
            minuteIdInput.value = minute.id;
            typeInput.value = minute.type;
            bodyInput.value = minute.body;
            creationDateInput.value = formatDate(minute.creationDate);
            deadlineDateInput.value = formatDate(minute.deadlineDate);
            meetingSelect.value = minute.meetingId;
        } else if (e.target.classList.contains('deleteBtn')) {
            deleteMinute(id);
        }
    });

    filterMeeting.addEventListener('change', () => loadMinutes(filterMeeting.value));

    loadMeetings().then(() => loadMinutes());
});
