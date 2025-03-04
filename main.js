// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCQn0seQsyNBWZyQC7yJbPHVASMvGpQXzg",
    authDomain: "duncan-personal-page.firebaseapp.com",
    projectId: "duncan-personal-page",
    storageBucket: "duncan-personal-page.appspot.com",
    messagingSenderId: "361252486469",
    appId: "1:361252486469:web:a76e8daa1d00a877f5922c",
    measurementId: "G-N11X1ES6L8"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const auth = getAuth();
const loginBtn = document.getElementById("loginBtn"); // The login button
const userDisplay = document.getElementById("userDisplay"); // The element to display user info

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Signed in as:", user.uid);
        // Hide the login button and display the user's name
        loginBtn.style.display = "none"; // Hide login button
        userDisplay.textContent = `Signed in as: ${user.displayName}`; // Display user name
        userDisplay.style.display = "block"; // Show user info
    } else {
        console.log("❌ No user signed in.");
        // Show the login button and hide the user display
        loginBtn.style.display = "block"; // Show login button
        userDisplay.style.display = "none"; // Hide user info
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Signed in as:", result.user.displayName);
        // Hide the login button and display the user's name
        loginBtn.style.display = "none"; // Hide login button
        userDisplay.textContent = `Signed in as: ${result.user.displayName}`; // Display user name
        userDisplay.style.display = "block"; // Show user info
    } catch (error) {
        console.error("❌ Sign-in error:", error);
    }
});

document.getElementById("setTodayBtn").addEventListener("click", async () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("blogDate").value = today;
});

document.getElementById("entryType").addEventListener("change", function() {
    document.getElementById("blogForm").classList.toggle("hidden", this.value !== "blog");
    document.getElementById("contentForm").classList.toggle("hidden", this.value !== "content");
});

document.getElementById("contentType").addEventListener("change", function() {
    // Toggle visibility of sections
    document.getElementById("bookFields").classList.toggle("hidden", this.value !== "book" && this.value !== "podcast");
    document.getElementById("movieTvFields").classList.toggle("hidden", this.value !== "movie" && this.value !== "tvshow");
    document.getElementById("restaurantFields").classList.toggle("hidden", this.value !== "restaurant");

    // Update required attributes for all inputs
    updateRequiredInputs();
});

function updateRequiredInputs() {
    document.querySelectorAll("input, select, textarea").forEach(input => {
        const isHidden = input.closest(".hidden") !== null; // Check if parent has 'hidden'
        input.toggleAttribute("required", !isHidden); // Remove 'required' if parent is hidden
    });
}


const submitButton = document.getElementById("blogSubmitBtn");
const inputs = document.querySelectorAll("#blogForm input[required], #blogForm textarea[required]");

function checkInputs() {
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            allFilled = false;
        }
    });
    submitButton.disabled = !allFilled;
}

inputs.forEach(input => {
    input.addEventListener("input", checkInputs);
});

document.getElementById("blogForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const blogData = {
        title: document.getElementById("blogTitle").value,
        date: document.getElementById("blogDate").value,
        tags: document.getElementById("blogTags").value.split(","),
        externalLink: { url: document.getElementById("blogExtURL").value, label: document.getElementById("blogExtLabel").value, icon: document.getElementById("blogIcon").value },
        content: document.getElementById("blogContent").value,
        images: document.getElementById("blogImage").value.split(",")
    };
    
    await setDoc(doc(db, "blogData", blogData.title), blogData);
    
    document.getElementById("status").innerText = "Blog Entry Saved!";
});

document.getElementById("storageBtn").addEventListener("click", function() {
    window.open("https://console.firebase.google.com/u/0/project/duncan-personal-page/storage/duncan-personal-page.appspot.com/files/~2Ffavoritesimages", "_blank");
});

document.getElementById("clearBtn").addEventListener("click", function() {
    location.reload();
});

document.getElementById("contentForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const contentType = document.getElementById("contentType").value;
    const nameField = contentType === "restaurant" ? "name" : "title";

    const contentTable = contentType + 'Data';

    const querySnapshot = await getDocs(collection(db, contentTable));
    let maxId = 0;

    querySnapshot.forEach((doc) => {
        const docData = doc.data();
        if (docData.id && !isNaN(docData.id)) {
            maxId = Math.max(maxId, parseInt(docData.id));
        }
    });

    const newId = maxId + 1; // Increment for new entry

    const contentData = {
        id: newId,  // Store id as string
        datatype: contentType,
        [nameField]: document.getElementById("contentTitle").value,
        details: document.getElementById("contentDetails").value,
        externallink: document.getElementById("contentExtLink").value,
    };

    const image = document.getElementById("contentImage").value;
        if (image) {
            contentData.image = image;
        }

    const otherFields = {
        author: ["book", "podcast"].includes(contentType) ? document.getElementById("bookAuthor").value : null,
        streamingplatform: ["movie", "tvshow"].includes(contentType) ? document.getElementById("contentStreaming").value : null,
        years: ["movie", "tvshow"].includes(contentType) ? document.getElementById("contentYears").value : null,
        location: contentType === "restaurant" ? document.getElementById("location").value : null,
        maplink: contentType === "restaurant" ? document.getElementById("mapLink").value : null,
        typeoffood: contentType === "restaurant" ? document.getElementById("foodType").value : null
    };

    // Remove null or empty fields
    Object.keys(otherFields).forEach(key => {
        if (otherFields[key]) {
            contentData[key] = otherFields[key];
        }
    });

    let countdown = 7;
    const statusElement = document.getElementById("status");

    if (nameField === "title") {
    await setDoc(doc(db, contentTable, contentData.title), contentData);}
    else {await setDoc(doc(db, contentTable, contentData.name), contentData);}
    const countdownInterval = setInterval(() => {
        countdown--;
        statusElement.innerText = `Content Entry Saved! Refreshing in ${countdown} seconds`;
    
        if (countdown === 0) {
            clearInterval(countdownInterval); // Stop the countdown
            location.reload(); // Refresh the page
        }
    }, 1000); // Update every second
});

checkInputs();