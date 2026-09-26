(function () {
    function token() {
        return window.API_TOKEN || window.token || localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    function headers() {
        const t = token();
        return t ? { Authorization: `Bearer ${t}` } : {};
    }
    function message(text, type) {
        const el = document.getElementById('subscriptionMessage');
        if (!el) return;
        el.textContent = text || '';
        el.className = `subscription-message ${type || ''}`;
    }
    async function loadPlans() {
        const container = document.getElementById('subscriptionPlans');
        if (!container) return;
        try {
            const response = await fetch('/subscriptions/plans');
            const plans = await response.json();
            if (!response.ok) throw new Error(plans.detail || 'Unable to load plans.');
            container.innerHTML = plans.map(plan => `
                <div class="subscription-card">
                    <span class="subscription-label">PLAN</span>
                    <h3>${escapeHtml(plan.name)}</h3>
                    <div class="subscription-price">₹${Number(plan.price).toFixed(2)}</div>
                    <div class="subscription-limits">
                        <div>Posts: ${plan.max_posts ?? 'Unlimited'}</div>
                        <div>Images/post: ${plan.max_images_per_post ?? 'Unlimited'}</div>
                        <div>Likes: ${plan.max_likes ?? 'Unlimited'}</div>
                        <div>Comments: ${plan.max_comments ?? 'Unlimited'}</div>
                    </div>
                    <button type="button" class="post-primary-btn subscribe-btn" data-plan="${escapeHtml(plan.name)}">Subscribe</button>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = `<div class="subscription-error">${escapeHtml(error.message)}</div>`;
        }
    }
    async function subscribe(planName) {
        if (!token()) { alert('Please login first.'); return; }
        message('Activating subscription...', 'loading');
        try {
            const response = await fetch('/subscriptions', {
                method: 'POST',
                headers: { ...headers(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_name: planName })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.detail || 'Unable to activate subscription.');
            message(`${data.message || 'Subscription activated successfully'} — ${data.plan_name}`, 'success');
            await loadBillingHistory();
        } catch (error) {
            message(error.message || 'Unable to activate subscription.', 'error');
        }
    }
    async function loadBillingHistory() {
        const container = document.getElementById('billingHistory');
        if (!container) return;
        if (!token()) { container.innerHTML = '<div class="billing-empty">Please login to view billing history.</div>'; return; }
        try {
            const response = await fetch('/subscriptions/billing-history', { headers: headers() });
            const history = await response.json().catch(() => []);
            if (!response.ok) throw new Error(history.detail || 'Unable to load billing history.');
            if (!history.length) { container.innerHTML = '<div class="billing-empty">No billing history yet.</div>'; return; }
            container.innerHTML = history.map(item => `
                <div class="billing-row">
                    <div><strong>${escapeHtml(item.plan_name)}</strong><small>${item.start_date ? new Date(item.start_date).toLocaleDateString() : ''} - ${item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}</small></div>
                    <div>₹${Number(item.price).toFixed(2)}</div>
                    <div class="billing-transaction">${escapeHtml(item.transaction_id || 'N/A')}</div>
                    ${item.invoice_path ? `<a href="${escapeHtml(item.invoice_path)}" target="_blank" rel="noopener">Invoice</a>` : ''}
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = `<div class="billing-empty">${escapeHtml(error.message)}</div>`;
        }
    }
    function escapeHtml(value) { const d = document.createElement('div'); d.textContent = value ?? ''; return d.innerHTML; }
    document.addEventListener('click', function (event) {
        const btn = event.target.closest('.subscribe-btn');
        if (btn) subscribe(btn.dataset.plan);
    });
    document.addEventListener('DOMContentLoaded', function () {
        loadPlans();
        loadBillingHistory();
        document.getElementById('refreshBillingBtn')?.addEventListener('click', loadBillingHistory);
    });
    window.loadSubscriptionPlans = loadPlans;
    window.loadBillingHistory = loadBillingHistory;
})();
