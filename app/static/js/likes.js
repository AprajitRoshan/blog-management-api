(function () {
    function token() {
        return window.API_TOKEN || window.token || localStorage.getItem('access_token') || localStorage.getItem('token');
    }

    document.addEventListener('click', async function (event) {
        const button = event.target.closest('.post-like-btn');
        if (!button) return;

        const postId = button.dataset.postId;
        const authToken = token();
        if (!authToken) {
            alert('Please login first.');
            return;
        }

        button.disabled = true;
        try {
            const response = await fetch(`/posts/${postId}/likes`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                if ((data.detail || '').includes('already liked')) {
                    const unlike = await fetch(`/posts/${postId}/likes`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    const unlikeData = await unlike.json().catch(() => ({}));
                    if (!unlike.ok) throw new Error(unlikeData.detail || 'Unable to unlike post.');
                    button.textContent = 'Like';
                } else {
                    throw new Error(data.detail || 'Unable to like post.');
                }
            } else {
                button.textContent = 'Unlike';
            }
        } catch (error) {
            console.error('Like error:', error);
            alert(error.message || 'Unable to update like.');
        } finally {
            button.disabled = false;
        }
    });
})();
