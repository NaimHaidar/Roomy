document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});
function logout() {
  localStorage.setItem("userId","");
  localStorage.setItem("accessToken","");
    localStorage.setItem("refreshToken","");
  window.location.replace("login.html");
}