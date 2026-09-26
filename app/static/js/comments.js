(function () {
    function token() {
        return window.API_TOKEN || window.token || localStorage.getItem('access_token') || localStorage.getItem('token');
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    async function openComments(postId) {
        const authToken = token();
        if (!authToken) {
            alert('Please login first.');
            return;
        }

        const existing = document.querySelector(`.comments-panel[data-post-id="${postId}"]`);
        if (existing) {
            existing.remove();
            return;
        }

        const button = document.querySelector(`.post-comments-btn[data-post-id="${postId}"]`);
        const card = button?.closest('.post-card');
        if (!card) return;

        const panel = document.createElement('div');
        panel.className = 'comments-panel';
        panel.dataset.postId = postId;
        panel.innerHTML = '<div class="comments-loading">Loading comments...</div>';
        card.appendChild(panel);

        try {
            const response = await fetch(`/posts/${postId}/comments`);
            const comments = await response.json().catch(() => []);
            if (!response.ok) throw new Error(comments.detail || 'Unable to load comments.');

            panel.innerHTML = `
                <div class="comments-title">Comments</div>
                <div class="comments-list">
                    ${comments.length ? comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-author">User #${comment.user_id}</div>
                            <div class="comment-text">${escapeHtml(comment.text)}</div>
                            ${comment.created_at ? `<div class="comment-time">${new Date(comment.created_at).toLocaleString()}</div>` : ''}
                        </div>
                    `).join('') : '<div class="comments-empty">No comments yet.</div>'}
                </div>
                <form class="comment-form">
                    <textarea name="text" rows="2" placeholder="Write a comment..." required></textarea>
                    <button type="submit" class="post-action-btn">Add Comment</button>
                </form>
            `;

            panel.querySelector('.comment-form').addEventListener('submit', async function (event) {
                event.preventDefault();
                const textarea = this.querySelector('textarea');
                const text = textarea.value.trim();
                if (!text) return;

                const submit = this.querySelector('button');
                submit.disabled = true;
                try {
                    const createResponse = await fetch(`/posts/${postId}/comments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ text })
                    });
                    const data = await createResponse.json().catch(() => ({}));
                    if (!createResponse.ok) throw new Error(data.detail || 'Unable to add comment.');
                    await openComments(postId);
                    await openComments(postId);
                } catch (error) {
                    console.error('Comment error:', error);
                    alert(error.message || 'Unable to add comment.');
                } finally {
                    submit.disabled = false;
                }
            });
        } catch (error) {
            console.error('Comments error:', error);
            panel.innerHTML = `<div class="comments-error">${escapeHtml(error.message || 'Unable to load comments.')}</div>`;
        }
    }

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.post-comments-btn');
        if (!button) return;
        openComments(button.dataset.postId);
    });
})();
