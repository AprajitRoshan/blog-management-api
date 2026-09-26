/* BlogSpace post interactions - UI bridge for Like and Comments */
(function () {
    function addInteractionButtons() {
        const list = document.getElementById("postsList");
        if (!list) return;

        list.querySelectorAll(".post-card").forEach(function (card) {
            let actions = card.querySelector(".post-actions");
            if (!actions) {
                actions = document.createElement("div");
                actions.className = "post-actions";
                card.appendChild(actions);
            }

            const viewButton = actions.querySelector(".post-view-btn");
            const postId = viewButton?.getAttribute("onclick")?.match(/viewPost\(\s*(\d+)/)?.[1]
                || card.dataset.postId;
            if (!postId) return;

            if (!actions.querySelector(".post-like-btn")) {
                const like = document.createElement("button");
                like.type = "button";
                like.className = "post-action-btn post-like-btn";
                like.dataset.postId = postId;
                like.textContent = "Like";
                actions.insertBefore(like, actions.firstChild);
            }

            if (!actions.querySelector(".post-comments-btn")) {
                const comments = document.createElement("button");
                comments.type = "button";
                comments.className = "post-action-btn post-comments-btn";
                comments.dataset.postId = postId;
                comments.textContent = "Comments";
                const like = actions.querySelector(".post-like-btn");
                like ? like.after(comments) : actions.insertBefore(comments, actions.firstChild);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        addInteractionButtons();
        const list = document.getElementById("postsList");
        if (list) {
            new MutationObserver(addInteractionButtons).observe(list, { childList: true, subtree: true });
        }
    });
})();
