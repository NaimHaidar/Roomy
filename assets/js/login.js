
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const userId= localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    if (userId && accessToken) {
        window.location.href = 'dashboard.html';
    }
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('https://localhost:7203/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful!', data);
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userId', data.use);
                console.log('User ID:', data.use);
                console.log('Access Token:', data.accessToken);
                console.log('Refresh Token:', data.refreshToken);
                window.location.href = 'dashboard.html';

            } else {
                const errorData = await response.json();
                alert('Login failed: ' + errorData.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});