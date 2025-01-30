document.addEventListener("DOMContentLoaded", () => {
  let sessions = window.electronAPI.getSessionDetails();

  const loggedDevices = document.getElementById("logged-devices");

  loggedDevices.innerHTML = "";

  sessions.forEach((item) => {
    let div = document.createElement("div");
    div.classList.add("device");
    div.innerHTML = `<div class="symbol">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
                d="M21 42C32.598 42 42 32.598 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 32.598 9.40202 42 21 42Z"
                fill="#20BE79" />
            <path d="M12.0923 21.2122L17.7573 27.0122L29.9666 14.5122" stroke="white"
                stroke-width="4" />
        </svg>
    </div>
    <div id="device-name">${item.host}</div>
    <div id="device-status">${item.status}</div>
    <div onclick="logOutDevice('${item.id}', '${item.userId}')" class="logout-button">
        Log Out
    </div>`;

    loggedDevices.appendChild(div);
  });

  setTimeout(() => {
    let Thisdiv = document.createElement("div");
    Thisdiv.classList.add("device");
    Thisdiv.innerHTML = `<div class="symbol">
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
        <path
            d="M21 42C32.598 42 42 32.598 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 32.598 9.40202 42 21 42Z"
            fill="white" />
        <path
            d="M21 0C25.1534 0 29.2135 1.23163 32.667 3.53914C36.1204 5.84665 38.812 9.1264 40.4015 12.9636C41.9909 16.8009 42.4068 21.0233 41.5965 25.0969C40.7862 29.1705 38.7861 32.9123 35.8492 35.8492C32.9123 38.7861 29.1705 40.7862 25.0969 41.5965C21.0233 42.4068 16.8009 41.9909 12.9636 40.4015C9.1264 38.812 5.84665 36.1204 3.53914 32.667C1.23163 29.2135 0 25.1534 0 21C0 15.4305 2.21249 10.089 6.15076 6.15076C10.089 2.21249 15.4305 0 21 0ZM21 27.155C20.5155 27.1553 20.051 27.3478 19.7084 27.6904C19.3658 28.033 19.1733 28.4975 19.173 28.982C19.1708 29.3465 19.2771 29.7033 19.4782 30.0073C19.6793 30.3112 19.9662 30.5485 20.3025 30.689C20.6388 30.8294 21.0093 30.8668 21.3669 30.7962C21.7244 30.7256 22.0529 30.5503 22.3106 30.2926C22.5683 30.0349 22.7436 29.7064 22.8142 29.3489C22.8848 28.9913 22.8474 28.6208 22.707 28.2845C22.5665 27.9482 22.3292 27.6613 22.0253 27.4602C21.7213 27.259 21.3645 27.1528 21 27.155ZM21 11.193C20.5113 11.1977 20.044 11.3939 19.6985 11.7395C19.3529 12.085 19.1567 12.5523 19.152 13.041V22.323C19.1632 22.8029 19.3617 23.2594 19.7051 23.5949C20.0485 23.9303 20.5095 24.1181 20.9895 24.1181C21.4695 24.1181 21.9305 23.9303 22.2739 23.5949C22.6173 23.2594 22.8158 22.8029 22.827 22.323V13.041C22.827 12.5545 22.6352 12.0876 22.2932 11.7416C21.9511 11.3957 21.4865 11.1985 21 11.193Z"
            fill="#696B78" />
    </svg>
  </div>
  <div id="device-name">This Device</div>
  <div id="device-status">InActive</div>`;

    loggedDevices.appendChild(Thisdiv);
  }, 300);
});

let currentUser;

const logOutDevice = async (sessionId, userId) => {
  const webUrl = window.electronAPI.getWebUrl();
  const updateSession = async () => {
    const url = `${webUrl}/api/users/sessions/${userId}`;

    const deviceName = window.electronAPI.getDeviceName();
    let ipAdd;

    try {
      await fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => (ipAdd = data.ip))
        .catch((error) => {
          window.electronAPI.logErrorsInFile(
            error,
            "getIp > line 66 > in session"
          );
        });
    } catch (error) {
      window.electronAPI.logErrorsInFile(error, "getIp > line 70 > in session");
    }

    let data = {
      sessionId: sessionId,
      userId: userId,
      deviceName: deviceName,
      ipAdd: ipAdd ? ipAdd : "N/A",
    };

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } catch (error) {
      return error;
    }
  };

  await updateSession()
    .then((data) => (currentUser = data))
    .catch((error) => {
      return console.log(error);
    });

  //Check if user has any package or isTrial
  if (currentUser && currentUser.plan === "Free") {
    window.electronAPI.setTrialMode(true);

    const curentDate = new Date();
    const trialEndDate = new Date(currentUser.trialEndDate);
    window.electronAPI.setTrialEndDate(trialEndDate);

    if (trialEndDate < curentDate) {
      const errorElement = document.getElementById("error-message");

      errorElement.innerText =
        "Your trial is expired, please purchase a license to start using.";
      window.location.href = "../entry/dashboard.html";
    } else {
      // Calculate the difference in milliseconds between the two dates
      const differenceMilliseconds = Math.abs(curentDate - trialEndDate);

      // Calculate the difference in days
      const differenceDays = Math.ceil(
        differenceMilliseconds / (1000 * 60 * 60 * 24)
      );
      console.log(`Trial is remaining for ${differenceDays} days`);

      window.electronAPI.authenticate(currentUser.token);
      window.electronAPI.updateUserDetails(currentUser);

      window.location.href = "../entry/dashboard.html"; // Redirect to the Dashborad
    }
  }

  if (currentUser && currentUser.plan === "Paid") {
    isTrial = false;
    window.electronAPI.setTrialMode(false);
    const trialEndDate = new Date("2123-01-01");
    window.electronAPI.setTrialEndDate(trialEndDate);

    window.electronAPI.authenticate(currentUser.token);
    window.electronAPI.updateUserDetails(currentUser);

    window.location.href = "../entry/dashboard.html"; // Redirect to the Dashborad
  }
};

document.addEventListener("keydown", (ev) => {
  if (ev.metaKey && ev.key === "r") {
    ev.preventDefault();
    console.log("prevented refersh");
  }
});

const closeApplication = () => {
  window.electronAPI.closeApplication();
};

const gotoMainPage = () => {
  window.location.href = "../entry/login.html";
};
