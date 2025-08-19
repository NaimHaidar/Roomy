document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    
    // Redirect if a token or user ID is missing
    if (!userId || !accessToken) {
        window.location.href = 'login.html';
        return;
    }
    
    fetch(`https://localhost:7203/User/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        // If the response is not ok, handle the error and exit the .then() block
        if (!response.ok) {
            console.log(localStorage.getItem("userId"));
            console.log(accessToken);
            console.error('Failed to fetch user data. Status:', response.status);
            //window.location.href = 'login.html';
            // Throw an error to stop the promise chain
            throw new Error('Response not OK');
        }
        return response.json();
    })
    .then(userData => {
        // Find the element and display the user's name
        const userNameDisplay = document.getElementById('name');
        if (userNameDisplay) {
            userNameDisplay.textContent = userData.name;
        }
    })
    .catch(error => {
        // This block will catch any errors from the fetch call or the .then() block
        console.error('An error occurred:', error);
    });
});