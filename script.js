require('.env').config();
import something from 'module-name';

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

document.addEventListener("DOMContentLoaded", () => {
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");
    const adminLoginForm = document.getElementById("admin-login-form");
    const adminUsernameInput = document.getElementById("admin-username");
    const adminPasswordInput = document.getElementById("admin-password");
    const loginError = document.getElementById("login-error");
    const adminPanel = document.getElementById("admin");
    const adminLoginSection = document.getElementById("admin-login");
    const backgroundForm = document.getElementById("background-form");
    const backgroundUrlInput = document.getElementById("background-url");
    const logoutButton = document.getElementById("logout-button");
    const tourCardsContainer = document.querySelector(".tour-cards");
    const adminTourList = document.getElementById("admin-tour-list");
    const addTourForm = document.getElementById("add-tour-form");
    const tourNameInput = document.getElementById("tour-name");
    const tourDurationInput = document.getElementById("tour-duration");
    const tourDescriptionInput = document.getElementById("tour-description");
    const tourImageUrlInput = document.getElementById("tour-image-url");

    // Hardcoded admin credentials
    const adminCredentials = {
        username: "admin",
        password: "password123"
    };

    // Ensure "Our Tours" tab is always open by default
    const openDefaultTab = () => {
        tabContents.forEach(content => {
            content.style.display = "none"; // Hide all sections
        });
        document.getElementById("tours").style.display = "block"; // Show "Our Tours" section
    };

    // Load saved data from localStorage
    const loadSavedData = () => {
        // Load tours
        const savedTours = JSON.parse(localStorage.getItem("tours")) || [];
        savedTours.forEach(tour => {
            addTourToPage(tour.name, tour.duration, tour.description, tour.imageUrl);
            addTourToAdminList(tour.name, tour.duration, tour.description, tour.imageUrl);
        });

        // Load background image
        const savedBackground = localStorage.getItem("backgroundImage");
        if (savedBackground) {
            document.body.style.backgroundImage = `url('${savedBackground}')`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundRepeat = "no-repeat";
        }
    };

    // Save tours to localStorage
    const saveToursToLocalStorage = () => {
        const tours = [];
        tourCardsContainer.querySelectorAll(".tour-card").forEach(card => {
            const name = card.querySelector("h3").textContent;
            const duration = card.querySelector("p:nth-child(2)").textContent;
            const description = card.querySelector("p:nth-child(3)").textContent;
            const imageUrl = card.querySelector("img").src;
            tours.push({ name, duration, description, imageUrl });
        });
        localStorage.setItem("tours", JSON.stringify(tours));
    };

    // Add a tour to the "Our Tours" section
    const addTourToPage = (name, duration, description, imageUrl) => {
        const tourCard = document.createElement("div");
        tourCard.classList.add("tour-card");
        tourCard.innerHTML = `
            <img src="${imageUrl}" alt="${name}">
            <div class="tour-info">
                <h3>${name}</h3>
                <p>${duration}</p>
                <p>${description}</p>
                <button class="book-now">Book Now</button>
            </div>
        `;
        tourCardsContainer.appendChild(tourCard);
    };

    // Add a tour to the admin panel list
    const addTourToAdminList = (name, duration, description, imageUrl) => {
        const adminTourItem = document.createElement("li");
        adminTourItem.innerHTML = `
            ${name} - ${duration}
            <button class="delete-tour">Delete</button>
        `;
        adminTourList.appendChild(adminTourItem);

        // Add event listener for the delete button
        const deleteButton = adminTourItem.querySelector(".delete-tour");
        deleteButton.addEventListener("click", () => {
            // Remove from admin list
            adminTourItem.remove();

            // Remove from "Our Tours" section
            const tourCards = Array.from(tourCardsContainer.querySelectorAll(".tour-card"));
            const tourToDelete = tourCards.find(card => card.querySelector("h3").textContent === name);
            if (tourToDelete) {
                tourToDelete.remove();
            }

            // Save changes to localStorage
            saveToursToLocalStorage();
        });
    };

    // Tab switching functionality
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetTab = link.getAttribute("data-tab");
            const targetContent = document.getElementById(targetTab);

            // Toggle visibility of the clicked tab
            if (targetContent.style.display === "block") {
                targetContent.style.display = "none";
            } else {
                // Hide all sections and show the selected one
                tabContents.forEach(content => {
                    content.style.display = "none";
                });
                targetContent.style.display = "block";
            }

            // If the admin tab is clicked, show the login form if not authenticated
            if (targetTab === "admin" && !adminPanel.classList.contains("authenticated")) {
                adminLoginSection.style.display = "block";
                adminPanel.style.display = "none";
            }
        });
    });

    // Handle admin login
    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();

        if (username === adminCredentials.username && password === adminCredentials.password) {
            // Successful login
            adminLoginSection.style.display = "none";
            adminPanel.style.display = "block";
            adminPanel.classList.add("authenticated");
            loginError.style.display = "none";
        } else {
            // Invalid credentials
            loginError.style.display = "block";
        }
    });

    // Handle adding a new tour
    addTourForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = tourNameInput.value.trim();
        const duration = tourDurationInput.value.trim();
        const description = tourDescriptionInput.value.trim();
        const imageUrl = tourImageUrlInput.value.trim();

        if (name && duration && description && imageUrl) {
            addTourToPage(name, duration, description, imageUrl);
            addTourToAdminList(name, duration, description, imageUrl);
            saveToursToLocalStorage(); // Save changes to localStorage
            addTourForm.reset();
        }
    });

    // Handle background image change
    backgroundForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const backgroundUrl = backgroundUrlInput.value.trim();
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url('${backgroundUrl}')`;
            document.body.style.backgroundSize = "contain";
            document.body.style.backgroundRepeat = "no-repeat";
            localStorage.setItem("backgroundImage", backgroundUrl); // Save background to localStorage
            backgroundUrlInput.value = ""; // Clear the input field
        }
    });

    // Handle admin logout
    logoutButton.addEventListener("click", () => {
        // Hide the admin panel
        adminPanel.style.display = "none";
        adminPanel.classList.remove("authenticated");

        // Show the login form
        adminLoginSection.style.display = "block";

        // Reset the login form
        adminUsernameInput.value = "";
        adminPasswordInput.value = "";
        loginError.style.display = "none";
    });

    // Load saved data on page load
    loadSavedData();

    // Open the default tab ("Our Tours")
    openDefaultTab();
});
