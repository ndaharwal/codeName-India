document.addEventListener("DOMContentLoaded", async () => {

    let userDetails = window.electronAPI.getUserDetails();

    const username = document.getElementById('splash-username')

    username.innerHTML = userDetails.name
})