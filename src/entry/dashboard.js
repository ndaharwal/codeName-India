document.addEventListener("DOMContentLoaded", async () => {
  // Check if the system is connected to the internet
  let isOnline = await window.electronAPI.checkInternetConnectivity();

  const loadingElement = document.getElementById("loader");
  // Display loading GIF immediately
  loadingElement.style.display = "none";

  let userDetails = window.electronAPI.getUserDetails();
  const previewName = document.getElementById("dashboard-user-name");
  previewName.innerHTML = userDetails.name;

  const dashTrialExpiry = document.getElementById("dashboard-trial-exipry");
  if (userDetails.plan === "Free") {
    const trialEndDate = new Date(userDetails.trialEndDate);
    dashTrialExpiry.style.display = "flex";
    dashTrialExpiry.innerHTML = `Trial Expires : ${trialEndDate.toDateString()}`;

    const curentDate = new Date();
    const storedTrialEndDate = window.electronAPI.getTrialEndDate();

    if (trialEndDate < curentDate) {
      const launchButton = document.getElementById("launch-button");
      const trialMessage = document.getElementById("trial-message");
      launchButton.style.display = "none";
      trialMessage.style.display = "flex";
    }
  }

  const dashPremiumMem = document.getElementById("dashboard-user-type");

  if (userDetails.plan === "Paid") {
    //Check Subscription Expiry and show message.
    const curentDate = new Date();
    const storedSubEndDate = window.electronAPI.getSubEndDate();
    const subEndDate = new Date(storedSubEndDate);

    dashPremiumMem.style.display = "flex";

    if (subEndDate < curentDate) {
      const launchButton = document.getElementById("launch-button");
      const trialMessage = document.getElementById("trial-message");
      const redownloadFontsBtn = document.getElementById("redownload-fonts");
      trialMessage.innerHTML =
        "Your Subscription is expired please renew to continue using IndiaFont.";
      launchButton.style.display = "none";
      trialMessage.style.display = "flex";

      redownloadFontsBtn.style.display = "none";

      dashPremiumMem.style.display = "none";
    }

    //Downloading fonts....
    //check if LocalStore has fonts
    let fontObjects = window.electronAPI.getStoredFonts();

    if (!fontObjects) {
      // goto settigs page
      const settingsButton = document.getElementById("settings-button");
      settingsButton.click();

      const launchButton = document.getElementById("launch-button");

      let fontData;
      const mainProgressBar = document.getElementById("progress-bar-main");

      const settingsDownloadLib = document.getElementById(
        "settings-download-lib"
      );

      const computedStyleDwnBtn = getComputedStyle(settingsDownloadLib);
      const isDisplay = computedStyleDwnBtn.getPropertyValue("display");

      if (isDisplay !== "none") {
        settingsDownloadLib.style.display = "none";
      }

      try {
        mainProgressBar.style.display = "flex";
        launchButton.style.display = "none";

        const progressBar = document.getElementsByClassName("progress-bar")[0];
        setInterval(() => {
          const computedStyle = getComputedStyle(progressBar);
          const width =
            parseFloat(computedStyle.getPropertyValue("--width")) || 0;
          progressBar.style.setProperty("--width", width + 0.1);
        }, 10);
        // Get Fonts from web via API
        await getFonts(userDetails.id)
          .then((data) => (fontData = data))
          .catch((error) => {
            console.log(error);
            window.electronAPI.logErrorsInFile(
              error,
              "getFData > line 97 > in dashboard.js"
            );
          });

        // Format font data for required functions
        const processItems = async (arrayOfItems) => {
          const asyncResults = [];

          for (const item of arrayOfItems) {
            try {
              let fData = await window.electronAPI.runCipherData(
                item.fontObject,
                "deDee34Oemae124maEku@$#keCeCunauTaUhuhere"
              );

              let fItem = {
                FontName: item.name,
                fData: fData,
                weight: item.weight,
                language: item.language.name,
                category: item.category.name,
                isFeatured: item.isFeatured,
                isFavourite: false,
              };

              asyncResults.push(fItem);
            } catch (error) {
              console.error("An error occurred:", error);
              window.electronAPI.logErrorsInFile(
                error,
                "readFData > line 127 > in dashboard.js"
              );
            }
          }

          return asyncResults;
        };

        let formattedData = await processItems(fontData);

        // Store fonts in Local Store
        window.electronAPI.setStoreFonts(formattedData);

        const settingsDownloadMsg = document.getElementById(
          "settings-download-successMsg"
        );

        settingsDownloadMsg.style.display = "block";

        settingsDownloadMsg.innerHTML =
          "Fonts downloaded successfully... You can start using IndiaFont V4.";
      } catch (error) {
        console.log(error);
        window.electronAPI.logErrorsInFile(
          error,
          "Loader > line 152 > in dashboard.js"
        );
      } finally {
        mainProgressBar.style.display = "none";
        launchButton.style.display = "flex";

        if (isDisplay !== "none") {
          settingsDownloadLib.style.display = "none";
        }
      }
    }
  }

  if (isOnline) {
    //Dash Video Related
    const webUrl = window.electronAPI.getWebUrl();

    try {
      const getDashVideo = async () => {
        const url = `${webUrl}/api/dash-video`;

        const data = {
          userType:
            userDetails.plan === "Free" && userDetails.userType === "Pre V4"
              ? "Upsales Users"
              : "All Users",
        };

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
            "getDashVideo > line 194 > in dashboard.js"
          );
          return error;
        }
      };

      const dashVideo = document.getElementById("dash-video");

      let videoUrl;

      await getDashVideo()
        .then((data) => (videoUrl = data))
        .catch((error) => {
          console.log(error);
          window.electronAPI.logErrorsInFile(
            error,
            "getDashVideo > line 210 > in dashboard.js"
          );
        });

      if (videoUrl) {
        dashVideo.innerHTML = `
              <iframe width="100%" height="100%" src="${videoUrl.url}?rel=0&fs=0" title="YouTube video player" frameborder="0"></iframe>`;
      }

      //Offers related
      const getOfferDetail = async () => {
        const url = `${webUrl}/api/offers/${userDetails.id}`;

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          return response.json();
        } catch (error) {
          window.electronAPI.logErrorsInFile(
            error,
            "getOffer > line 236 > in dashboard.js"
          );
          return error;
        }
      };

      let offerDetails;

      await getOfferDetail()
        .then((data) => (offerDetails = data))
        .catch((error) => {
          console.log(error);
          window.electronAPI.logErrorsInFile(
            error,
            "getOffer > line 250 > in dashboard.js"
          );
        });

      let targetDate = new Date().getTime();

      if (offerDetails && offerDetails.status === "Active") {
        targetDate = new Date(offerDetails.offerEndDate).getTime();

        const offerAd = document.getElementById("offer-ad");
        const featchedOffer = document.getElementById("featched-offer");
        const offerBackImg = document.getElementById("offer-backImg");
        const fetchedOfferBackImg = document.getElementById("offer-back-image");
        const offerPurchaseButton = document.getElementById(
          "offer-purchase-button"
        );

        offerBackImg.style.display = "none";
        offerAd.style.background = offerDetails.backgroundColor;
        featchedOffer.style.display = "flex";
        offerPurchaseButton.style.display = "flex";

        fetchedOfferBackImg.src = `data:image/png;base64,${offerDetails.backImage}`
        fetchedOfferBackImg.alt = `offerBackkk`

        offerPurchaseButton.innerHTML = `<div onclick="openPurchaseLink('${offerDetails.pageUrl}')" class="buy-now-button">${offerDetails.buttonText}</div>`;
      } else {
        const featchedOffer = document.getElementById("featched-offer");
        const offerTopImg = document.getElementById("offer-top-image");
        const offerBackImg = document.getElementById("offer-backImg");
        const offerTitle = document.getElementById("offer-Title");
        const offerSubTitle = document.getElementById("offer-Sub-Title");
        const offerMainPrice = document.getElementById("offer-main-price");
        const offerDiscPrice = document.getElementById("offer-discount-price");
        const offerTimer = document.getElementById("offer-timer");
        const offerPurchaseButton = document.getElementById(
          "offer-purchase-button"
        );

        featchedOffer.style.display = "none";
        offerTopImg.style.display = "none";
        offerTitle.style.display = "none";
        offerSubTitle.style.display = "none";
        offerMainPrice.style.display = "none";
        offerDiscPrice.style.display = "none";
        offerPurchaseButton.style.display = "none";
        offerTimer.style.display = "none";

        offerBackImg.style.display = "flex";
        offerBackImg.innerHTML = `<img src="../images/Offer_Fallback.jpeg" alt="back-img"/>`;
      }

      // Update the countdown every second
      const countdownInterval = setInterval(function () {
        const currentDate = new Date().getTime();
        const timeRemaining = targetDate - currentDate;

        if (timeRemaining <= 0) {
          // If the target date has passed, clear the interval and display a message
          clearInterval(countdownInterval);
          document.getElementById("offer-timer-days").innerHTML = "00";
          document.getElementById("offer-timer-hours").innerHTML = "00";
          document.getElementById("offer-timer-minutes").innerHTML = "00";
          document.getElementById("offer-timer-seconds").innerHTML = "00";
        } else {
          // Calculate days, hours, minutes, and seconds
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

          // Update the HTML elements with the calculated values
          document.getElementById("offer-timer-days").innerHTML = days;
          document.getElementById("offer-timer-hours").innerHTML = hours;
          document.getElementById("offer-timer-minutes").innerHTML = minutes;
          document.getElementById("offer-timer-seconds").innerHTML = seconds;
        }
      }, 1000); // Update every 1 second
    } catch (error) {
      console.log(error);
      window.electronAPI.logErrorsInFile(
        error,
        "setting DashBoard > line 352 > in dashboard.js"
      );
    } finally {
      loadingElement.style.display = "none";
    }
  } else {
    const gettingStartedScreen = document.getElementById("getting-started");
    gettingStartedScreen.innerHTML = `<img src="../images/connection1.gif" alt="connectionimg" draggable="false">`;

    const allFontsScreen = document.getElementById("all-fonts");
    allFontsScreen.innerHTML = `<img src="../images/connection1.gif" alt="connectionimg" draggable="false">`;

    const artLibraryScreen = document.getElementById("art-library");
    artLibraryScreen.innerHTML = `<img src="../images/connection1.gif" alt="connectionimg" draggable="false">`;

    const notificationsScreen = document.getElementById("notifications");
    notificationsScreen.innerHTML = `<img src="../images/connection1.gif" alt="connectionimg" draggable="false">`;

    const offerAd = document.getElementById("offer-ad");
    const offerTopImg = document.getElementById("offer-top-image");
    const offerBackImg = document.getElementById("offer-backImg");
    const offerTitle = document.getElementById("offer-Title");
    const offerSubTitle = document.getElementById("offer-Sub-Title");
    const offerMainPrice = document.getElementById("offer-main-price");
    const offerDiscPrice = document.getElementById("offer-discount-price");
    const offerTimer = document.getElementById("offer-timer");
    const offerPurchaseButton = document.getElementById(
      "offer-purchase-button"
    );

    offerTopImg.style.display = "none";
    offerTitle.style.display = "none";
    offerSubTitle.style.display = "none";
    offerMainPrice.style.display = "none";
    offerDiscPrice.style.display = "none";
    offerPurchaseButton.style.display = "none";
    offerTimer.style.display = "none";

    offerBackImg.style.display = "flex";
    offerBackImg.innerHTML = `<img src="../images/Offer_Fallback.jpeg" alt="back-img"/>`;
  }
});

window.addEventListener("keydown", (ev) => {
  if (ev.metaKey && ev.key === "r") {
    ev.preventDefault();
    console.log("prevented refersh");
  }

  if (ev.ctrlKey && ev.key === "r") {
    ev.preventDefault();
    console.log("prevented refersh");
  }

  if (ev.ctrlKey && ev.key === "w") {
    ev.preventDefault();
    console.log("close prevented");
  }

  if (ev.metaKey && ev.key === "w") {
    ev.preventDefault();
    console.log("close prevented");
  }
});

const launchApp = () => {
  // window.location.href = "../index.html";

  window.electronAPI.openMainApp();
};

const navigateMenu = (elm, menu) => {
  const tabs = document.querySelectorAll(".tabs button");

  tabs.forEach((tab) => {
    if (tab.classList.contains("active")) {
      tab.classList.remove("active");
    }
  });

  if (elm) {
    elm.classList.add("active");
  }

  const content = document.querySelectorAll(".content section");

  content.forEach((tab) => {
    if (tab.classList.contains("active")) {
      tab.classList.remove("active");
    }
  });

  if (menu === "dashboard") {
    content[0].classList.add("active");
  }

  if (menu === "backgrounds") {
    content[1].classList.add("active");
  }

  if (menu === "fonts") {
    content[2].classList.add("active");
  }

  if (menu === "cliparts") {
    content[3].classList.add("active");
  }

  if (menu === "notification") {
    content[4].classList.add("active");
  }

  if (menu === "settings") {
    content[5].classList.add("active");

    let userDetails = window.electronAPI.getUserDetails();

    const previewName = document.getElementById("settings-user-name");
    const memberSince = document.getElementById("settings-subscribed-on");
    const email = document.getElementById("settings-user-email");
    const contact = document.getElementById("settings-user-contact");

    previewName.innerHTML = userDetails.name;
    email.innerHTML = userDetails.email;
    contact.innerHTML = userDetails.contact || "";
    memberSince.innerHTML = `Member Since: ${userDetails.createdAt}`;

    const settingsTrialExpiry = document.getElementById(
      "settings-trial-expiry"
    );

    const settingsSubExpiry = document.getElementById("settings-sub-expiry");

    if (userDetails.plan === "Free") {
      const trialEndDate = new Date(userDetails.trialEndDate);
      settingsTrialExpiry.style.display = "flex";
      settingsTrialExpiry.innerHTML = `Trial Expires : ${trialEndDate.toDateString()}`;
    }

    if (userDetails.isPro) {
      const setUserType = document.getElementById("settings-user-type");
      setUserType.style.display = "flex";

      const redownloadFontsBtn = document.getElementById("redownload-fonts");
      redownloadFontsBtn.style.display = "block";

      const curentDate = new Date();
      const storedSubEndDate = window.electronAPI.getSubEndDate();
      const subEndDate = new Date(storedSubEndDate);

      if (subEndDate < curentDate) {
        redownloadFontsBtn.style.display = "none";
        setUserType.style.display = "none";
      }

      if (userDetails.isLifetimeUser !== true) {
        const subEndDate = new Date(userDetails.subscriptionEnd);
        settingsSubExpiry.style.display = "flex";
        settingsSubExpiry.innerHTML = `Sub. End on: ${subEndDate.toDateString()}`;
      }

      const isLibInstalled = window.electronAPI.checkLibInstall();

      if (!isLibInstalled) {
        const settingsDownloadLib = document.getElementById(
          "settings-download-lib"
        );
        settingsDownloadLib.style.display = "flex";
      }

      const setPackageName = document.getElementById("settings-package-name");
      setPackageName.innerHTML = `Package : ${userDetails.package}`;
    }
  }

  if (menu === "buy-now") {
    content[6].classList.add("active");
  }
};

let downloadInProgress = false;

const logOut = async () => {
  if (downloadInProgress) {
    return alert("Download is in process, please wait it to be finished.");
  }

  window.electronAPI.signOutUser();
  let userDetails = window.electronAPI.getUserDetails();

  let data = {
    userId: userDetails.id,
    sessionId: userDetails.sessionId,
  };

  const webUrl = window.electronAPI.getWebUrl();

  const updateSession = async () => {
    const url = `${webUrl}/api/users/logout/${userDetails.id}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      window.electronAPI.logErrorsInFile(
        error,
        "logOutUser > line 566 > in dashboard.js"
      );
      return error;
    }
  };

  await updateSession()
    .then((res) => {
      if (!res.ok) {
        const dashLogOutError = document.getElementById(
          "settings-logout-error"
        );
        dashLogOutError.style.display = "block";
        dashLogOutError.innerHTML = "Something went wrong!";
      }

      if (res.ok) {
        window.electronAPI.closeAppWindow();
        window.location.href = "../entry/login.html";
      }
    })
    .catch((error) => {
      console.log(error);
      window.electronAPI.logErrorsInFile(
        error,
        "updateUserSession > line 591 > in dashboard.js"
      );
      const dashLogOutError = document.getElementById("settings-logout-error");
      dashLogOutError.style.display = "block";
      dashLogOutError.innerHTML = "Something went wrong!";
    });
};

const getFonts = async (userId) => {
  const webUrl = window.electronAPI.getWebUrl();
  const url = `${webUrl}/api/fonts/download/${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.json();
  } catch (error) {
    window.electronAPI.logErrorsInFile(
      error,
      "getFData > line 616 > in dashboard.js"
    );
    console.log(error);
    return error;
  }
};

const reDownloadFonts = async () => {
  let userDetails = window.electronAPI.getUserDetails();

  const launchButton = document.getElementById("launch-button");
  const redownloadFontsBtn = document.getElementById("redownload-fonts");
  redownloadFontsBtn.style.display = "none";

  const settingsDownloadLib = document.getElementById("settings-download-lib");

  const computedStyleDwnBtn = getComputedStyle(settingsDownloadLib);
  const isDisplay = computedStyleDwnBtn.getPropertyValue("display");

  if (isDisplay !== "none") {
    settingsDownloadLib.style.display = "none";
  }

  let fontData;
  const mainProgressBar = document.getElementById("progress-bar-main");

  try {
    mainProgressBar.style.display = "flex";
    launchButton.style.display = "none";

    const progressBar = document.getElementsByClassName("progress-bar")[0];
    setInterval(() => {
      const computedStyle = getComputedStyle(progressBar);
      const width = parseFloat(computedStyle.getPropertyValue("--width")) || 0;
      progressBar.style.setProperty("--width", width + 0.1);
    }, 10);
    // Get Fonts from web via API
    fontData = await getFonts(userDetails.id)
      .then((data) => {
        // fontData = data;
        return data;
      })
      .catch((error) => {
        console.log(error);
        window.electronAPI.logErrorsInFile(
          error,
          "getFData > line 662 > in dashboard.js"
        );
      });

    let formattedData;

    const processItems = async (arrayOfItems) => {
      const asyncResults = [];

      for (const item of arrayOfItems) {
        try {
          let fData = await window.electronAPI.runCipherData(
            item.fontObject,
            "deDee34Oemae124maEku@$#keCeCunauTaUhuhere"
          );

          let fItem = {
            FontName: item.name,
            fData: fData,
            weight: item.weight,
            language: item.language.name,
            category: item.category.name,
            isFeatured: item.isFeatured,
            isFavourite: false,
          };

          asyncResults.push(fItem);
        } catch (error) {
          console.error("An error occurred:", error);
          window.electronAPI.logErrorsInFile(
            error,
            "readFData > line 693 > in dashboard.js"
          );
        }
      }

      return asyncResults;
    };

    formattedData = await processItems(fontData);

    window.electronAPI.setStoreFonts(formattedData);

    const settingsDownloadMsg = document.getElementById(
      "settings-download-successMsg"
    );

    settingsDownloadMsg.style.display = "block";

    settingsDownloadMsg.innerHTML =
      "Fonts downloaded successfully... You can start using IndiaFont V4.";
  } catch (error) {
    console.log(error);
    window.electronAPI.logErrorsInFile(
      error,
      "getFData > line 717 > in dashboard.js"
    );
  } finally {
    mainProgressBar.style.display = "none";
    launchButton.style.display = "flex";
    redownloadFontsBtn.style.display = "block";

    if (isDisplay !== "none") {
      settingsDownloadLib.style.display = "flex";
    }
  }
};

const editUserButton = (button) => {
  button.style.display = "none";

  const updateButton = document.getElementById("update-button");
  updateButton.style.display = "flex";

  const fullname = document.getElementById("fullname");
  const contact = document.getElementById("contact");
  const city = document.getElementById("city");
  const pincode = document.getElementById("pincode");
  const state = document.getElementById("state");
  const country = document.getElementById("country");
  const updatePass = document.getElementById("update-password");
  const confirmPass = document.getElementById("confirm-password1");

  fullname.disabled = false;
  contact.disabled = false;
  city.disabled = false;
  pincode.disabled = false;
  state.disabled = false;
  country.disabled = false;
  updatePass.disabled = false;
  confirmPass.disabled = false;
};

const updateUserButton = (button) => {
  button.style.display = "none";

  const editButton = document.getElementById("edit-button");
  editButton.style.display = "flex";

  const fullname = document.getElementById("fullname");
  const contact = document.getElementById("contact");
  const city = document.getElementById("city");
  const pincode = document.getElementById("pincode");
  const state = document.getElementById("state");
  const country = document.getElementById("country");
  const updatePass = document.getElementById("update-password");
  const confirmPass = document.getElementById("confirm-password1");

  fullname.disabled = true;
  contact.disabled = true;
  city.disabled = true;
  pincode.disabled = true;
  state.disabled = true;
  country.disabled = true;
  updatePass.disabled = true;
  confirmPass.disabled = true;
};

const openLink = (url) => {
  window.electronAPI.openExternalLink(`https://${url}`);
};

const openPurchaseLink = (url) => {
  console.log(url);
  if (url) {
    window.electronAPI.openExternalLink(url);
  } else {
    window.electronAPI.openExternalLink(`https://indiafont.com`);
  }
};

const closeApplication = () => {
  window.electronAPI.closeApplication();
};

const passwordRecovery = () => {
  const step1 = document.getElementById("settings-user-details");
  const step2 = document.getElementById("settings-pass-change-form");

  step1.style.display = "none";
  step2.style.display = "flex";
};

const passwordRecoveryBack = () => {
  const step1 = document.getElementById("settings-user-details");
  const step2 = document.getElementById("settings-pass-change-form");

  step1.style.display = "flex";
  step2.style.display = "none";
};

// Slide show related

const carousel = document.querySelector(".carousel"),
  firstImg = carousel.querySelectorAll(".carousel img")[0],
  arrowIcons = document.querySelectorAll(".slides-wrapper i");
let isDragStart = false,
  isDragging = false,
  prevPageX,
  prevScrollLeft,
  positionDiff;
const showHideIcons = () => {
  // showing and hiding prev/next icon according to carousel scroll left value
  let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
  arrowIcons[0].style.display = carousel.scrollLeft == 0 ? "none" : "block";
  arrowIcons[1].style.display =
    carousel.scrollLeft == scrollWidth ? "none" : "block";
};

arrowIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    let firstImgWidth = firstImg.clientWidth + 15; // getting first img width & adding 14 margin value
    // if clicked icon is left, reduce width value from the carousel scroll left else add to it
    carousel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
    // setTimeout(() => showHideIcons(), 60); // calling showHideIcons after 60ms
  });
});

let scrollWidth = carousel.scrollWidth - carousel.clientWidth;
// setInterval(() => {
//   if (carousel.scrollLeft === scrollWidth) {
//     carousel.scrollLeft = 0;
//   } else {
//     arrowIcons[1].click();
//   }
// }, 1500);

const autoSlide = () => {
  // if there is no image left to scroll then return from here
  if (
    carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 ||
    carousel.scrollLeft <= 0
  )
    return;
  positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
  let firstImgWidth = firstImg.clientWidth + 14;
  // getting difference value that needs to add or reduce from carousel left to take middle img center
  let valDifference = firstImgWidth - positionDiff;
  if (carousel.scrollLeft > prevScrollLeft) {
    // if user is scrolling to the right
    return (carousel.scrollLeft +=
      positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff);
  }
  // if user is scrolling to the left
  carousel.scrollLeft -=
    positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
};
const dragStart = (e) => {
  // updatating global variables value on mouse down event
  isDragStart = true;
  prevPageX = e.pageX || e.touches[0].pageX;
  prevScrollLeft = carousel.scrollLeft;
};
const dragging = (e) => {
  // scrolling images/carousel to left according to mouse pointer
  if (!isDragStart) return;
  e.preventDefault();
  isDragging = true;
  carousel.classList.add("dragging");
  positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
  carousel.scrollLeft = prevScrollLeft - positionDiff;
  // showHideIcons();
};
const dragStop = () => {
  isDragStart = false;
  carousel.classList.remove("dragging");
  if (!isDragging) return;
  isDragging = false;
  // autoSlide();
};
carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("touchstart", dragStart);
document.addEventListener("mousemove", dragging);
carousel.addEventListener("touchmove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("touchend", dragStop);

async function downloadLibraryFile() {
  downloadInProgress = true;

  const fileUrl =
    "https://ifont.nyc3.cdn.digitaloceanspaces.com/V4_Pro_Library.zip"; // Replace with the URL of the file you want to download
  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-bar-main");
  progressContainer.style.display = "flex";
  const settingsDownloadLib = document.getElementById("settings-download-lib");
  settingsDownloadLib.style.display = "none";

  const redownloadFontsBtn = document.getElementById("redownload-fonts");
  redownloadFontsBtn.style.display = "none";

  var element = document.createElement("a");
  element.href = fileUrl;
  element.click();

  await fetch(fileUrl, {
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => {
      if (!response.ok) {
        window.electronAPI.logErrorsInFile(
          "Network response was not ok",
          "libDwbld > line 927 > in dashboard.js"
        );
        throw new Error("Network response was not ok");
      }

      console.log(response);

      const contentLength = response.headers.get("content-length");
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();

      function pump() {
        return reader.read().then(({ value, done }) => {
          if (done) {
            // progressBar.style.width = "100%";
            progressBar.style.setProperty("--width", 100);
          } else {
            loaded += value.byteLength;
            // progressBar.style.width = `${(loaded / total) * 100}%`;
            progressBar.style.setProperty("--width", (loaded / total) * 100);
            return pump();
          }
        });
      }

      return pump();
    })
    .then(() => {
      // Download complete
      console.log("Download complete");
      setTimeout(() => {
        progressContainer.style.display = "none";

        const settingsDownloadLib = document.getElementById(
          "settings-download-lib"
        );

        const settingsDownloadMsg = document.getElementById(
          "settings-download-successMsg"
        );

        settingsDownloadLib.style.display = "none";
        settingsDownloadMsg.style.display = "block";
        settingsDownloadMsg.innerHTML =
          "Library downloaded successfully... You can start using IndiaFont V4.";
        redownloadFontsBtn.style.display = "flex";

        downloadInProgress = false;
      }, 5000);
    })
    .catch((error) => {
      console.error("Download error:", error);
      window.electronAPI.logErrorsInFile(
        `"Download error:", ${error}`,
        "getFData > line 616 > in dashboard.js"
      );
      const settingsDownloadLib = document.getElementById(
        "settings-download-lib"
      );

      settingsDownloadLib.style.display = "flex";

      const settingsDownloadMsg = document.getElementById(
        "settings-download-successMsg"
      );
      settingsDownloadMsg.style.display = "block";
      settingsDownloadMsg.style.color = "red";
      settingsDownloadMsg.innerHTML =
        "Failed to download the library, please try again.";

      downloadInProgress = false;
    });
}
