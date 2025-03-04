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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();

// UI Elements
const userDisplay = document.getElementById("userDisplay");
const loginBtn = document.getElementById("loginBtn");
const deleteType = document.getElementById("deleteType");
const documentList = document.getElementById("documentList");
const documentDetails = document.getElementById("documentDetails");
const deleteBtn = document.getElementById("deleteBtn");

let currentCollection = null;
let currentDocumentId = null;

// Check authentication state
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

// Map entry types to Firestore collections
const collectionMap = {
    blog: "blogData",
    book: "bookData",
    movie: "movieData",
    podcast: "podcastData",
    restaurant: "restaurantData",
    tvshow: "tvshowData"
};

// Fetch available documents when entry type changes
deleteType.addEventListener("change", async () => {
    const entryType = deleteType.value;

    currentCollection = collectionMap[entryType];
    documentList.disabled = false;
    documentList.innerHTML = "<option value='none'>Select a Document</option>";
    documentDetails.innerHTML = "";
    currentDocumentId = null;

    try {
        const documents = await fetchDocuments(currentCollection);
        documents.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.id;
            if (entryType === "restaurant") {
                option.textContent = doc.name || `Document ${doc.id}`;
            } else {option.textContent = doc.title || `Document ${doc.id}`;}
            documentList.appendChild(option);
            if (documents.length > 1 && deleteBtn.disabled === true) {deleteBtn.disabled = false;}

        });
    } catch (error) {
        console.error("Error fetching documents:", error);
    }
    


});

// Fetch and display document details when one is selected
documentList.addEventListener("change", async () => {
    currentDocumentId = documentList.value;

    for (let i = 0; i < documentList.options.length; i++) {
        // Check if the value matches
        if (documentList.options[i].value === documentList.value) {
            currentDocumentId = documentList.options[i].text; // Return the inner text of the matching option
        }
    }
    if (currentDocumentId === "none") {
        documentDetails.innerHTML = "";
        deleteBtn.disabled = true;
        return;
    }

    try {
        const documentData = await fetchDocumentDetails(currentCollection, currentDocumentId);
        displayDocumentDetails(documentData);
        if (documentDetails.classList.contains("hidden")) {
            documentDetails.classList.toggle("hidden");
        }
        deleteBtn.disabled = false;
    } catch (error) {
        console.error("Error fetching document details:", error);
    }
});

// Confirm and delete document
deleteBtn.addEventListener("click", async () => {
    if (!currentCollection || !currentDocumentId) return;

    const confirmDelete = confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    try {
        await deleteDocument(currentCollection, currentDocumentId);
        alert("Document deleted successfully!");
        documentList.value = "none";
        documentDetails.innerHTML = "";
        deleteBtn.disabled = true;
        deleteType.dispatchEvent(new Event("change")); // Refresh document list
    } catch (error) {
        console.error("Error deleting document:", error);
    }
});

// Fetch all documents from a Firestore collection
async function fetchDocuments(collectionName) {
    if (!collectionName) return [];
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Fetch document details from Firestore
async function fetchDocumentDetails(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data(); // Get all the fields
        return docData;
    } else {
        console.log("No such document!");
        return null;
    }

    return docSnap.exists() ? docSnap.data() : null;
}

// Delete a document from Firestore
async function deleteDocument(collectionName, docId) {
    await deleteDoc(doc(db, collectionName, docId));
}

// Display document details in the UI
function displayDocumentDetails(documentData) { 
    documentDetails.innerHTML = `<h3>Document Details</h3>`;
    documentDetails.innerHTML += `<pre>${JSON.stringify(documentData, null, 2)}</pre>`;
}
