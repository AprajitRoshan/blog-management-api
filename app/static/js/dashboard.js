/* =========================================================
   DASHBOARD
========================================================= */


/* =========================================================
   AUTH0 CALLBACK TOKEN
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const callbackToken =
    urlParams.get("token");


if (callbackToken) {

    localStorage.setItem(
        "access_token",
        callbackToken
    );


    window.history.replaceState(
        {},
        document.title,
        "/dashboard"
    );

}


/* =========================================================
   JWT TOKEN
========================================================= */

window.API_TOKEN =
    localStorage.getItem(
        "access_token"
    );


window.token =
    window.API_TOKEN;


/* =========================================================
   CHECK LOGIN
========================================================= */

if (!window.API_TOKEN) {

    window.location.href =
        "/static/login.html";

}


/* =========================================================
   CHART VARIABLES
========================================================= */

let postChart =
    null;


let activityChart =
    null;


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    if (!window.API_TOKEN) {

        window.location.href =
            "/static/login.html";

        return;
    }


    try {

        const response =
            await fetch(
                "/user/dashboard",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${window.API_TOKEN}`
                    }
                }
            );


        /* =============================================
           TOKEN INVALID / EXPIRED
        ============================================= */

        if (
            response.status ===
            401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            window.API_TOKEN =
                null;

            window.token =
                null;


            window.location.href =
                "/static/login.html";

            return;
        }


        if (!response.ok) {

            console.error(
                "Dashboard request failed:",
                response.status
            );

            return;
        }


        const data =
            await response.json();


        /* =================================================
           STATISTICS
        ================================================= */

        const totalPosts =
            document.getElementById(
                "totalPosts"
            );


        const totalComments =
            document.getElementById(
                "totalComments"
            );


        const totalLikes =
            document.getElementById(
                "totalLikes"
            );


        const totalViews =
            document.getElementById(
                "totalViews"
            );


        if (totalPosts) {

            totalPosts.textContent =
                data.total_posts ?? 0;

        }


        if (totalComments) {

            totalComments.textContent =
                data.total_comments ?? 0;

        }


        if (totalLikes) {

            totalLikes.textContent =
                data.total_likes_received ?? 0;

        }


        if (totalViews) {

            totalViews.textContent =
                data.total_post_views ?? 0;

        }


        /* =================================================
           POSTS DATA
        ================================================= */

        const posts =
            Array.isArray(data.posts)
                ? data.posts
                : [];


        /* =================================================
           LIKES / COMMENTS CHART
        ================================================= */

        const postLabels =
            posts.map(
                post =>
                    post.title
            );


        const likes =
            posts.map(
                post =>
                    post.likes
            );


        const comments =
            posts.map(
                post =>
                    post.comments
            );


        const postCanvas =
            document.getElementById(
                "postChart"
            );


        if (postChart) {

            postChart.destroy();

            postChart =
                null;

        }


        if (
            postCanvas &&
            typeof Chart !==
            "undefined"
        ) {

            postChart =
                new Chart(
                    postCanvas,
                    {
                        type: "bar",

                        data: {

                            labels:
                                postLabels,

                            datasets: [

                                {
                                    label:
                                        "Likes",

                                    data:
                                        likes
                                },

                                {
                                    label:
                                        "Comments",

                                    data:
                                        comments
                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    position:
                                        "top"

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        stepSize:
                                            1

                                    }

                                }

                            }

                        }

                    }
                );

        }


        /* =================================================
           POST ACTIVITY CHART
        ================================================= */

        const activity =
            Array.isArray(
                data.activity
            )
                ? data.activity
                : [];


        const activityLabels =
            activity.map(
                item =>
                    item.date
            );


        const activityPosts =
            activity.map(
                item =>
                    item.posts
            );


        const activityCanvas =
            document.getElementById(
                "activityChart"
            );


        if (activityChart) {

            activityChart.destroy();

            activityChart =
                null;

        }


        if (
            activityCanvas &&
            typeof Chart !==
            "undefined"
        ) {

            activityChart =
                new Chart(
                    activityCanvas,
                    {
                        type: "line",

                        data: {

                            labels:
                                activityLabels,

                            datasets: [

                                {
                                    label:
                                        "Posts Created",

                                    data:
                                        activityPosts,

                                    fill:
                                        false,

                                    tension:
                                        0.3

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    position:
                                        "top"

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        stepSize:
                                            1

                                    }

                                }

                            }

                        }

                    }
                );

        }


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        "access_token"
    );


    window.API_TOKEN =
        null;


    window.token =
        null;


    window.location.href =
        "/static/login.html";

}


/* =========================================================
   LOGOUT BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "dashboardLogoutBtn"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }

    }
);


/* =========================================================
   INITIAL LOAD
========================================================= */

loadDashboard();


/* =========================================================
   MAKE AVAILABLE TO OTHER JS FILES
========================================================= */

window.loadDashboard =
    loadDashboard;


window.logoutUser =
    logoutUser;