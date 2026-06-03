// 1. IMPORT FIREBASE DIRECTLY FROM THE INTERNET (Vanilla JS Way)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// NEW: Import the Database
import { getFirestore, doc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";



// 2. YOUR EXACT TUTORBROS KEYS
const firebaseConfig = {
  apiKey: "AIzaSyD2y_w4xnR0mDBNpNm_3CtkADviMJb9e4Y",
  authDomain: "tutorbros.firebaseapp.com",
  projectId: "tutorbros",
  storageBucket: "tutorbros.firebasestorage.app",
  messagingSenderId: "1082771521197",
  appId: "1:1082771521197:web:bb9a1823b7e07bbc6ad024"
  // (We leave measurementId out for now to keep things fast)
};

// 3. START THE FIREBASE ENGINE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === GLOBAL MEMORY (Updates the Navbar automatically) ===
// === GLOBAL MEMORY (Updates the Navbar automatically) ===
onAuthStateChanged(auth, (user) => {
    const userMenu = document.getElementById("user-menu");
    
    // --- THE BOUNCER ---
    if (window.location.pathname.includes("contact.html")) {
        if (!user || !user.emailVerified) {
            alert("You must be logged in to book a lesson!");
            window.location.href = "login.html"; 
        }
    }
    // ------------------------

    if (userMenu) {
        if (user && user.emailVerified) {
            // LOGGED IN: Show ONLY the Dashboard button
            userMenu.innerHTML = `
                <a href="dashboard.html" class="btn-modern-auth">Dashboard</a>
            `;
            
            // Note: We removed the logout button from the navbar. 
            // Make sure your dashboard.html file still has its own Log Out button!
            
        } else {
            // LOGGED OUT: Show ONLY the Log In button
            userMenu.innerHTML = `
                <a href="login.html" class="btn-modern-auth">Log in</a>
            `;
        }
    }
});



document.addEventListener("DOMContentLoaded", () => {
    
    // === SIGN UP LOGIC ===
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const authBtn = signupForm.querySelector(".auth-btn");
            
            authBtn.innerText = "Creating Account...";

            // Firebase Magic: Create the user
            // Firebase Magic: Create the user
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // NEW: Grab the extra data from the form
                    const firstName = document.getElementById("firstName").value;
                    const lastName = document.getElementById("lastName").value;
                    const phone = document.getElementById("phone").value;

                    // NEW: Create a "file" in the database for this specific student
                    setDoc(doc(db, "users", user.uid), {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        role: "student", // Good for the future!
                        joinedDate: new Date().toISOString()
                    }).then(() => {
                        // Send the verification email after saving the profile
                        sendEmailVerification(user)
                            .then(() => {
                                alert("Success! We just sent a verification link to your email.");
                                window.location.href = "login.html"; 
                            });
                    });
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                    authBtn.innerText = "Sign Up";
                });
        });
    }

    // === LOG IN LOGIC ===
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const authBtn = loginForm.querySelector(".auth-btn");

            authBtn.innerText = "Logging in...";

            // Firebase Magic: Log them in
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // Force them to verify email first
                    if (user.emailVerified) {
                        alert("Welcome back!");
                        window.location.href = "index.html"; // Send to homepage
                    } else {
                        alert("Please check your email and verify your account before logging in!");
                        authBtn.innerText = "Log In";
                    }
                })
                .catch((error) => {
                    // This handles wrong passwords or emails that don't exist
                    alert("Incorrect email or password. Please try again.");
                    authBtn.innerText = "Log In";
                });
        });
    }



    // === FORGOT PASSWORD LOGIC ===
    const forgotForm = document.getElementById("forgot-password-form");
    if (forgotForm) {
        forgotForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("reset-email").value;
            const authBtn = forgotForm.querySelector(".auth-btn");
            const statusBox = document.getElementById("reset-status"); // Grab the new box

            authBtn.innerText = "Sending Link...";
            statusBox.style.display = "none"; // Hide it while loading

            // Firebase Magic: Send the reset email
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Show a beautiful green success message inside the page!
                    statusBox.style.display = "block";
                    statusBox.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                    statusBox.style.color = "#10b981"; // TutorBros Success Green
                    statusBox.style.border = "1px solid #10b981";
                    statusBox.innerText = "Success! Check your email inbox for the reset link.";
                    
                    authBtn.innerText = "Send Reset Link";
                    document.getElementById("reset-email").value = ""; // Clear the input
                })
                .catch((error) => {
                    // Show a red error message if they type a wrong email
                    statusBox.style.display = "block";
                    statusBox.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    statusBox.style.color = "#ef4444"; // Error Red
                    statusBox.style.border = "1px solid #ef4444";
                    statusBox.innerText = "Error: " + error.message;
                    
                    authBtn.innerText = "Send Reset Link";
                });
        });
    }


// === THE BOOKING GATE (Now with Database Saving!) ===
    const bookingForm = document.getElementById("booking-form"); 
    
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            
            const user = auth.currentUser;
            
            if (!user || !user.emailVerified) {
                alert("You must be logged in to book a lesson. Please log in or sign up first!");
                window.location.href = "login.html"; 
                return; 
            }

            // 1. Grab the button so we can show a loading state
            const submitBtn = bookingForm.querySelector("button");
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Saving Booking...";

            // 2. Grab the data
            const teacherName = document.getElementById("teacher-name").value; 
            const subject = document.getElementById("subject").value; 
            const message = document.getElementById("message").value; 

            try {
                // 1. FIREBASE MAGIC: Save to the Dashboard database
                // 1. FIREBASE MAGIC: Save to the Dashboard database
                await addDoc(collection(db, "users", user.uid, "bookings"), {
                    teacherName: teacherName,
                    subject: subject,
                    message: message,
                    status: "Email Sent", // <--- CHANGE THIS LINE
                    dateBooked: new Date().toISOString()
                });

                // 2. FORMSPREE HACK: Send the email alert quietly in the background
                // Replace this URL with your actual Formspree link!
                await fetch("https://formspree.io/f/xlgwordn", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Student_Email: user.email, // Formspree will now show their email!
                        Teacher_Requested: teacherName,
                        Subject: subject,
                        Message: message
                    })
                });

                alert("Success! Lesson booked. Sending you to your dashboard!");
                window.location.href = "dashboard.html"; 

            } catch (error) {
                console.error("Error saving booking: ", error);
                alert("Something went wrong saving your booking. Try again.");
                submitBtn.innerText = originalText;
            }
        });
    }
    


        



    

});