document.addEventListener("DOMContentLoaded", async function () {
  // Select Font button
  const selectFontBtn = document.getElementById("selectFontBtn");
  const fontDropdown = document.getElementById("fontDropdown");

  // Toggle font dropdown on button click
  selectFontBtn.addEventListener("click", function () {
    fontDropdown.style.display =
      fontDropdown.style.display === "none" ? "block" : "none";

    if (fontDropdown.style.display === "block") {
      window.localStorage.setItem("fontListOpened", true);
      editor.closeRightMenu();
    }

    if (fontDropdown.style.display === "none") {
      window.localStorage.setItem("fontListOpened", false);
    }
  });

  isTrial = window.electronAPI.checkIfTrial();

  let storedFonts;
  let copyOfStored;

  if (isTrial) {
    const featchData = await fetch(
      "./Customs/fabric/trial-font-data.json"
    ).then((res) => {
      return res.json();
    });

    storedFonts = featchData.map((item) => ({
      FontName: item.FontName,
      fData: item.fData,
      weight: item.weight,
      language: item.language,
      category: item.category,
      isFeatured: item.isFeatured,
      isFavourite: false,
    }));

    // window.electronAPI.showMainAppWindow()
  } else {
    let storedData = window.electronAPI.getStoredFonts();
    copyOfStored = storedData;

    const reProcessItems = async (arrayOfItems) => {
      const asyncResults = [];

      // window.electronAPI.showFontLoadWindow();

      for (const item of arrayOfItems) {
        try {
          let fData = await window.electronAPI.runDeCipherData(
            item.fData.encryptedData,
            item.fData.iv,
            item.fData.salt,
            "deDee34Oemae124maEku@$#keCeCunauTaUhuhere"
          );

          let fItem = {
            FontName: item.FontName,
            fData: fData,
            weight: item.weight,
            language: item.language,
            category: item.category,
            isFeatured: item.isFeatured,
            isFavourite: item.isFavourite,
          };

          asyncResults.push(fItem);
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }

      window.electronAPI.closeFontLoadWindow();

      return asyncResults;
    };

    storedFonts = await reProcessItems(storedData);
  }

  let selectedLanguage;
  let selectedCategory;
  let selectedWeight;
  let isFeaturedOn = false;
  let isFavouriteOn = false;

  let mainFontObjects = storedFonts.map((font) => ({
    FontName: font.FontName,
    weight: font.weight,
    language: font.language,
    category: font.category,
    isFeatured: font.isFeatured,
    isFavourite: font.isFavourite
  }));

  mainFontObjects.sort(function (a, b) {
    if (a.FontName < b.FontName) {
      return -1;
    }
    if (a.FontName > b.FontName) {
      return 1;
    }
    return 0;
  });

  let fontObjects = mainFontObjects.map((font) => ({
    FontName: font.FontName,
    weight: font.weight,
    language: font.language,
    category: font.category,
    isFeatured: font.isFeatured,
    isFavourite: font.isFavourite,
  }));

  fontObjects.sort(function (a, b) {
    if (a.FontName < b.FontName) {
      return -1;
    }
    if (a.FontName > b.FontName) {
      return 1;
    }
    return 0;
  });

  let currentFilteredList = fontObjects;

  let fontQty = fontObjects.length;

  const fontListSearchInput = document.getElementById("fontList-search");
  fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;

  //SearchFilter
  fontListSearchInput.addEventListener("input", (e) => {
    let value = e.target.value;

    fontObjects =
      value === ""
        ? currentFilteredList
        : currentFilteredList.filter((data) =>
            data.FontName.toLowerCase()
              .replace(/\s+/g, "")
              .includes(value.toLowerCase().replace(/\s+/g, ""))
          );
    renderFonts();
  });

  updateSelectedFontName("AMS Abhimanyu");

  // Font Filter Icons
  const fontIcons = document.querySelectorAll(".svg-icon img");
  const filterOptionsSets = [
    ["All Fonts", "Hindi-Marathi Fonts", "Gujarati Fonts", "English Fonts"], // Options for Icon 1
    [
      "All Categories",
      "Calligraphy Fonts",
      "Publication Fonts",
      "Decorative Fonts",
    ], // Options for Icon 2
    ["All Types", "Bold Fonts", "Medium Fonts", "Light Fonts"], // Options for Icon 3
    ["Show All", "My Favourite Fonts", "Featured Fonts"], // Options for Icon 4
    // Add more sets for other icons as needed
  ];

  fontIcons.forEach((icon, index) => {
    icon.addEventListener("click", function (event) {
      // Hide all Font Filters Dropdowns
      document
        .querySelectorAll(".font-filters-dropdown")
        .forEach((dropdown) => {
          if (dropdown.id !== `fontFiltersDropdown${index + 1}`) {
            dropdown.style.display = "none";
          }
        });

      if (event.target.alt === "Reset") {
        fontObjects = mainFontObjects;
        fontQty = fontObjects.length;
        fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
        currentFilteredList = fontObjects;

        selectedLanguage = undefined;
        selectedWeight = undefined;
        selectedCategory = undefined;
        isFeaturedOn = false;
        isFavouriteOn = false;
        renderFonts();
      }

      // Show or hide Font Filters Dropdown for the clicked icon
      const fontFiltersDropdown = document.getElementById(
        `fontFiltersDropdown${index + 1}`
      );
      if (event.target.alt !== "Reset") {
        fontFiltersDropdown.style.display =
          fontFiltersDropdown.style.display === "none" ? "flex" : "none";

        // Prevent the click event from propagating to the document and closing the dropdown
        event.stopPropagation();

        // Change icon colors
        resetIconColors();
        icon.classList.add("selected");
      }
    });
  });

  const filterOptionsContainers = document.querySelectorAll(
    ".font-filters-dropdown"
  );

  filterOptionsContainers.forEach((container, index) => {
    const filterOptions = filterOptionsSets[index];

    filterOptions.forEach((optionText, optionIndex) => {
      const optionElement = document.createElement("div");
      optionElement.className =
        optionIndex === 0 ? "filter-option selected" : "filter-option";
      optionElement.textContent = optionText;

      optionElement.addEventListener("click", function () {
        // Language Filters
        if (optionElement.innerHTML === "All Fonts") {
          selectedLanguage = undefined;
        }

        if (optionElement.innerHTML === "Hindi-Marathi Fonts") {
          selectedLanguage = "Devnagari";
        }

        if (optionElement.innerHTML === "Gujarati Fonts") {
          selectedLanguage = "Gujarati";
        }

        if (optionElement.innerHTML === "English Fonts") {
          selectedLanguage = "English";
        }

        //Weight Filters
        if (optionElement.innerHTML === "All Types") {
          selectedWeight = undefined;
        }

        if (optionElement.innerHTML === "Bold Fonts") {
          selectedWeight = "Bold";
        }

        if (optionElement.innerHTML === "Medium Fonts") {
          selectedWeight = "Medium";
        }

        if (optionElement.innerHTML === "Light Fonts") {
          selectedWeight = "Light";
        }

        //Category Filters
        if (optionElement.innerHTML === "All Categories") {
          selectedCategory = undefined;
        }

        if (optionElement.innerHTML === "Calligraphy Fonts") {
          selectedCategory = "Calligraphy";
        }

        if (optionElement.innerHTML === "Publication Fonts") {
          selectedCategory = "Publication";
        }

        if (optionElement.innerHTML === "Decorative Fonts") {
          selectedCategory = "Decorative";
        }

        //Featured and Favourite Filters
        if (optionElement.innerHTML === "Show All") {
          isFeaturedOn = false;
          isFavouriteOn = false;
        }

        if (optionElement.innerHTML === "My Favourite Fonts") {
          isFeaturedOn = false;
          isFavouriteOn = true;
        }

        if (optionElement.innerHTML === "Featured Fonts") {
          isFavouriteOn = false;
          isFeaturedOn = true;
        }

        //Apply filter and load FontList
        if (selectedLanguage && selectedWeight && selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.language === selectedLanguage &&
                item.weight === selectedWeight &&
                item.category === selectedCategory
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.language === selectedLanguage &&
                item.weight === selectedWeight &&
                item.category === selectedCategory
              : item.language === selectedLanguage &&
                item.weight === selectedWeight &&
                item.category === selectedCategory
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (!selectedLanguage && selectedWeight && selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.weight === selectedWeight &&
                item.category === selectedCategory
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.weight === selectedWeight &&
                item.category === selectedCategory
              : item.weight === selectedWeight &&
                item.category === selectedCategory
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (selectedLanguage && !selectedWeight && selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.language === selectedLanguage &&
                item.category === selectedCategory
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.language === selectedLanguage &&
                item.category === selectedCategory
              : item.language === selectedLanguage &&
                item.category === selectedCategory
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (selectedLanguage && selectedWeight && !selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.language === selectedLanguage &&
                item.weight === selectedWeight
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.language === selectedLanguage &&
                item.weight === selectedWeight
              : item.language === selectedLanguage &&
                item.weight === selectedWeight
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (!selectedLanguage && !selectedWeight && selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.category === selectedCategory
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.category === selectedCategory
              : item.category === selectedCategory
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (!selectedLanguage && selectedWeight && !selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.weight === selectedWeight
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.weight === selectedWeight
              : item.weight === selectedWeight
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (selectedLanguage && !selectedWeight && !selectedCategory) {
          fontObjects = mainFontObjects.filter((item) =>
            isFeaturedOn === true
              ? item.isFeatured === isFeaturedOn &&
                item.language === selectedLanguage
              : isFavouriteOn === true
              ? item.isFavourite === isFavouriteOn &&
                item.language === selectedLanguage
              : item.language === selectedLanguage
          );
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        if (!selectedLanguage && !selectedWeight && !selectedCategory) {
          if (isFeaturedOn === true) {
            fontObjects = mainFontObjects.filter(
              (item) => item.isFeatured === isFeaturedOn
            );
          }
          if (isFavouriteOn === true) {
            fontObjects = mainFontObjects.filter(
              (item) => item.isFavourite === isFavouriteOn
            );
          }

          if (isFeaturedOn === false && isFavouriteOn === false) {
            fontObjects = mainFontObjects;
          }
          fontQty = fontObjects.length;
          fontListSearchInput.placeholder = `Search in ${fontQty} fonts...`;
          currentFilteredList = fontObjects;
        }

        renderFonts();

        // Check if the option is already selected
        const isAlreadySelected = optionElement.classList.contains("selected");

        if (!isAlreadySelected) {
          // Highlight the selected option
          filterOptionsContainers[index]
            .querySelectorAll(".filter-option")
            .forEach((opt) => opt.classList.remove("selected"));
          optionElement.classList.add("selected"); // Add the "selected" class without toggling
        }

        // Change icon color to blue if selected
        resetIconColors();
        const icon = document.getElementById(`icon${index + 1}`);
        icon.classList.add("selected");

        // Set the background color for the icon on selection (if not already selected)
        if (!isAlreadySelected) {
          icon.style.background = "#f98e3f";
        }

        // If the first option is selected, reset the icon color
        if (optionIndex === 0) {
          icon.style.background = "#fff";
        }

        // Hide Font Filters Dropdown
        filterOptionsContainers[index].style.display = "none";
      });

      container.appendChild(optionElement);
    });

    // Add this code to handle the reset icon
    const resetIcon = document.getElementById(`icon${index + 1}`);
    resetIcon.addEventListener("click", function () {
      // Auto-select the first option
      const firstOption = container.querySelector(".filter-option");
      firstOption.classList.add("selected");

      // Change icon colors back to default (remove "selected" class)
      resetIconColors();

      // Set the background color for the reset icon based on the first option's state
      resetIcon.style.background = "#fff";
      resetIcon.classList.remove("selected");
    });
  });

  // Font Listing (Add sample items for demonstration)
  const fontListing = document.querySelector(".scrollable-section");
  let selectedListItem = null;
  let favoriteFonts = new Set(); // Track selected favorite fonts

  // Function to render font items in the list
  function renderFonts() {
    fontListing.innerHTML = "";
    fontObjects.forEach((font, index) => {
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.id = `fontListItem-${index + 1}`;
      let starFill = font.isFavourite ? "#f17011" : "#afafaf";
      listItem.innerHTML = `
            <div class="list-rectangle">
                <div class="font-column"><div class="title">${font.FontName}</div></div>
                <div class="icon-column">
                    <svg class="list-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${starFill}"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                    </svg>
                </div>
            </div>
        `;
      listItem.onclick = () => {
        setFontFamily(font.FontName);
      };
      listItem.addEventListener("mouseover", () => {
        setFontFamily(font.FontName);
      });
      listItem.addEventListener("mouseout", () => {
        var FontValue = document.getElementById("selectedFontName").innerText;
        setFontFamily(FontValue);
      });

      const title = listItem.querySelector(".font-column .title");

      listItem.addEventListener("click", function () {
        // Check if there is a previously selected item

        if (selectedListItem) {
          // Clear selection on the previous item for text
          selectedListItem
            .querySelector(".font-column .title")
            .classList.remove("selected-title");

          // Clear selection on the previous item for icon
          selectedListItem
            .querySelector(".icon-column .list-icon")
            .classList.remove("selected-icon");

          selectedListItem.classList.remove("activeOption");
        }

        // Toggle selection on the clicked text
        title.classList.toggle("selected-title");

        listItem.classList.toggle("activeOption");

        // Toggle selection on the clicked item for icon
        /*             listItem.querySelector(".icon-column .list-icon").classList.toggle("selected-icon"); */

        // Update the selected item reference
        selectedListItem = title.classList.contains("selected-title")
          ? listItem
          : null;

        // Update the selected font name in the button
        if (selectedListItem) {
          const selectedFontName = selectedListItem.querySelector(
            ".font-column .title"
          ).textContent;
          updateSelectedFontName(selectedFontName);
        } else {
          // Handle the case when no font is selected (optional)
          updateSelectedFontName("Default Font");
        }
      });

      // Handle clicks on the icon column
      const iconColumn = listItem.querySelector(".icon-column");
      iconColumn.addEventListener("click", function (event) {
        // Stop the event from propagating to the list item
        event.stopPropagation();

        // handleIconColumnClick(listItem, title);
        setUnsetFavFont(font.FontName, listItem);
      });

      fontListing.appendChild(listItem);
    });

    const empyListItem = document.createElement("div");
    empyListItem.className = "list-item";
    empyListItem.innerHTML = `
            <div class="list-rectangle">
                <div class="font-column"><div class="title"></div></div>
                <div class="icon-column">
                </div>
            </div>
        `;

    fontListing.appendChild(empyListItem);
  }

  function setUnsetFavFont(fontName, listItem) {
    isTrial = window.electronAPI.checkIfTrial();
    if (isTrial) {
      return;
    }

    let fontIndex = mainFontObjects.findIndex(
      (font) => font.FontName === fontName
    );

    mainFontObjects[fontIndex].isFavourite =
      mainFontObjects[fontIndex].isFavourite === true ? false : true;

    let fontIndex2 = copyOfStored.findIndex(
      (font) => font.FontName === fontName
    );

    copyOfStored[fontIndex2].isFavourite =
      copyOfStored[fontIndex2].isFavourite === true ? false : true;

    window.electronAPI.setStoreFonts(copyOfStored);
    renderFonts();
  }

  function handleIconColumnClick(listItem, title) {
    console.log("called");
    // Handle clicks on the icon column
    const icon = listItem.querySelector(".icon-column .list-icon");
    icon.classList.toggle("selected-icon");

    // Toggle color fill on the SVG inside the "icon-column"
    const fill = icon.classList.contains("selected-icon")
      ? "#f17011"
      : "#afafaf";
    icon.setAttribute("fill", fill);
  }

  function updateSelectedFontName(fontName) {
    const selectedFontNameElement = document.getElementById("selectedFontName");
    if (selectedFontNameElement) {
      selectedFontNameElement.textContent = fontName;
    }
  }

  // Render fonts on page load
  renderFonts();

  // Handle keyboard navigation
  document.addEventListener("keydown", function (event) {
    if (selectedListItem !== null) {
      let currentListItemID = selectedListItem.id;
      const currentListItem = document.getElementById(currentListItemID);
      const currentTitle = currentListItem.querySelector(".font-column .title");

      let extractedListItemID = currentListItemID.split("-")[1];

      let scrollHeight = fontListing.scrollHeight - fontListing.clientHeight;

      if (extractedListItemID === 1) {
        return;
      }

      if (event.key === "ArrowUp") {
        extractedListItemID = parseInt(extractedListItemID) - 1;
      }

      if (event.key === "ArrowDown") {
        extractedListItemID = parseInt(extractedListItemID) + 1;
      }

      let newListItem = document.getElementById(
        `fontListItem-${extractedListItemID}`
      );
      let newTitle = newListItem.querySelector(".font-column .title");

      switch (event.key) {
        case "ArrowUp":
          // selectedListItem = Math.max(selectedListItem - 1, 0);

          currentListItem.classList.toggle("activeOption");
          currentTitle.classList.toggle("selected-title");

          newListItem.classList.toggle("activeOption");
          newTitle.classList.toggle("selected-title");

          updateSelectedFontName(newTitle.textContent);
          setFontFamily(newTitle.textContent);
          selectedListItem = newListItem;

          break;
        case "ArrowDown":
          // selectedListItem = Math.min(
          //   selectedListItem + 1,
          //   fontObjects.length - 1
          // );

          currentListItem.classList.toggle("activeOption");
          currentTitle.classList.toggle("selected-title");

          newListItem.classList.toggle("activeOption");
          newTitle.classList.toggle("selected-title");

          updateSelectedFontName(newTitle.textContent);
          setFontFamily(newTitle.textContent);
          selectedListItem = newListItem;
          break;
        default:
          return; // Exit this handler for other keys
      }

      // renderFonts()
      // event.preventDefault(); // Prevent the default action for arrow keys
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideFontDropdown =
      fontDropdown.contains(event.target) ||
      selectFontBtn.contains(event.target);
    if (!isClickInsideFontDropdown) {
      fontDropdown.style.display = "none";
      window.localStorage.setItem("fontListOpened", false);
    }

    // Toggle icon dropdowns on clicking outside
    document.querySelectorAll(".font-filters-dropdown").forEach((dropdown) => {
      const isClickInsideDropdown = dropdown.contains(event.target);
      if (!isClickInsideDropdown) {
        dropdown.style.display = "none";
      }
    });
  });

  function resetIconColors() {
    // Change icon colors back to default (remove "selected" class)
    document.querySelectorAll(".svg-icon img").forEach((icon) => {
      icon.classList.remove("selected");
    });
  }
});

function resetFilters() {
  // Reset all dropdowns to auto-select the first option
  document
    .querySelectorAll(".font-filters-dropdown")
    .forEach((dropdown, index) => {
      const firstOption = dropdown.querySelector(".filter-option");
      const isFirstOptionSelected = firstOption.classList.contains("selected");

      // Deselect other options in the same dropdown
      dropdown.querySelectorAll(".filter-option").forEach((opt) => {
        opt.classList.remove("selected");
      });

      // Toggle the selected class for the first option
      firstOption.classList.add("selected");

      // Change icon colors back to default (remove "selected" class)
      resetIconColors();

      // Set the background color for the reset icon based on the first option's state
      const resetIcon = document.getElementById(`icon${index + 1}`);
      resetIcon.style.background = "#fff";
      resetIcon.classList.remove("selected");
    });

  // Logic to reset other filters goes here if needed

  // You might also want to hide the dropdowns if they are open
  document.querySelectorAll(".font-filters-dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
}

function resetIconColors() {
  // Change icon colors back to default (remove "selected" class)
  document.querySelectorAll(".svg-icon img").forEach((icon) => {
    icon.classList.remove("selected");
  });
}

function handleFirstOptionClick(index) {
  const firstOption = document.querySelector(
    `#fontFiltersDropdown${index} .filter-option:first-child`
  );
  const resetIcon = document.getElementById(`icon${index}`);
}

// Add this code to handle the click event on the first option for each icon
document.querySelectorAll(".svg-icon img").forEach((icon, index) => {
  icon.addEventListener("click", function () {
    handleFirstOptionClick(index + 1);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const fontIcons = document.querySelectorAll(".svg-icon img");

  fontIcons.forEach((icon, index) => {
    const tooltipText = getTooltipText(index + 1); // Get tooltip text based on icon index

    const tooltip = document.createElement("div");
    tooltip.className = "filter-tooltip";
    tooltip.textContent = tooltipText;
    icon.parentNode.appendChild(tooltip);

    icon.addEventListener("mouseover", function () {
      tooltip.style.display = "block";
    });

    icon.addEventListener("mouseout", function () {
      tooltip.style.display = "none";
    });
  });

  function getTooltipText(iconIndex) {
    // Customize this function to return the appropriate tooltip text for each icon
    switch (iconIndex) {
      case 1:
        return "Language";
      case 2:
        return "Category";
      case 3:
        return "Weight";
      case 4:
        return "Favorite";
      case 5:
        return "Reset Filters";
      default:
        return "";
    }
  }
});
