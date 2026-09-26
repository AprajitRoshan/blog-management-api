/* =========================================================
   NOTIFICATIONS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeNotifications();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeNotifications() {

    const bell =
        document.getElementById(
            "notificationBell"
        );


    const dropdown =
        document.getElementById(
            "notificationDropdown"
        );


    const markAllButton =
        document.getElementById(
            "markAllReadBtn"
        );


    /* =============================================
       REQUIRED ELEMENTS
    ============================================= */

    if (!bell || !dropdown) {

        console.error(
            "Notification elements not found."
        );

        return;
    }


    /* =============================================
       BELL CLICK
    ============================================= */

    bell.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();


            dropdown.classList.toggle(
                "show"
            );


            if (
                dropdown.classList.contains(
                    "show"
                )
            ) {

                await loadNotifications();

            }

        }
    );


    /* =============================================
       CLOSE DROPDOWN
    ============================================= */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !dropdown.contains(
                    event.target
                ) &&
                !bell.contains(
                    event.target
                )
            ) {

                dropdown.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =============================================
       MARK ALL READ
    ============================================= */

    if (markAllButton) {

        markAllButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                markAllAsRead();

            }
        );

    }


    /* =============================================
       INITIAL LOAD
    ============================================= */

    loadNotifications();


    /* =============================================
       POLLING
    ============================================= */

    setInterval(
        loadNotifications,
        5000
    );

}


/* =========================================================
   AUTH HEADERS
========================================================= */

function getNotificationHeaders() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        return {};

    }


    return {

        "Authorization":
            `Bearer ${token}`

    };

}


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!list || !badge) {

        return;

    }


    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        badge.style.display =
            "none";

        return;

    }


    try {

        const response =
            await fetch(
                "/notifications",
                {
                    method: "GET",

                    headers:
                        getNotificationHeaders()
                }
            );


        /* =============================================
           UNAUTHORIZED
        ============================================= */

        if (
            response.status ===
            401
        ) {

            badge.style.display =
                "none";

            return;

        }


        if (!response.ok) {

            console.error(
                "Failed to load notifications:",
                response.status
            );

            return;

        }


        const notifications =
            await response.json();


        renderNotifications(
            Array.isArray(
                notifications
            )
                ? notifications
                : []
        );


    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

    }

}


/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications(
    notifications
) {

    const list =
        document.getElementById(
            "notificationList"
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!list || !badge) {

        return;

    }


    list.innerHTML =
        "";


    /* =============================================
       UNREAD COUNT
    ============================================= */

    const unreadCount =
        notifications.filter(
            notification =>
                !notification.is_read
        ).length;


    if (
        unreadCount >
        0
    ) {

        badge.textContent =
            unreadCount > 99
                ? "99+"
                : unreadCount;


        badge.style.display =
            "flex";

    } else {

        badge.style.display =
            "none";

    }


    /* =============================================
       EMPTY
    ============================================= */

    if (
        notifications.length ===
        0
    ) {

        list.innerHTML = `
            <div class="empty-notifications">
                No notifications
            </div>
        `;

        return;

    }


    /* =============================================
       NOTIFICATION ITEMS
    ============================================= */

    notifications.forEach(
        function (notification) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "notification-item" +
                (
                    notification.is_read
                        ? ""
                        : " unread"
                );


            const date =
                notification.created_at
                    ? new Date(
                        notification.created_at
                    )
                    : null;


            const formattedTime =
                date
                    ? date.toLocaleString()
                    : "";


            const actionButton =
                notification.is_read

                    ? `
                        <button
                            type="button"
                            class="notification-action-btn"
                            data-action="unread"
                            data-id="${notification.id}"
                        >
                            Mark as unread
                        </button>
                      `

                    : `
                        <button
                            type="button"
                            class="notification-action-btn"
                            data-action="read"
                            data-id="${notification.id}"
                        >
                            Mark as read
                        </button>
                      `;


            item.innerHTML = `

                <div class="notification-message">
                    ${escapeNotificationHtml(
                notification.message || ""
            )}
                </div>

                <div class="notification-time">
                    ${formattedTime}
                </div>

                <div class="notification-actions">
                    ${actionButton}
                </div>

            `;


            /* =====================================
               ACTION BUTTON
            ===================================== */

            const action =
                item.querySelector(
                    ".notification-action-btn"
                );


            if (action) {

                action.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const id =
                            this.dataset.id;


                        const actionType =
                            this.dataset.action;


                        if (
                            actionType ===
                            "read"
                        ) {

                            markAsRead(
                                id
                            );

                        } else {

                            markAsUnread(
                                id
                            );

                        }

                    }
                );

            }


            list.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   MARK AS READ
========================================================= */

async function markAsRead(
    notificationId
) {

    try {

        const response =
            await fetch(
                `/notifications/${notificationId}/read`,
                {
                    method: "PATCH",

                    headers:
                        getNotificationHeaders()
                }
            );


        if (
            response.ok
        ) {

            await loadNotifications();

        } else {

            console.error(
                "Unable to mark notification as read."
            );

        }


    } catch (error) {

        console.error(
            "Mark read error:",
            error
        );

    }

}


/* =========================================================
   MARK AS UNREAD
========================================================= */

async function markAsUnread(
    notificationId
) {

    try {

        const response =
            await fetch(
                `/notifications/${notificationId}/unread`,
                {
                    method: "PATCH",

                    headers:
                        getNotificationHeaders()
                }
            );


        if (
            response.ok
        ) {

            await loadNotifications();

        } else {

            console.error(
                "Unable to mark notification as unread."
            );

        }


    } catch (error) {

        console.error(
            "Mark unread error:",
            error
        );

    }

}


/* =========================================================
   MARK ALL AS READ
========================================================= */

async function markAllAsRead() {

    try {

        const response =
            await fetch(
                "/notifications/read-all",
                {
                    method: "PATCH",

                    headers:
                        getNotificationHeaders()
                }
            );


        if (
            response.ok
        ) {

            await loadNotifications();

        } else {

            console.error(
                "Unable to mark all notifications as read."
            );

        }


    } catch (error) {

        console.error(
            "Mark all read error:",
            error
        );

    }

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeNotificationHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadNotifications =
    loadNotifications;


window.markAsRead =
    markAsRead;


window.markAsUnread =
    markAsUnread;


window.markAllAsRead =
    markAllAsRead;