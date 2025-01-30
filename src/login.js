document.addEventListener("DOMContentLoaded", async () => {
  const webUrl = window.electronAPI.getWebUrl();

  const data = {
    name: "screen1",
  };

  try {
    const getLoginScreen = async () => {
      const url = `${webUrl}/api/loginscreen`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(data),
        });

        return response.json();
      } catch (error) {
        window.electronAPI.logErrorsInFile(
          error,
          "getLoginScreen > line 26 > in login.js"
        );
        return error;
      }
    };

    let loginScreen;

    await getLoginScreen()
      .then((data) => (loginScreen = data))
      .catch((error) => console.log(error));

    if (loginScreen.image) {
      const loginImageSection = document.getElementById("login-image-section");

      loginImageSection.innerHTML = `
      <img src="data:image/png;base64,${loginScreen.image}" alt="front image" fill>
            <div onclick="openLink('${loginScreen.pageUrl}')" class="visit-button">
                ${loginScreen.buttonText}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <g clip-path="url(#clip0_2_206)">
                        <path
                            d="M10.866 3.08966e-06C10.8477 -0.00101828 10.8293 -0.00101828 10.811 3.08966e-06H7.911C7.84606 3.08774e-06 7.78176 0.0127937 7.72176 0.0376446C7.66177 0.0624956 7.60725 0.0989202 7.56134 0.144839C7.51542 0.190757 7.47899 0.245271 7.45414 0.305266C7.42929 0.365262 7.4165 0.429564 7.4165 0.494503C7.4165 0.559442 7.42929 0.623745 7.45414 0.68374C7.47899 0.743736 7.51542 0.798249 7.56134 0.844167C7.60725 0.890086 7.66177 0.92651 7.72176 0.951361C7.78176 0.976212 7.84606 0.989003 7.911 0.989003H9.684L4.594 6.082C4.54804 6.12797 4.51158 6.18253 4.4867 6.24258C4.46183 6.30264 4.44903 6.367 4.44903 6.432C4.44903 6.497 4.46183 6.56137 4.4867 6.62142C4.51158 6.68147 4.54804 6.73604 4.594 6.782C4.63996 6.82797 4.69453 6.86443 4.75458 6.8893C4.81463 6.91418 4.879 6.92698 4.944 6.92698C5.009 6.92698 5.07337 6.91418 5.13342 6.8893C5.19347 6.86443 5.24804 6.82797 5.294 6.782L10.382 1.694V3.465C10.382 3.59615 10.4341 3.72193 10.5268 3.81467C10.6196 3.9074 10.7454 3.9595 10.8765 3.9595C11.0076 3.9595 11.1334 3.9074 11.2262 3.81467C11.3189 3.72193 11.371 3.59615 11.371 3.465V0.565003C11.3809 0.494155 11.3752 0.42201 11.3545 0.353555C11.3337 0.285101 11.2983 0.22197 11.2508 0.168528C11.2032 0.115086 11.1447 0.0726067 11.0791 0.0440276C11.0135 0.0154484 10.9425 0.00145103 10.871 0.00300311L10.866 3.08966e-06ZM0.989 1.982C0.727588 1.98486 0.47769 2.08998 0.292833 2.27484C0.107976 2.45969 0.00286006 2.70959 0 2.971V10.386C0.00286006 10.6474 0.107976 10.8973 0.292833 11.0822C0.47769 11.267 0.727588 11.3721 0.989 11.375H8.4C8.66141 11.3721 8.91131 11.267 9.09617 11.0822C9.28102 10.8973 9.38614 10.6474 9.389 10.386V4.168L8.4 5.157V10.386H0.989V2.971H6.218L7.207 1.982H0.989Z"
                            fill="#131523" />
                    </g>
                    <defs>
                        <clipPath id="clip0_2_206">
                            <rect width="11.374" height="11.375" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
      `;
    }
  } catch (error) {
    console.log(error);
  }
});

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    username.addEventListener("focus", () => {
      const errorElement = document.getElementById("error-message");
      errorElement.innerText = "";
    });

    password.addEventListener("focus", () => {
      const errorElement = document.getElementById("error-message");
      errorElement.innerText = "";
    });

    let currentUser;
    let errorMessage;

    function isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailRegex.test(email);
    }

    if (!isValidEmail(username.value)) {
      event.preventDefault(); // Prevent form submission if email is invalid
      // return alert("Please enter a valid email address.");
      username.focus();
      return;
    }

    if (!password.value) {
      event.preventDefault(); // Prevent form submission if password is empty
      // return alert("Please enter a valid password.");
      password.focus();
      return;
    }

    await authenticateUser(username.value.toLowerCase(), password.value)
      .then((data) => {
        currentUser = data;
      })
      .catch((error) => {
        const strError = error.toString();
        if (strError.includes("Error: Max")) {
          errorMessage =
            "Maximum sessions exeeded, logout from other devices to use here.";
        }
        if (strError.includes("Error: Inv")) {
          errorMessage =
            "Invalid credentials, please check username and password";
        }
        if (strError.includes("Error: Una")) {
          errorMessage =
            "This account is currently disabled. Please contact the administrator.";
        }
        console.log(error);
        window.electronAPI.logErrorsInFile(
          error,
          "authenticateUser() > line 126 > in login.js"
        );
      });

    if (errorMessage) {
      // Show an error message or handle failed authentication
      const errorElement = document.getElementById("error-message");
      errorElement.innerText = errorMessage;
    }

    // If user has 1 waiting to logout
    if (currentUser && currentUser.sessionMsg) {
      const errorElement = document.getElementById("error-message");
      errorElement.innerText = currentUser.sessionMsg;
    }

    // Check if user has reached session limit of userDevice limit, if yes, redirect to sessions window
    if (currentUser && currentUser.msg) {
      let sessions;
      await getUserSessions(currentUser.userId)
        .then((data) => (sessions = data))
        .catch((error) => {
          window.electronAPI.logErrorsInFile(
            error,
            "getSession > line 150 > in login.js"
          );
          console.log(error);
        });

      window.electronAPI.setSessionDetails(sessions);

      window.location.href = "../entry/sessionlimit.html"; // Redirect to the Sessions page
    }

    //Check if user has any package or isTrial

    if (currentUser && currentUser.plan === "Free") {
      window.electronAPI.setTrialMode(true);

      const curentDate = new Date();
      const trialEndDate = new Date(currentUser.trialEndDate);
      window.electronAPI.setTrialEndDate(trialEndDate);

      if (trialEndDate < curentDate) {
        const errorElement = document.getElementById("error-message");
        window.electronAPI.updateUserDetails(currentUser);

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
      const subEndDate = new Date(currentUser.subscriptionEnd);
      window.electronAPI.setSubEndDate(subEndDate);

      window.electronAPI.authenticate(currentUser.token);
      window.electronAPI.updateUserDetails(currentUser);

      window.location.href = "../entry/dashboard.html"; // Redirect to the Dashborad
    }
  });

async function authenticateUser(username, password) {
  const webUrl = window.electronAPI.getWebUrl();
  const url = `${webUrl}/api/login`;

  const spinLoader = document.getElementById("loader-container");
  const loginButton = document.getElementById("login-submit");

  try {
    //Start loader
    spinLoader.style.display = "flex";
    loginButton.disabled = true;
    loginButton.style.pointerEvents = "none";
    loginButton.style.cursor = "not-allowed";

    // Check if the system is connected to the internet
    let isOnline = await window.electronAPI.checkInternetConnectivity();

    if (isOnline) {
      const deviceName = window.electronAPI.getDeviceName();
      let ipAdd;

      try {
        await fetch("https://api.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => (ipAdd = data.ip))
          .catch((error) => {
            window.electronAPI.logErrorsInFile(
              error,
              "getIp > line 233 > in login.js"
            );
          });
      } catch (error) {
        window.electronAPI.logErrorsInFile(
          error,
          "getIp > line 240 > in login.js"
        );
      }

      let data = {
        email: username,
        password: password,
        deviceName: deviceName,
        ipAdd: ipAdd ? ipAdd : "N/A",
      };

      // API call for authentication
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } else {
      const errorElement = document.getElementById("error-message");
      errorElement.innerText =
        "Not connected to the Internet, Please connect to Internet.";
    }
  } catch (error) {
    console.log(error);
    window.electronAPI.logErrorsInFile(
      error,
      "fetchUser > line 271 > in login.js"
    );
    return error;
  } finally {
    // Stop loader
    spinLoader.style.display = "none";
    loginButton.disabled = false;
    loginButton.style.pointerEvents = "auto";
    loginButton.style.cursor = "pointer";
  }
}

const getUserSessions = async (userId) => {
  const webUrl = window.electronAPI.getWebUrl();
  const url = `${webUrl}/api/users/sessions/${userId}`;

  try {
    // API call for getting active sessions
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.json();
  } catch (error) {
    console.log(error);
    window.electronAPI.logErrorsInFile(
      error,
      "getUserSession > line 302 > in login.js"
    );
    return error;
  }
};

const passwordRecovery = () => {
  const step1 = document.getElementById("login-form-step1");
  const step2 = document.getElementById("password-recovery-form");

  step1.style.display = "none";
  step2.style.display = "flex";
};

const passwordRecoveryBack = () => {
  const step1 = document.getElementById("login-form-step1");
  const step2 = document.getElementById("password-recovery-form");

  step1.style.display = "flex";
  step2.style.display = "none";
};

const submitForEmailVerification = () => {
  const step1 = document.getElementById("email-step");
  const step2 = document.getElementById("otp-step");

  step1.style.display = "none";
  step2.style.display = "flex";
};

const backToLogin = () => {
  const step1 = document.getElementById("login-form-step1");
  const step2 = document.getElementById("login-form-step2");

  step1.style.display = "flex";
  step2.style.display = "none";
};

const forgotPassword = () => {};

document.addEventListener("keydown", (ev) => {
  if (ev.metaKey && ev.key === "r") {
    ev.preventDefault();
    console.log("prevented refersh");
  }
});

const openLink = (url) => {
  window.electronAPI.openExternalLink(`${url}?ref=v4-app`);
};

const closeApplication = () => {
  window.electronAPI.closeApplication();
};
