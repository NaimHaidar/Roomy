
const userId = localStorage.getItem("userId");
const accessToken = localStorage.getItem("accessToken");
if (!userId || !accessToken) {
  window.location.href = "login.html";
}
fetch(`https://localhost:7203/User/${userId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})
  .then((response) => {
    if (!response.ok) {
      refresh();
    }
    return response.json();
  })
  .then((userData) => {
    const userNameDisplay = document.getElementById("name");
    if (userNameDisplay) {
      userNameDisplay.textContent = userData.name;
    }
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
function refresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    logout();
  }
  fetch("https://localhost:7203/Auth/refresh", {
    method: "POST",
    headers: { contentType: "application/json" },
    body: JSON.stringify({ token: accessToken, refreshToken: refreshToken }),
  }).then((response) => {
    if (!response.ok) {
      logout();
    }
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    window.location.reload();
  });
}
