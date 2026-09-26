/* =========================================================
   AI CHAT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAIChat();

    }
);


/* =========================================================
   INITIALIZE AI CHAT
========================================================= */

function initializeAIChat() {

    const aiChatButton =
        document.getElementById(
            "aiChatButton"
        );


    const aiChatWindow =
        document.getElementById(
            "aiChatWindow"
        );


    const aiChatClose =
        document.getElementById(
            "aiChatClose"
        );


    const aiChatInput =
        document.getElementById(
            "aiChatInput"
        );


    const aiChatSend =
        document.getElementById(
            "aiChatSend"
        );


    const aiChatMessages =
        document.getElementById(
            "aiChatMessages"
        );


    if (
        !aiChatButton ||
        !aiChatWindow ||
        !aiChatClose ||
        !aiChatInput ||
        !aiChatSend ||
        !aiChatMessages
    ) {

        console.error(
            "AI chat elements not found."
        );

        return;

    }


    /* =============================================
       OPEN CHAT
    ============================================= */

    aiChatButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            aiChatWindow.classList.add(
                "show"
            );


            aiChatInput.focus();

        }
    );


    /* =============================================
       CLOSE CHAT
    ============================================= */

    aiChatClose.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            aiChatWindow.classList.remove(
                "show"
            );

        }
    );


    /* =============================================
       SEND BUTTON
    ============================================= */

    aiChatSend.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            sendAIMessage();

        }
    );


    /* =============================================
       ENTER KEY
    ============================================= */

    aiChatInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendAIMessage();

            }

        }
    );

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addChatMessage(
    message,
    type
) {

    const messages =
        document.getElementById(
            "aiChatMessages"
        );


    if (!messages) {
        return;
    }


    const messageElement =
        document.createElement(
            "div"
        );


    if (
        type ===
        "user"
    ) {

        messageElement.className =
            "user-message";

    } else {

        messageElement.className =
            "ai-message";

    }


    messageElement.textContent =
        message;


    messages.appendChild(
        messageElement
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   SEND AI MESSAGE
========================================================= */

async function sendAIMessage() {

    const input =
        document.getElementById(
            "aiChatInput"
        );


    const sendButton =
        document.getElementById(
            "aiChatSend"
        );


    const messages =
        document.getElementById(
            "aiChatMessages"
        );


    if (
        !input ||
        !sendButton ||
        !messages
    ) {

        return;

    }


    const message =
        input.value.trim();


    if (!message) {

        return;

    }


    /* =============================================
       USER MESSAGE
    ============================================= */

    addChatMessage(
        message,
        "user"
    );


    input.value =
        "";


    input.disabled =
        true;


    sendButton.disabled =
        true;


    /* =============================================
       TYPING INDICATOR
    ============================================= */

    const typingElement =
        document.createElement(
            "div"
        );


    typingElement.className =
        "ai-typing";


    typingElement.textContent =
        "AI is typing...";


    messages.appendChild(
        typingElement
    );


    messages.scrollTop =
        messages.scrollHeight;


    try {

        const response =
            await fetch(
                "/ai/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        {
                            message:
                                message
                        }
                    )
                }
            );


        /* =============================================
           REMOVE TYPING
        ============================================= */

        typingElement.remove();


        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            addChatMessage(
                errorData.detail ||
                "Sorry, I couldn't process your message.",
                "ai"
            );


            return;

        }


        const data =
            await response.json();


        addChatMessage(
            data.reply ||
            "I couldn't generate a response.",
            "ai"
        );


    } catch (error) {

        typingElement.remove();


        console.error(
            "AI chat error:",
            error
        );


        addChatMessage(
            "Unable to connect to the AI service.",
            "ai"
        );


    } finally {

        input.disabled =
            false;


        sendButton.disabled =
            false;


        input.focus();

    }

}


/* =========================================================
   GLOBAL FUNCTION
========================================================= */

window.sendAIMessage =
    sendAIMessage;