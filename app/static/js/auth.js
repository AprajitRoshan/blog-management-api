/* =========================================================
   AUTHENTICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const signupForm =
            document.getElementById(
                "signupForm"
            );


        /* =================================================
           LOGIN FORM
        ================================================= */

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );

        }


        /* =================================================
           SIGNUP FORM
        ================================================= */

        if (signupForm) {

            signupForm.addEventListener(
                "submit",
                signupUser
            );

        }

    }
);


/* =========================================================
   SHOW AUTH MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    const messageBox =
        document.getElementById(
            "authMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.className =
        `auth-message ${type}`;

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    if (!email || !password) {

        showMessage(
            "Please enter your email and password."
        );

        return;
    }


    const formData =
        new URLSearchParams();


    formData.append(
        "username",
        email
    );


    formData.append(
        "password",
        password
    );


    try {

        const response =
            await fetch(
                "/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body: formData
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            showMessage(
                data.detail ||
                "Invalid email or password."
            );

            return;
        }


        /* =============================================
           SAVE JWT
        ============================================= */

        localStorage.setItem(
            "access_token",
            data.access_token
        );


        /* =============================================
           GO TO DASHBOARD
        ============================================= */

        window.location.href =
            "/dashboard";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            "Unable to connect to the server. Please try again."
        );

    }

}


/* =========================================================
   SIGNUP
========================================================= */

async function signupUser(event) {

    event.preventDefault();


    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const email =
        document.getElementById(
            "signupEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "signupPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            "Passwords do not match."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        {
                            username:
                                username,

                            email:
                                email,

                            password:
                                password
                        }
                    )
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            showMessage(
                data.detail ||
                "Unable to create account."
            );

            return;
        }


        showMessage(
            "Account created successfully. Redirecting to login...",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "/static/login.html";

            },
            1200
        );


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        showMessage(
            "Unable to connect to the server. Please try again."
        );

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

function loginWithGoogle() {

    window.location.href =
        "/auth/google";

}


/* =========================================================
   FACEBOOK LOGIN
========================================================= */

function loginWithFacebook() {

    window.location.href =
        "/auth/facebook";

}