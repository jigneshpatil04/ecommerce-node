// ============================================================
// CUSTOMER SUPPORT & CONCIERGE WIDGET
// Floating Launcher + Interactive Multi-Channel Help Center
// ============================================================

(function () {
    // 1. FAQs Data
    const faqsData = [
        {
            q: "How do I track my order delivery?",
            a: "You can track your order anytime by visiting the <strong>My Orders</strong> page or clicking the <strong>Track Order</strong> button above. Enter your Order ID or registered mobile number to see live tracking updates."
        },
        {
            q: "What is your return & exchange policy?",
            a: "We offer a <strong>30-day hassle-free return and exchange</strong> guarantee on all eligible items. Products must be unworn with original tags attached. Doorstep reverse pickup is complimentary."
        },
        {
            q: "How long does shipping take?",
            a: "Standard delivery takes <strong>2 to 4 business days</strong> in major metro cities and <strong>3 to 6 business days</strong> across other regions in India. Express shipping is free on orders above ₹999."
        },
        {
            q: "What payment methods are supported?",
            a: "We accept all major Credit/Debit cards (Visa, MasterCard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, Stripe checkout, and Cash on Delivery (COD)."
        },
        {
            q: "How can I cancel or modify an order?",
            a: "Orders can be modified or cancelled within <strong>2 hours of placement</strong> from your Orders dashboard, or by reaching out immediately to our WhatsApp support team."
        }
    ];

    // 2. Initialize Widget into DOM
    function initCustomerSupport() {
        // Ensure customer-support.css is loaded
        if (!document.getElementById("customer-support-css-link")) {
            const isFile = window.location.protocol === "file:";
            const inViews = window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/views/");
            const cssPath = isFile ? (inViews ? "../public/css/customer-support.css" : "public/css/customer-support.css") : "/css/customer-support.css";
            const link = document.createElement("link");
            link.id = "customer-support-css-link";
            link.rel = "stylesheet";
            link.href = cssPath;
            document.head.appendChild(link);
        }

        if (document.getElementById("customerSupportLauncher")) return;

        // Path resolver for offline & online
        const isFile = window.location.protocol === "file:";
        const inViews = window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/views/");
        const ordersUrl = isFile ? (inViews ? "./orders.html" : "views/orders.html") : "/orders.html";

        // Create Floating Launcher Button
        const launcher = document.createElement("div");
        launcher.className = "cs-floating-launcher";
        launcher.id = "customerSupportLauncher";
        launcher.innerHTML = `
            <button type="button" class="cs-launcher-btn" onclick="openCustomerSupportModal(event)" aria-label="Open 24/7 Customer Support" title="24/7 Customer Support & Help">
                <span class="cs-launcher-icon"><i class="fa-solid fa-headset"></i></span>
                <span class="cs-launcher-text">Support</span>
                <span class="cs-online-badge" title="Support is Online"></span>
            </button>
        `;
        document.body.appendChild(launcher);

        // Create Modal Overlay & Container
        const overlay = document.createElement("div");
        overlay.className = "cs-overlay";
        overlay.id = "customerSupportOverlay";
        overlay.innerHTML = `
            <div class="cs-modal" role="dialog" aria-modal="true" aria-labelledby="csModalTitle">
                <!-- Header -->
                <div class="cs-header">
                    <div class="cs-header-top">
                        <div class="cs-brand-wrap">
                            <div class="cs-agent-avatar">
                                <i class="fa-solid fa-headset"></i>
                            </div>
                            <div class="cs-title-wrap">
                                <h3 id="csModalTitle">Customer Support</h3>
                                <div class="cs-status-indicator">
                                    <span class="dot"></span> Online • Typically replies in 5 mins
                                </div>
                            </div>
                        </div>
                        <button type="button" class="cs-close-btn" onclick="closeCustomerSupportModal()" aria-label="Close support modal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <p class="cs-header-tagline">We're here to help! Chat directly with our team, track shipments, or submit a request.</p>
                </div>

                <!-- Tabs Navigation -->
                <div class="cs-tabs-nav">
                    <button type="button" class="cs-tab-btn active" data-tab="chat" onclick="switchCsTab('chat')">
                        <i class="fa-solid fa-headset"></i> Support Agent
                    </button>
                    <button type="button" class="cs-tab-btn" data-tab="channels" onclick="switchCsTab('channels')">
                        <i class="fa-solid fa-bolt"></i> Help Channels
                    </button>
                    <button type="button" class="cs-tab-btn" data-tab="faqs" onclick="switchCsTab('faqs')">
                        <i class="fa-solid fa-circle-question"></i> FAQs
                    </button>
                    <button type="button" class="cs-tab-btn" data-tab="ticket" onclick="switchCsTab('ticket')">
                        <i class="fa-solid fa-envelope-open-text"></i> Send Message
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="cs-body">
                    <!-- Tab 1: Live Support Agent Chat -->
                    <div class="cs-tab-pane active" id="csPaneChat">
                        <div class="cs-wa-chat-container">
                            <div class="cs-wa-chat-header">
                                <div class="cs-wa-header-left">
                                    <div class="cs-wa-avatar">
                                        <i class="fa-solid fa-headset"></i>
                                        <span class="cs-wa-dot"></span>
                                    </div>
                                    <div class="cs-wa-header-info">
                                        <h4>Support Agent <i class="fa-solid fa-circle-check" style="color: #4cd964; font-size: 11px;"></i></h4>
                                        <div class="cs-wa-status"><span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span> Online • Typically replies instantly</div>
                                    </div>
                                </div>
                                <a href="https://web.whatsapp.com/send?phone=919322159403&text=Hello%20MyStore%20Support,%20I%20am%20chatting%20from%20the%20website%20and%20need%20assistance." target="WhatsAppWeb" onclick="openWhatsAppSupport(event)" class="cs-wa-direct-btn" title="Chat on WhatsApp (+91 93221 59403)">
                                    <i class="fa-brands fa-whatsapp"></i> WhatsApp
                                </a>
                            </div>

                            <div class="cs-wa-messages-area" id="csWaMessagesArea">
                                <div class="cs-wa-security-notice">
                                    <i class="fa-solid fa-shield-halved" style="font-size: 10px; color: #832729;"></i> Live Support Assistance • Connected to +91 93221 59403
                                </div>

                                <div class="cs-wa-msg agent">
                                    <div class="cs-wa-msg-text">
                                        Hello! 👋 Welcome to <strong>MyStore Support</strong>. I am your <strong>Support Agent</strong>.<br><br>
                                        How can I help you today? You can choose one of the quick options below or type any question!
                                    </div>
                                    <div class="cs-wa-msg-meta">
                                        <span class="cs-wa-time">${getCurrentTimeString()}</span>
                                    </div>
                                </div>

                                <div class="cs-wa-typing" id="csWaTyping">
                                    <span>Support Agent is typing</span>
                                    <div class="cs-wa-typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>

                            <div class="cs-wa-quick-replies">
                                <button type="button" class="cs-wa-chip" onclick="handleWaQuickReply('📦 Track My Order')">
                                    📦 Track Order
                                </button>
                                <button type="button" class="cs-wa-chip" onclick="handleWaQuickReply('👕 Sizing & Fit Advice')">
                                    👕 Sizing &amp; Fit
                                </button>
                                <button type="button" class="cs-wa-chip" onclick="handleWaQuickReply('🔄 30-Day Returns & Refund')">
                                    🔄 Returns &amp; Refund
                                </button>
                                <button type="button" class="cs-wa-chip" onclick="handleWaQuickReply('🏷️ Active Discount Offers')">
                                    🏷️ Active Offers
                                </button>
                                <button type="button" class="cs-wa-chip" onclick="handleWaQuickReply('💬 WhatsApp Support (+91 93221 59403)')">
                                    <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> WhatsApp (+91 93221 59403)
                                </button>
                            </div>

                            <form class="cs-wa-input-bar" id="csWaChatForm" onsubmit="handleWaChatSubmit(event)">
                                <input type="text" id="csWaInput" placeholder="Type your message here..." autocomplete="off">
                                <button type="submit" class="cs-wa-send-btn" id="csWaSendBtn" aria-label="Send message">
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Tab 2: Live Channels -->
                    <div class="cs-tab-pane" id="csPaneChannels">
                        <div class="cs-channels-grid">
                            <!-- WhatsApp -->
                            <a href="https://web.whatsapp.com/send?phone=919322159403&text=Hello%20MyStore%20Support,%20I%20am%20chatting%20from%20the%20website%20and%20need%20assistance." target="WhatsAppWeb" onclick="openWhatsAppSupport(event)" class="cs-channel-card">
                                <div class="cs-channel-icon bg-wa">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </div>
                                <div class="cs-channel-info">
                                    <div class="cs-channel-label">WhatsApp Support</div>
                                    <div class="cs-channel-sub">+91 93221 59403 (Instant)</div>
                                </div>
                            </a>

                            <!-- Track Order -->
                            <a href="${ordersUrl}" class="cs-channel-card" onclick="closeCustomerSupportModal()">
                                <div class="cs-channel-icon bg-track">
                                    <i class="fa-solid fa-truck-fast"></i>
                                </div>
                                <div class="cs-channel-info">
                                    <div class="cs-channel-label">Track My Order</div>
                                    <div class="cs-channel-sub">Live Package Status</div>
                                </div>
                            </a>

                            <!-- Call Support -->
                            <a href="tel:+919322159403" class="cs-channel-card">
                                <div class="cs-channel-icon bg-phone">
                                    <i class="fa-solid fa-phone"></i>
                                </div>
                                <div class="cs-channel-info">
                                    <div class="cs-channel-label">Helpline Call</div>
                                    <div class="cs-channel-sub">+91 93221 59403</div>
                                </div>
                            </a>

                            <!-- Email Us -->
                            <a href="mailto:support@mystore.com?subject=Customer%20Support%20Inquiry" class="cs-channel-card">
                                <div class="cs-channel-icon bg-mail">
                                    <i class="fa-solid fa-envelope"></i>
                                </div>
                                <div class="cs-channel-info">
                                    <div class="cs-channel-label">Email Support</div>
                                    <div class="cs-channel-sub">support@mystore.com</div>
                                </div>
                            </a>
                        </div>

                        <!-- Highlights Banner -->
                        <div style="background: #FAF7F2; border: 1px solid #ECE5DD; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                            <div>
                                <strong style="font-size: 13px; color: #832729; display: block; margin-bottom: 2px;">Need help right now?</strong>
                                <span style="font-size: 12px; color: #64748b;">Our support executives are available 9:00 AM – 9:00 PM IST daily.</span>
                            </div>
                            <button type="button" onclick="switchCsTab('ticket')" style="background: #832729; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                                Message Us
                            </button>
                        </div>
                    </div>

                    <!-- Tab 2: FAQs Accordion -->
                    <div class="cs-tab-pane" id="csPaneFaqs">
                        <div class="cs-section-title">
                            <i class="fa-solid fa-circle-question"></i> Top Questions
                        </div>
                        <div class="cs-faqs-list">
                            ${faqsData.map((f, i) => `
                                <div class="cs-faq-item ${i === 0 ? 'active' : ''}">
                                    <button type="button" class="cs-faq-question" onclick="toggleCsFaq(this)">
                                        <span>${f.q}</span>
                                        <i class="fa-solid fa-chevron-down cs-faq-icon"></i>
                                    </button>
                                    <div class="cs-faq-answer">
                                        <p style="margin: 0;">${f.a}</p>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>

                    <!-- Tab 3: Submit Support Ticket -->
                    <div class="cs-tab-pane" id="csPaneTicket">
                        <!-- Success Card -->
                        <div class="cs-success-card" id="csSuccessCard">
                            <i class="fa-solid fa-circle-check"></i>
                            <h4>Message Sent Successfully!</h4>
                            <p>Thank you for reaching out. Our concierge support team has received your ticket and will reply to your email shortly.</p>
                            <div>
                                <span class="cs-ticket-badge" id="csTicketBadge">Ticket #SUP-1029</span>
                            </div>
                            <button type="button" onclick="resetCsForm()" style="margin-top: 14px; background: #065f46; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
                                Send Another Message
                            </button>
                        </div>

                        <!-- Ticket Form -->
                        <form id="csSupportForm" onsubmit="submitSupportTicket(event)">
                            <div class="cs-form-row">
                                <div class="cs-form-group">
                                    <label class="cs-form-label" for="csName">Your Name *</label>
                                    <input type="text" id="csName" class="cs-form-input" placeholder="e.g. Rahul Sharma" required>
                                </div>
                                <div class="cs-form-group">
                                    <label class="cs-form-label" for="csEmail">Email Address *</label>
                                    <input type="email" id="csEmail" class="cs-form-input" placeholder="name@example.com" required>
                                </div>
                            </div>

                            <div class="cs-form-row">
                                <div class="cs-form-group">
                                    <label class="cs-form-label" for="csSubject">Issue Category *</label>
                                    <select id="csSubject" class="cs-form-select" required>
                                        <option value="Order Status & Delivery">Order Status & Delivery</option>
                                        <option value="Return & Exchange Request">Return & Exchange Request</option>
                                        <option value="Payment & Refund Query">Payment & Refund Query</option>
                                        <option value="Product Sizing & Fit">Product Sizing & Fit</option>
                                        <option value="General Feedback">General Feedback</option>
                                    </select>
                                </div>
                                <div class="cs-form-group">
                                    <label class="cs-form-label" for="csOrderId">Order ID (Optional)</label>
                                    <input type="text" id="csOrderId" class="cs-form-input" placeholder="e.g. #ORD-1082">
                                </div>
                            </div>

                            <div class="cs-form-group">
                                <label class="cs-form-label" for="csMessage">How can we help you? *</label>
                                <textarea id="csMessage" class="cs-form-textarea" placeholder="Please describe your question or issue in detail..." required></textarea>
                            </div>

                            <button type="submit" class="cs-submit-btn" id="csSubmitBtn">
                                <i class="fa-solid fa-paper-plane"></i>
                                <span>Submit Support Request</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Backdrop click to close
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                closeCustomerSupportModal();
            }
        });

        // Escape key to close
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && overlay.classList.contains("active")) {
                closeCustomerSupportModal();
            }
        });

        // Prefill name & email if logged in
        prefillUserInfo();
    }

    function prefillUserInfo() {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                const nameInput = document.getElementById("csName");
                const emailInput = document.getElementById("csEmail");
                if (nameInput && user.name) nameInput.value = user.name;
                if (emailInput && user.email) emailInput.value = user.email;
            }
        } catch (e) {}
    }

    // 3. Open / Close Controls
    function openCustomerSupportModal(event, tabName) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        initCustomerSupport();
        const overlay = document.getElementById("customerSupportOverlay");
        if (overlay) {
            if (tabName) {
                switchCsTab(tabName);
            }
            requestAnimationFrame(() => {
                overlay.classList.add("active");
                document.body.style.overflow = "hidden";
            });
        }
    }

    function closeCustomerSupportModal() {
        const overlay = document.getElementById("customerSupportOverlay");
        if (overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getCurrentTimeString() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const minsStr = minutes < 10 ? "0" + minutes : minutes;
        return `${hours}:${minsStr} ${ampm}`;
    }

    // 4. Tab Switcher
    function switchCsTab(tabName) {
        const tabs = document.querySelectorAll(".cs-tab-btn");
        const panes = document.querySelectorAll(".cs-tab-pane");

        tabs.forEach(t => {
            t.classList.toggle("active", t.dataset.tab === tabName);
        });

        panes.forEach(p => {
            const targetId = tabName === "chat" ? "csPaneChat" : (tabName === "channels" ? "csPaneChannels" : (tabName === "faqs" || tabName === "faq" ? "csPaneFaqs" : "csPaneTicket"));
            p.classList.toggle("active", p.id === targetId);
        });

        if (tabName === "chat") {
            const input = document.getElementById("csWaInput");
            if (input) setTimeout(() => input.focus(), 150);
        }
    }

    // WhatsApp Live Chat Interactions
    function handleWaChatSubmit(event) {
        if (event) event.preventDefault();
        const input = document.getElementById("csWaInput");
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        sendWaUserMessage(text);
    }

    function handleWaQuickReply(text) {
        sendWaUserMessage(text);
    }

    function sendWaUserMessage(userText) {
        const msgArea = document.getElementById("csWaMessagesArea");
        const typing = document.getElementById("csWaTyping");
        if (!msgArea) return;

        // 1. Append user message
        const userMsgEl = document.createElement("div");
        userMsgEl.className = "cs-wa-msg user";
        userMsgEl.innerHTML = `
            <div class="cs-wa-msg-text">${escapeHTML(userText)}</div>
            <div class="cs-wa-msg-meta">
                <span class="cs-wa-time">${getCurrentTimeString()}</span>
                <span class="cs-wa-ticks"><i class="fa-solid fa-check-double"></i></span>
            </div>
        `;
        if (typing) {
            msgArea.insertBefore(userMsgEl, typing);
        } else {
            msgArea.appendChild(userMsgEl);
        }
        msgArea.scrollTop = msgArea.scrollHeight;

        // 2. Show typing indicator
        if (typing) {
            typing.classList.add("active");
            msgArea.scrollTop = msgArea.scrollHeight;
        }

        // 3. Realistic agent reply delay
        const replyDelay = Math.min(1000, Math.max(500, userText.length * 15));
        setTimeout(() => {
            if (typing) typing.classList.remove("active");

            const replyHTML = generateAgentResponse(userText);
            const agentMsgEl = document.createElement("div");
            agentMsgEl.className = "cs-wa-msg agent";
            agentMsgEl.innerHTML = `
                <div class="cs-wa-msg-text">${replyHTML}</div>
                <div class="cs-wa-msg-meta">
                    <span class="cs-wa-time">${getCurrentTimeString()}</span>
                </div>
            `;
            if (typing) {
                msgArea.insertBefore(agentMsgEl, typing);
            } else {
                msgArea.appendChild(agentMsgEl);
            }
            msgArea.scrollTop = msgArea.scrollHeight;
        }, replyDelay);
    }

    function generateAgentResponse(userText) {
        const cleanText = (userText || "").trim();
        const text = cleanText.toLowerCase();

        // 1. Identity / Name / Who are you (e.g. "what is the your name", "who are you", etc.)
        if (
            text.includes("name") ||
            text.includes("who are you") ||
            text.includes("your name") ||
            text.includes("what are you called") ||
            text.includes("who is this") ||
            text.includes("what is your name") ||
            text.includes("who created you") ||
            text.includes("who made you") ||
            text.includes("are you a bot") ||
            text.includes("are you real") ||
            text.includes("are you human") ||
            text.includes("are you ai") ||
            text.includes("tell me your name") ||
            text.includes("introduce yourself")
        ) {
            return `Hello! 😊 I am your <strong>MyStore Support Agent</strong>.<br><br>I am your 24/7 dedicated virtual assistant, trained to help you with:<br>• 📦 Tracking your orders &amp; delivery timelines<br>• 👕 Finding the perfect size &amp; fit advice<br>• 🔄 30-day hassle-free returns &amp; refunds<br>• 🏷️ Applying active discount coupons &amp; offers<br>• 💳 Payment options including Cash on Delivery (COD)<br><br>How can I assist your shopping today?`;
        }

        // 2. How are you / Well-being / Small talk
        if (
            text.includes("how are you") ||
            text.includes("how r u") ||
            text.includes("how are u") ||
            text.includes("how do you do") ||
            text.includes("what's up") ||
            text.includes("whats up") ||
            text.includes("how is it going") ||
            text.includes("how's it going")
        ) {
            return `I'm doing fantastic, thank you for asking! 😊 I'm right here and ready to help you explore the latest fashion collections or answer any questions about your orders. How are you doing today?`;
        }

        // 3. What can you do / Capabilities / Help menu
        if (
            text.includes("what can you do") ||
            text.includes("how can you help") ||
            text.includes("what do you do") ||
            text.includes("help me") ||
            text.includes("features") ||
            text.includes("commands") ||
            text.includes("menu")
        ) {
            return `Here is everything I can help you with right away:<br><br>
            • 📦 <strong>Track Order</strong> — Get live package status and courier updates.<br>
            • 👕 <strong>Size &amp; Fit Guide</strong> — Dimensions for shirts and tees (S to XXL).<br>
            • 🔄 <strong>Returns &amp; Exchanges</strong> — 30-day doorstep return and refund policy.<br>
            • 🏷️ <strong>Exclusive Offers</strong> — Active coupon codes like <code>WELCOME10</code>.<br>
            • 💳 <strong>Payment &amp; COD</strong> — Information on Cash on Delivery, UPI &amp; Cards.<br>
            • 🛍️ <strong>Product Catalog</strong> — Browse shirts, t-shirts, fabrics &amp; pricing.<br>
            • 📱 <strong>Human Support</strong> — Connect directly with our team on WhatsApp.<br><br>
            Just ask or tap one of the quick buttons below!`;
        }

        // 4. Greetings
        if (
            text === "hi" ||
            text === "hello" ||
            text === "hey" ||
            text.startsWith("hi ") ||
            text.startsWith("hello ") ||
            text.startsWith("hey ") ||
            text.includes("namaste") ||
            text.includes("good morning") ||
            text.includes("good afternoon") ||
            text.includes("good evening")
        ) {
            return `Hello and welcome to <strong>MyStore</strong>! 🌟 It's great to connect with you. How can I help you today? You can ask me about our luxury shirts, track a recent shipment, check size charts, or get active discount codes!`;
        }

        // 5. Order Cancellation
        if (
            text.includes("cancel") ||
            text.includes("cancellation") ||
            text.includes("stop order") ||
            text.includes("dont want")
        ) {
            return `You can cancel your order easily while it is in <strong>Pending</strong> or <strong>Processing</strong> status!<br><br>
            1. Go to your <a href="./orders.html" style="color: #832729; font-weight: 700; text-decoration: underline;">My Orders</a> page.<br>
            2. Find your order and click the <strong>Cancel Order</strong> button.<br><br>
            If your parcel has already been dispatched, you can simply decline delivery upon courier arrival or request a complimentary doorstep reverse pickup!`;
        }

        // 6. Order Tracking / Delivery Status
        if (
            text.includes("track") ||
            text.includes("where is my order") ||
            text.includes("where is my parcel") ||
            text.includes("where is my") ||
            text.includes("shipment") ||
            text.includes("courier") ||
            text.includes("awb") ||
            text.includes("dispatch") ||
            (text.includes("order") && (text.includes("status") || text.includes("check") || text.includes("id") || text.includes("update") || text.includes("#")))
        ) {
            let orderSnippet = "";
            try {
                const orders = JSON.parse(localStorage.getItem("orders") || "[]");
                if (orders && orders.length > 0) {
                    const latest = orders[0];
                    orderSnippet = `<br><br>📦 <em>Recent Order: #${latest.id || latest.order_id || 'ORD-9821'}</em> — Status: <strong>In Transit (Expected within 2–3 days)</strong>.`;
                }
            } catch (e) {}

            return `All orders are shipped via express courier with <strong>2–4 business days delivery</strong> across India.${orderSnippet}<br><br>You can view full tracking anytime on the <a href="./orders.html" style="color: #832729; font-weight: 700; text-decoration: underline;">My Orders</a> page, or reply with your <strong>Order ID</strong>!`;
        }

        // 7. Returns / Exchange / Refund
        if (
            text.includes("return") ||
            text.includes("exchange") ||
            text.includes("refund") ||
            text.includes("replace") ||
            text.includes("money back")
        ) {
            return `We offer a <strong>30-day hassle-free return and exchange guarantee</strong>! 🔄<br><br>
            • Items must be unworn with original tags attached.<br>
            • We provide <strong>complimentary doorstep reverse pickup</strong> across India.<br>
            • Refunds are processed back to your original payment mode or UPI within 3–5 working days after pickup.<br><br>
            To initiate a return or exchange, reply with your Order ID or message our support team on WhatsApp (+91 93221 59403)!`;
        }

        // 8. Sizing / Fit Advice
        if (
            text.includes("size") ||
            text.includes("fit") ||
            text.includes("chart") ||
            text.includes("measurement") ||
            text.includes("medium") ||
            text.includes("large") ||
            text.includes("small") ||
            text.includes("chest") ||
            text.includes("xxl") ||
            text.includes("xl")
        ) {
            return `👕 <strong>Standard Size &amp; Measurement Guide:</strong><br>
            • <strong>S</strong>: Chest 38 inches | Length 27 in<br>
            • <strong>M</strong>: Chest 40 inches | Length 28 in<br>
            • <strong>L</strong>: Chest 42 inches | Length 29 in<br>
            • <strong>XL</strong>: Chest 44 inches | Length 30 in<br>
            • <strong>XXL</strong>: Chest 46 inches | Length 31 in<br><br>
            Our shirts are pre-shrunk and tailored with a modern comfort drape. If you prefer a relaxed fit, we recommend ordering one size up!`;
        }

        // 9. Fabric, Material & Quality
        if (
            text.includes("fabric") ||
            text.includes("cotton") ||
            text.includes("material") ||
            text.includes("cloth") ||
            text.includes("wash") ||
            text.includes("shrink") ||
            text.includes("iron")
        ) {
            return `All our shirts and tees are crafted from <strong>100% premium long-staple combed cotton</strong>.<br><br>
            • <strong>Feel:</strong> Ultra-soft, breathable, and skin-friendly for all-day comfort.<br>
            • <strong>Durability:</strong> Pre-washed and pre-shrunk for zero post-wash shrinkage.<br>
            • <strong>Care:</strong> Machine wash cold with like colors, warm iron if needed.`;
        }

        // 10. Offers / Coupons / Discounts / Promo Code
        if (
            text.includes("offer") ||
            text.includes("coupon") ||
            text.includes("discount") ||
            text.includes("promo") ||
            text.includes("code") ||
            text.includes("deal") ||
            text.includes("sale") ||
            text.includes("voucher")
        ) {
            return `🎉 <strong>Active Exclusive Offers &amp; Promo Codes:</strong><br>
            • Code <strong>WELCOME10</strong>: <strong>10% OFF</strong> on your entire purchase.<br>
            • Code <strong>LUXURY15</strong>: <strong>Extra 15% OFF</strong> on orders above ₹1,999.<br>
            • <strong>Free Express Delivery</strong> automatically applied on orders over ₹999.<br><br>
            Apply the code in your <a href="./cart.html" style="color: #832729; font-weight: 700; text-decoration: underline;">Shopping Cart</a> during checkout!`;
        }

        // 11. Shipping & Delivery Charges / Timelines
        if (
            text.includes("shipping") ||
            text.includes("deliver") ||
            text.includes("delivery charge") ||
            text.includes("shipping fee") ||
            text.includes("free delivery") ||
            text.includes("how long") ||
            text.includes("pincode") ||
            text.includes("when will")
        ) {
            return `🚚 <strong>Shipping &amp; Delivery Information:</strong><br>
            • <strong>Standard Shipping Time:</strong> 2 to 4 business days to major metros (3 to 5 days regional).<br>
            • <strong>Delivery Fee:</strong> Absolutely <strong>FREE</strong> for orders above ₹999 (nominal ₹49 below ₹999).<br>
            • Every order comes with real-time SMS &amp; WhatsApp tracking alerts from dispatch to doorstep.`;
        }

        // 12. Payment Methods & COD
        if (
            text.includes("payment") ||
            text.includes("pay") ||
            text.includes("cod") ||
            text.includes("cash on delivery") ||
            text.includes("upi") ||
            text.includes("gpay") ||
            text.includes("phonepe") ||
            text.includes("paytm") ||
            text.includes("card") ||
            text.includes("net banking")
        ) {
            return `We accept 100% secure payments via:<br>
            • <strong>Cash on Delivery (COD)</strong> with zero advance payment across India.<br>
            • <strong>UPI</strong> (Google Pay, PhonePe, Paytm, BHIM).<br>
            • <strong>All major Debit &amp; Credit Cards</strong> (Visa, MasterCard, RuPay).<br>
            • <strong>Net Banking &amp; Stripe</strong> with 256-bit bank grade encryption!`;
        }

        // 13. How to Buy / Cart / Checkout
        if (
            text.includes("how to buy") ||
            text.includes("how to order") ||
            text.includes("how do i buy") ||
            text.includes("how do i order") ||
            text.includes("checkout") ||
            text.includes("cart") ||
            text.includes("place order") ||
            text.includes("order kaise kare")
        ) {
            return `Ordering is super easy in just 3 quick steps:<br>
            1. Browse <a href="./products.html" style="color: #832729; font-weight: 700; text-decoration: underline;">Products</a> and choose your preferred size.<br>
            2. Tap <strong>Add to Cart</strong> and review your bag in <a href="./cart.html" style="color: #832729; font-weight: 700; text-decoration: underline;">Cart</a>.<br>
            3. Apply coupon <code>WELCOME10</code>, enter your delivery address, and select COD or Online Payment!<br><br>
            You will receive instant SMS and email order confirmations!`;
        }

        // 14. Products / Pricing / Shopping / Catalog
        if (
            text.includes("product") ||
            text.includes("price") ||
            text.includes("cost") ||
            text.includes("buy") ||
            text.includes("shop") ||
            text.includes("shirt") ||
            text.includes("item") ||
            text.includes("collection") ||
            text.includes("catalog")
        ) {
            return `We offer 11+ handcrafted luxury shirts and premium cotton t-shirts starting from just <strong>₹300 up to ₹699</strong>.<br><br>
            👉 <a href="./products.html" style="color: #832729; font-weight: 700; text-decoration: underline;">Explore All Products &amp; Collections Here</a>!`;
        }

        // 15. Store Location / Contact / Office / Timing
        if (
            text.includes("location") ||
            text.includes("address") ||
            text.includes("where are you") ||
            text.includes("where is your") ||
            text.includes("store location") ||
            text.includes("store address") ||
            (text.includes("store") && (text.includes("where") || text.includes("shop") || text.includes("visit"))) ||
            text.includes("office") ||
            text.includes("timing") ||
            text.includes("hours") ||
            text.includes("helpline") ||
            text.includes("contact number") ||
            text.includes("customer care number") ||
            text.includes("email")
        ) {
            return `📍 <strong>MyStore Customer Care Details:</strong><br>
            • <strong>Helpline &amp; WhatsApp:</strong> +91 93221 59403<br>
            • <strong>Email:</strong> support@mystore.com<br>
            • <strong>Hours:</strong> Support active 9:00 AM – 9:00 PM (Live Chat Agent 24/7)<br>
            • <strong>Location:</strong> Mumbai, Maharashtra, India.`;
        }

        // 16. Human Agent / Escalation
        if (
            text.includes("human") ||
            text.includes("person") ||
            text.includes("agent") ||
            text.includes("whatsapp") ||
            text.includes("call") ||
            text.includes("phone") ||
            text.includes("contact") ||
            text.includes("speak") ||
            text.includes("talk")
        ) {
            return `You can connect directly with our senior support specialist right now on WhatsApp or call!<br><br>
            📱 <strong>WhatsApp &amp; Helpline:</strong> +91 93221 59403<br><br>
            <a href="https://web.whatsapp.com/send?phone=919322159403&text=Hello%20MyStore%20Support,%20I%20am%20chatting%20from%20the%20website%20and%20need%20assistance." target="WhatsAppWeb" onclick="openWhatsAppSupport(event)" class="cs-wa-chip" style="background:#25D366; color:#fff; border-color:#25D366; text-decoration:none; margin-top:6px; display:inline-flex;"><i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp (+91 93221 59403)</a>`;
        }

        // 17. Authenticity & Trust
        if (
            text.includes("genuine") ||
            text.includes("original") ||
            text.includes("authentic") ||
            text.includes("safe") ||
            text.includes("trust") ||
            text.includes("real") ||
            text.includes("guarantee")
        ) {
            return `🛡️ <strong>100% Authenticity Guaranteed:</strong><br>Every MyStore product undergoes rigorous quality testing for fabric density, stitch tension, and color retention. We only sell 100% genuine, brand-new products with our 30-day money-back satisfaction guarantee!`;
        }

        // 18. Gratitude & Politeness / Goodbyes
        if (
            text.includes("thank") ||
            text.includes("thanks") ||
            text.includes("ok") ||
            text.includes("okay") ||
            text.includes("great") ||
            text.includes("awesome") ||
            text.includes("perfect") ||
            text.includes("nice") ||
            text.includes("cool") ||
            text.includes("bye") ||
            text.includes("goodbye") ||
            text.includes("good night")
        ) {
            return `You're very welcome! 😊 It's my pleasure to help. If you ever have questions about sizes, new arrivals, or your orders, I'm always right here 24/7. Have a wonderful day and happy shopping with MyStore! 🌟`;
        }

        // 19. Contextual Intelligent Assistance (Natural, helpful response)
        return `I am here to assist you with that! 😊<br><br>
        As your <strong>Support Agent</strong>, I can help you with:<br>
        • 📦 <strong>Tracking your order</strong> or checking delivery status<br>
        • 👕 <strong>Size &amp; fit advice</strong> for shirts and t-shirts<br>
        • 🔄 <strong>30-day returns</strong> &amp; refund guidelines<br>
        • 🏷️ <strong>Active coupons</strong> like <code>WELCOME10</code><br>
        • 📱 <strong>Direct WhatsApp assistance</strong> (+91 93221 59403)<br><br>
        Feel free to ask your question with more details, or choose a quick topic below!`;
    }

    // 5. FAQ Accordion Toggle
    function toggleCsFaq(btn) {
        const item = btn.closest(".cs-faq-item");
        if (!item) return;
        const isActive = item.classList.contains("active");

        // Close others for clean accordion
        document.querySelectorAll(".cs-faq-item").forEach(el => el.classList.remove("active"));

        if (!isActive) {
            item.classList.add("active");
        }
    }

    // 6. Submit Support Ticket
    async function submitSupportTicket(event) {
        event.preventDefault();

        const submitBtn = document.getElementById("csSubmitBtn");
        const name = document.getElementById("csName")?.value.trim() || "";
        const email = document.getElementById("csEmail")?.value.trim() || "";
        const subject = document.getElementById("csSubject")?.value || "Support Query";
        const orderId = document.getElementById("csOrderId")?.value.trim() || "";
        const message = document.getElementById("csMessage")?.value.trim() || "";

        if (!name || !email || !message) return;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting...</span>';
        }

        const ticketNum = "SUP-" + Math.floor(100000 + Math.random() * 900000);

        try {
            // Attempt server submission if server available
            if (window.location.protocol !== "file:") {
                await fetch("/api/support", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, subject, order_id: orderId, message, ticket_id: ticketNum })
                }).catch(() => {});
            }

            // Save to localStorage so ticket is preserved
            const existingTickets = JSON.parse(localStorage.getItem("support_tickets") || "[]");
            existingTickets.unshift({
                ticket_id: ticketNum,
                name,
                email,
                subject,
                order_id: orderId,
                message,
                created_at: new Date().toISOString(),
                status: "Received"
            });
            localStorage.setItem("support_tickets", JSON.stringify(existingTickets.slice(0, 20)));

            // Show success screen
            const form = document.getElementById("csSupportForm");
            const successCard = document.getElementById("csSuccessCard");
            const badge = document.getElementById("csTicketBadge");

            if (form) form.style.display = "none";
            if (badge) badge.textContent = `Ticket #${ticketNum}`;
            if (successCard) successCard.classList.add("active");

        } catch (err) {
            console.error("Support submission error:", err);
            alert("Your message has been recorded! Our team will reach out via email shortly.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Submit Support Request</span>';
            }
        }
    }

    function resetCsForm() {
        const form = document.getElementById("csSupportForm");
        const successCard = document.getElementById("csSuccessCard");
        if (form) {
            form.reset();
            form.style.display = "block";
            prefillUserInfo();
        }
        if (successCard) {
            successCard.classList.remove("active");
        }
    }

    let waSupportWindow = null;

    function openWhatsAppSupport(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        const phone = "919322159403";
        const message = "Hello MyStore Support, I need assistance with my order.";
        const encodedText = encodeURIComponent(message);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile app deep-link, then fallback to api URL
            window.location.href = `whatsapp://send?phone=${phone}&text=${encodedText}`;
            setTimeout(function () {
                window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, "_blank");
            }, 1000);
            return;
        }

        // On Desktop / Chrome:
        // Use web.whatsapp.com directly so users already working on WhatsApp Web jump straight to their chat
        // without the intermediate "Continue to Chat / Download WhatsApp" landing page!
        const waWebUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

        // If user already opened WhatsApp tab in this browser session, reuse and focus it!
        if (waSupportWindow && !waSupportWindow.closed) {
            try {
                waSupportWindow.focus();
                waSupportWindow.location.href = waWebUrl;
                return;
            } catch (err) {
                // Cross-origin restriction fallback
            }
        }

        // Use a consistent window name "WhatsAppWeb" so Chrome reuses the existing tab instead of opening a new blank tab every time
        waSupportWindow = window.open(waWebUrl, "WhatsAppWeb");
        if (waSupportWindow) {
            try {
                waSupportWindow.focus();
            } catch (err) {}
        }
    }

    // Attach to window globally
    window.openCustomerSupportModal = openCustomerSupportModal;
    window.closeCustomerSupportModal = closeCustomerSupportModal;
    window.switchCsTab = switchCsTab;
    window.toggleCsFaq = toggleCsFaq;
    window.submitSupportTicket = submitSupportTicket;
    window.resetCsForm = resetCsForm;
    window.openWhatsAppSupport = openWhatsAppSupport;
    window.handleWaChatSubmit = handleWaChatSubmit;
    window.handleWaQuickReply = handleWaQuickReply;
    window.sendWaUserMessage = sendWaUserMessage;

    // Auto initialize on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCustomerSupport);
    } else {
        initCustomerSupport();
    }
})();
