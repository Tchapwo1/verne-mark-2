document.addEventListener("DOMContentLoaded", () => {
    // 1. Copy to Clipboard
    document.querySelectorAll("pre").forEach((pre) => {
        // specific to syntax highlighter wrapper
        const code = pre.querySelector("code");
        if (!code) return;

        const button = document.createElement("button");
        button.className = "absolute top-2 right-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity";
        button.innerText = "Copy";

        // Wrap pre in relative group if not already
        const wrapper = document.createElement("div");
        wrapper.className = "relative group";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);

        button.addEventListener("click", () => {
            navigator.clipboard.writeText(code.innerText);
            button.innerText = "Copied!";
            setTimeout(() => (button.innerText = "Copy"), 2000);
        });
    });

    // 2. Scroll Progress Bar
    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
        window.addEventListener("scroll", () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
    }

    // 1. Scroll-to-Top FAB
    const fab = document.getElementById("scroll-top-fab");
    if (fab) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 500) {
                fab.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
            } else {
                fab.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
            }
        });
        fab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    // 6. Dynamic Greeting
    const greetingEl = document.getElementById("dynamic-greeting");
    if (greetingEl) {
        const hour = new Date().getHours();
        let greeter = "Intelligence for the architects of the AI era.";
        if (hour < 12) greeter = "Good morning. Here is your daily briefing.";
        else if (hour > 18) greeter = "Evening Report. The signal from the noise.";

        greetingEl.innerText = greeter;
    }

    // 5. Hover Cards (Simple Implementation)
    // Finds internal links and shows a simple tooltip if data-title exists (you'd need to populate this via build time ideally, simply showing href for now to demonstrate mechanism)
    const internalLinks = document.querySelectorAll('main a[href^="/"]');
    const tooltip = document.createElement('div');
    tooltip.className = 'link-tooltip hidden lg:block';
    document.body.appendChild(tooltip);

    internalLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            const href = link.getAttribute('href');
            if (href === '/') return;

            tooltip.innerHTML = `
            <div class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Internal Link</div>
            <div class="font-serif font-bold text-slate-900 dark:text-white">Jump to: ${href}</div>
          `;
            tooltip.style.opacity = '1';

            const rect = link.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
        });
        link.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
});
