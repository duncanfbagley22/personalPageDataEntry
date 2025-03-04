import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, getDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQn0seQsyNBWZyQC7yJbPHVASMvGpQXzg",
    authDomain: "duncan-personal-page.firebaseapp.com",
    projectId: "duncan-personal-page",
    storageBucket: "duncan-personal-page.appspot.com",
    messagingSenderId: "361252486469",
    appId: "1:361252486469:web:a76e8daa1d00a877f5922c",
    measurementId: "G-N11X1ES6L8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Signed in as:", user.uid);
        loginBtn.style.display = "none";
        userDisplay.textContent = `Signed in as: ${user.displayName}`;
        userDisplay.style.display = "block";
    } else {
        console.log("❌ No user signed in.");
        loginBtn.style.display = "block";
        userDisplay.style.display = "none";
    }
});

function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.seconds) return "No Date"; // Handle missing dates
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // AM/PM format
    });
}

// Function to fetch messages
async function fetchMessages() {
    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = ""; // Clear previous messages

    try {
        const querySnapshot = await getDocs(collection(db, "messages"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const formattedDate = formatTimestamp(data.date); // Format Firestore timestamp

            const messageItem = document.createElement("li");
            messageItem.innerHTML = `
                <strong>${data.name} (${data.email})</strong> - ${formattedDate} <br>
                <em>${data.title}</em><br>
                ${data.message}
                <hr>
            `;
            messagesList.appendChild(messageItem);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Call function when page loads
fetchMessages();
