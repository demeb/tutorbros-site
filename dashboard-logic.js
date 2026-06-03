import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// PASTE YOUR FIREBASE CONFIG HERE (The exact same one from auth-logic.js)
const firebaseConfig = {
  apiKey: "AIzaSyD2y_w4xnR0mDBNpNm_3CtkADviMJb9e4Y",
  authDomain: "tutorbros.firebaseapp.com",
  projectId: "tutorbros",
  storageBucket: "tutorbros.firebasestorage.app",
  messagingSenderId: "1082771521197",
  appId: "1:1082771521197:web:bb9a1823b7e07bbc6ad024"
  // (We leave measurementId out for now to keep things fast)
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Check who is visiting this page
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Firebase found the user:", user.email); // DEBUGGING

            if (user.emailVerified) {
                console.log("Email is verified! Fetching database file..."); // DEBUGGING
                
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Database file found! Injecting data..."); // DEBUGGING
                    const userData = docSnap.data();
                    
                    // (Your existing code...)
                document.getElementById("student-name").innerText = userData.firstName;
                document.getElementById("student-email").innerText = userData.email;
                document.getElementById("student-phone").innerText = userData.phone || "Not provided";
                
                // === NEW: FETCH THEIR BOOKINGS ===
                const lessonsContainer = document.getElementById("lessons-container");
                lessonsContainer.innerHTML = "Loading your lessons..."; // Temporary loading text
                
                // Ask Firebase for the "bookings" folder for this specific user
                const bookingsRef = collection(db, "users", user.uid, "bookings");
                const bookingsSnap = await getDocs(bookingsRef);
                

                    



                if (bookingsSnap.empty) {
                    // If they have no bookings, show the default message
                    lessonsContainer.innerHTML = `
                        You don't have any lessons booked yet. 
                        <br><br>
                        <a href="find-teacher.html" class="btn-nav" style="display: inline-block;">Find a Teacher</a>
                    `;
                } else {
                    // If they DO have bookings, clear the container and loop through them!
                    lessonsContainer.innerHTML = ""; 
                    
                    bookingsSnap.forEach((doc) => {
                        const booking = doc.data();
                        const niceDate = new Date(booking.dateBooked).toLocaleDateString();

                        // === NEW: DYNAMIC COLOR LOGIC ===
                        let statusColor = "#f59e0b"; // Default Orange (for Pending)
                        
                        if (booking.status === "Email Sent") {
                            statusColor = "#10b981"; // TutorBros Success Green
                        } else if (booking.status === "Approved") {
                            statusColor = "#3b82f6"; // Beautiful Blue for later!
                        }

                        // Create the HTML card
                        lessonsContainer.innerHTML += `
                            <div style="background-color: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #a78bfa;">
                                <h4 style="color: #fff; margin: 0 0 5px 0;">Teacher: ${booking.teacherName}</h4>
                                <p style="color: #94a3b8; margin: 0 0 5px 0; font-size: 0.9rem;"><strong>Subject:</strong> ${booking.subject}</p>
                                
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 0.9rem;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${booking.status}</span></p>
                                
                                <p style="color: #64748b; font-size: 0.85rem; margin: 0;"><em>Booked on: ${niceDate}</em></p>
                                
                                <div style="background-color: #1e293b; padding: 10px; border-radius: 6px; margin-top: 10px; border: 1px solid #334155;">
                                    <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0; font-style: italic;">"${booking.message}"</p>
                                </div>
                            </div>
                        `;
                    });
                }
                } else {
                    console.log("WARNING: User is logged in, but no database file exists!");
                    // If they use the old test account, it won't have a database file!
                    document.getElementById("student-name").innerText = "Student"; 
                }
                
            } else {
                console.log("User is logged in, but EMAIL IS NOT VERIFIED. Kicking out.");
                window.location.href = "login.html";
            }
            
        } else {
            console.log("No user is logged in. Kicking out.");
            window.location.href = "login.html";
        }
    });

    // 4. Log out button logic for the dashboard
    const logoutBtn = document.getElementById("logout-dash-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        });
    }
});