/* =========================================================
   POSTS MANAGEMENT
========================================================= */


/* =========================================================
   STATE
========================================================= */

let currentPostPage = 1;

const postsPerPage = 10;

let currentPostSearch = "";

let showingMyPosts = false;


/* =========================================================
   ELEMENTS
========================================================= */

const postFormCard =
    document.getElementById(
        "postFormCard"
    );

const postForm =
    document.getElementById(
        "postForm"
    );

const postFormTitle =
    document.getElementById(
        "postFormTitle"
    );

const editingPostId =
    document.getElementById(
        "editingPostId"
    );

const postTitle =
    document.getElementById(
        "postTitle"
    );

const postContent =
    document.getElementById(
        "postContent"
    );

const postImage =
    document.getElementById(
        "postImage"
    );

const savePostBtn =
    document.getElementById(
        "savePostBtn"
    );

const postsList =
    document.getElementById(
        "postsList"
    );

const postsPagination =
    document.getElementById(
        "postsPagination"
    );

const postSearch =
    document.getElementById(
        "postSearch"
    );


/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken() {

    if (
        typeof window.API_TOKEN !==
        "undefined"
    ) {
        return window.API_TOKEN;
    }


    if (
        typeof window.token !==
        "undefined"
    ) {
        return window.token;
    }


    return null;
}


function getAuthHeaders() {

    const authToken =
        getAuthToken();


    if (!authToken) {
        return {};
    }


    return {
        "Authorization":
            `Bearer ${authToken}`
    };
}


/* =========================================================
   SHOW CREATE FORM
========================================================= */

document
    .getElementById(
        "showCreatePostBtn"
    )
    .addEventListener(
        "click",
        function () {

            resetPostForm();

            postFormCard.classList.add(
                "show"
            );

            postFormTitle.textContent =
                "Create Post";

            savePostBtn.textContent =
                "Create Post";

        }
    );


/* =========================================================
   CLOSE FORM
========================================================= */

function closePostForm() {

    postFormCard.classList.remove(
        "show"
    );

    resetPostForm();
}


document
    .getElementById(
        "closePostFormBtn"
    )
    .addEventListener(
        "click",
        closePostForm
    );


document
    .getElementById(
        "cancelPostBtn"
    )
    .addEventListener(
        "click",
        closePostForm
    );


/* =========================================================
   RESET FORM
========================================================= */

function resetPostForm() {

    postForm.reset();

    editingPostId.value = "";

    postFormTitle.textContent =
        "Create Post";

    savePostBtn.textContent =
        "Create Post";
}


/* =========================================================
   CREATE / UPDATE POST
========================================================= */

postForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            postTitle.value.trim();

        const content =
            postContent.value.trim();


        if (!title) {

            alert(
                "Please enter a post title."
            );

            return;
        }


        if (!content) {

            alert(
                "Please enter post content."
            );

            return;
        }


        const formData =
            new FormData();


        formData.append(
            "title",
            title
        );


        formData.append(
            "content",
            content
        );


        const image =
            postImage.files[0];


        if (image) {

            formData.append(
                "image",
                image
            );

        }


        const postId =
            editingPostId.value;


        const url =
            postId
                ? `/posts/${postId}`
                : "/posts";


        const method =
            postId
                ? "PUT"
                : "POST";


        try {

            savePostBtn.disabled =
                true;


            savePostBtn.textContent =
                postId
                    ? "Updating..."
                    : "Creating...";


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers:
                            getAuthHeaders(),

                        body: formData
                    }
                );


            if (!response.ok) {

                const error =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                alert(
                    error.detail ||
                    "Unable to save post."
                );


                return;
            }


            await response.json();


            alert(
                postId
                    ? "Post updated successfully."
                    : "Post created successfully."
            );


            closePostForm();


            if (showingMyPosts) {

                await loadMyPosts();

            } else {

                await loadPosts(
                    currentPostPage
                );

            }


            if (
                typeof window.loadDashboard ===
                "function"
            ) {

                await window.loadDashboard();

            }


        } catch (error) {

            console.error(
                "Post save error:",
                error
            );


            alert(
                "Something went wrong while saving the post."
            );


        } finally {

            savePostBtn.disabled =
                false;


            savePostBtn.textContent =
                postId
                    ? "Update Post"
                    : "Create Post";

        }

    }
);


/* =========================================================
   LOAD ALL POSTS
========================================================= */

async function loadPosts(
    page = 1
) {

    showingMyPosts = false;

    currentPostPage = page;


    let url =
        `/posts?page=${page}&limit=${postsPerPage}`;


    if (
        currentPostSearch.trim()
    ) {

        url +=
            `&search=${encodeURIComponent(
                currentPostSearch.trim()
            )}`;

    }


    postsList.innerHTML = `
        <div class="posts-loading">
            Loading posts...
        </div>
    `;


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Failed to load posts."
            );

        }


        const data =
            await response.json();


        renderPosts(
            data.items,
            false
        );


        renderPagination(
            data.page,
            data.total_pages
        );


    } catch (error) {

        console.error(
            "Load posts error:",
            error
        );


        postsList.innerHTML = `
            <div class="posts-empty">
                Unable to load posts.
            </div>
        `;


        postsPagination.innerHTML =
            "";

    }

}


/* =========================================================
   LOAD MY POSTS
========================================================= */

async function loadMyPosts() {

    showingMyPosts = true;


    postsList.innerHTML = `
        <div class="posts-loading">
            Loading your posts...
        </div>
    `;


    try {

        const response =
            await fetch(
                "/posts/mine",
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            const error =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            alert(
                error.detail ||
                "Unable to load your posts."
            );


            return;
        }


        const posts =
            await response.json();


        renderPosts(
            posts,
            true
        );


        postsPagination.innerHTML =
            "";


    } catch (error) {

        console.error(
            "My posts error:",
            error
        );


        postsList.innerHTML = `
            <div class="posts-empty">
                Unable to load your posts.
            </div>
        `;

    }

}


/* =========================================================
   RENDER POSTS
========================================================= */

function renderPosts(
    posts,
    ownPosts = false
) {

    postsList.innerHTML =
        "";


    if (
        !posts ||
        posts.length === 0
    ) {

        postsList.innerHTML = `
            <div class="posts-empty">
                No posts found.
            </div>
        `;

        return;
    }


    posts.forEach(
        function (post) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "post-card";


            let imageHtml =
                "";


            if (post.image) {

                let imageUrl =
                    post.image;


                if (
                    imageUrl.startsWith("/")
                ) {

                    // Already an API-relative URL

                } else if (
                    !imageUrl.startsWith(
                        "http://"
                    ) &&
                    !imageUrl.startsWith(
                        "https://"
                    )
                ) {

                    imageUrl =
                        "/" +
                        imageUrl;

                }


                imageHtml = `
                    <img
                        src="${escapeHtml(
                    imageUrl
                )}"
                        class="post-image"
                        alt="${escapeHtml(
                    post.title
                )}"
                    >
                `;

            }


            const createdAt =
                post.created_at
                    ? new Date(
                        post.created_at
                    ).toLocaleString()
                    : "";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                post.title
            )}
                </h3>

                ${imageHtml}

                <div class="post-content">
                    ${escapeHtml(
                post.content
            )}
                </div>

                <div class="post-meta">

                    ${createdAt
                    ? `Created:
                               ${createdAt}`
                    : ""
                }

                    ${post.views !==
                    undefined
                    ? ` · Views:
                               ${post.views}`
                    : ""
                }

                </div>


                <div class="post-actions">

                    <button
                        type="button"
                        class="post-action-btn post-like-btn"
                        data-post-id="${post.id}"
                    >
                        Like
                    </button>

                    <button
                        type="button"
                        class="post-action-btn post-comments-btn"
                        data-post-id="${post.id}"
                    >
                        Comments
                    </button>

                    <button
                        class="post-action-btn
                               post-view-btn"
                        onclick="viewPost(
                            ${post.id}
                        )"
                    >
                        View
                    </button>


                    ${ownPosts
                    ? `

                        <button
                            class="post-action-btn
                                   post-edit-btn"
                            onclick="editPost(
                                ${post.id}
                            )"
                        >
                            Edit
                        </button>


                        <button
                            class="post-action-btn
                                   post-delete-btn"
                            onclick="deletePost(
                                ${post.id}
                            )"
                        >
                            Delete
                        </button>

                        `
                    : ""
                }

                </div>

            `;


            postsList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   VIEW SINGLE POST
========================================================= */

async function viewPost(postId) {

    try {

        const response = await fetch(
            `/posts/${postId}`
        );

        if (!response.ok) {

            const error = await response
                .json()
                .catch(() => ({}));

            alert(
                error.detail ||
                "Post not found."
            );

            return;
        }

        const post = await response.json();

        let imageHtml = "";

        if (post.image) {

            let imageUrl = post.image;

            if (
                !imageUrl.startsWith("http://") &&
                !imageUrl.startsWith("https://") &&
                !imageUrl.startsWith("/")
            ) {
                imageUrl = "/" + imageUrl;
            }

            imageHtml = `
                <div class="full-post-image-wrapper">
                    <img
                        src="${escapeHtml(imageUrl)}"
                        class="full-post-image"
                        alt="${escapeHtml(post.title)}"
                    >
                </div>
            `;
        }

        const createdAt = post.created_at
            ? new Date(post.created_at).toLocaleString()
            : "";

        postsList.classList.add("full-post-mode");

        postsList.innerHTML = `

            <article class="full-post-view">

                <div class="full-post-topbar">

                    <button
                        class="post-secondary-btn"
                        onclick="closeFullPost()"
                    >
                        ← Back to Posts
                    </button>

                </div>


                <div class="full-post-content">

                    <span class="full-post-label">
                        BLOG POST
                    </span>

                    <h1 class="full-post-title">
                        ${escapeHtml(post.title)}
                    </h1>

                    <div class="full-post-meta">

                        ${createdAt
                ? `<span>Published ${createdAt}</span>`
                : ""
            }

                        <span>
                            👁 ${post.views ?? 0} views
                        </span>

                    </div>


                    ${imageHtml}


                    <div class="full-post-text">
                        ${escapeHtml(post.content)}
                    </div>

                </div>

            </article>

        `;


        if (
            typeof window.loadDashboard ===
            "function"
        ) {
            await window.loadDashboard();
        }


        /* Scroll to the article */

        document
            .getElementById("posts")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


    } catch (error) {

        console.error(
            "View post error:",
            error
        );

        alert(
            "Unable to load post."
        );
    }
}


/* =========================================================
   CLOSE FULL POST
========================================================= */

function closeFullPost() {

    postsList.classList.remove("full-post-mode");

    if (showingMyPosts) {
        loadMyPosts();
    } else {
        loadPosts(currentPostPage);
    }
}

/* =========================================================
   EDIT POST
========================================================= */

async function editPost(
    postId
) {

    try {

        const response =
            await fetch(
                `/posts/${postId}`
            );


        if (!response.ok) {

            alert(
                "Unable to load post."
            );

            return;
        }


        const post =
            await response.json();


        editingPostId.value =
            post.id;


        postTitle.value =
            post.title;


        postContent.value =
            post.content;


        postImage.value =
            "";


        postFormTitle.textContent =
            "Edit Post";


        savePostBtn.textContent =
            "Update Post";


        postFormCard.classList.add(
            "show"
        );


        postFormCard.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit post error:",
            error
        );


        alert(
            "Unable to load post."
        );

    }

}


/* =========================================================
   DELETE POST
========================================================= */

async function deletePost(
    postId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this post?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/posts/${postId}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            const error =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            alert(
                error.detail ||
                "Unable to delete post."
            );


            return;
        }


        alert(
            "Post deleted successfully."
        );


        await loadMyPosts();


        if (
            typeof window.loadDashboard ===
            "function"
        ) {

            await window.loadDashboard();

        }


    } catch (error) {

        console.error(
            "Delete post error:",
            error
        );


        alert(
            "Something went wrong while deleting the post."
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

document
    .getElementById(
        "searchPostsBtn"
    )
    .addEventListener(
        "click",
        function () {

            currentPostSearch =
                postSearch.value.trim();


            showingMyPosts =
                false;


            loadPosts(1);

        }
    );


postSearch.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            document
                .getElementById(
                    "searchPostsBtn"
                )
                .click();

        }

    }
);


/* =========================================================
   ALL POSTS
========================================================= */

document
    .getElementById(
        "allPostsBtn"
    )
    .addEventListener(
        "click",
        function () {

            currentPostSearch =
                "";


            postSearch.value =
                "";


            loadPosts(1);

        }
    );


/* =========================================================
   MY POSTS
========================================================= */

document
    .getElementById(
        "myPostsBtn"
    )
    .addEventListener(
        "click",
        loadMyPosts
    );


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination(
    currentPage,
    totalPages
) {

    postsPagination.innerHTML =
        "";


    if (
        !totalPages ||
        totalPages <= 1
    ) {

        return;
    }


    /* Previous */

    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.textContent =
        "Previous";


    previousButton.disabled =
        currentPage <= 1;


    previousButton.onclick =
        function () {

            if (
                currentPage > 1
            ) {

                loadPosts(
                    currentPage - 1
                );

            }

        };


    postsPagination.appendChild(
        previousButton
    );


    /* Page numbers */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                loadPosts(page);

            };


        postsPagination.appendChild(
            button
        );

    }


    /* Next */

    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.textContent =
        "Next";


    nextButton.disabled =
        currentPage >= totalPages;


    nextButton.onclick =
        function () {

            if (
                currentPage <
                totalPages
            ) {

                loadPosts(
                    currentPage + 1
                );

            }

        };


    postsPagination.appendChild(
        nextButton
    );

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
    text
) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadPosts(1);