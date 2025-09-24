document.addEventListener("DOMContentLoaded", async () => {
  const attendeesSelect = document.getElementById("attendeesSelect");
  const roomSelect = document.getElementById("roomSelect");
  const meetingForm = document.getElementById("meetingForm");
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  if (!accessToken) {
    window.location.href = "login.html";
    return;
  }

  async function fetchUsers() {
    try {
      const res = await fetch("https://localhost:7203/User", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const users = await res.json();
      users.forEach(u => {
        const option = document.createElement("option");
        option.value = u.id;
        option.textContent = u.name;
        attendeesSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  async function fetchRooms() {
    try {
      const res = await fetch("https://localhost:7203/Room", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const rooms = await res.json();
       const defaultOption = document.createElement('option');
              defaultOption.value = "";
              defaultOption.textContent = "Select Room";
              roomSelect.appendChild(defaultOption);
      rooms.forEach(r => {
        const option = document.createElement("option");
        option.value = r.id;
        option.textContent = r.name;
        roomSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  }

  await fetchUsers();
  await fetchRooms();

  meetingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedAttendees = Array.from(attendeesSelect.selectedOptions).map(
      o => ({ userId: o.value })
    );

    const payload = {
      title: document.getElementById("meetingTitle").value,
      startDate: new Date(
        document.getElementById("meetingDate").value +
        "T" +
        document.getElementById("startTime").value
      ).toISOString(),
      endDate: new Date(
        document.getElementById("meetingDate").value +
        "T" +
        document.getElementById("endTime").value
      ).toISOString(),
      userId: userId,
      roomId: parseInt(roomSelect.value),
      attendees: selectedAttendees
    };

    try {
      const res = await fetch("https://localhost:7203/Meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text(); 

      if (!res.ok) {
        let errorMessage;
        try {
          const data = JSON.parse(text);
          errorMessage = data.message ;
        } catch {
          errorMessage = text ;
        }
        alert(errorMessage);
        return;
      }

      alert("Meeting created successfully!");
      meetingForm.reset();
    } catch (err) {
      console.error(err);
      alert(err.message)
      ;
    }
  });
});
