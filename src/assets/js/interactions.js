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

    // 9. Interactive Sidenotes Logic
    const initSidenotes = () => {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const sidenoteRail = document.querySelector('aside .sticky > div:last-child'); // The placeholder div in post.njk
        const articleContainer = document.querySelector('article');

        if (isDesktop && sidenoteRail && articleContainer) {
            // Move footnotes to rail
            document.querySelectorAll('.sidenote-wrapper').forEach((wrapper, index) => {
                const content = wrapper.querySelector('.sidenote-content');
                const label = wrapper.parentElement.querySelector(`label[for="${wrapper.querySelector('input').id}"]`);

                if (!content || !label || content.classList.contains('moved')) return;

                // Clone content to rail
                const dockedNote = content.cloneNode(true);
                dockedNote.classList.add('sidenote-docked', 'moved');
                dockedNote.classList.remove('sidenote-content');

                // Calculate Top Position
                // We need the offset of the label relative to the top of the sticky container?
                // Actually relative to the top of the article content column?
                // The rail is sticky, so `top: 0` is the top of the viewport...
                // This is tricky.

                // Simpler approach:
                // Use absolute positioning inside the aside which is `position: relative` or `static`.
                // The aside container is sticky. So if we put absolute elements in it, they move with it.
                // We want them to scroll WITH the page, but sit in the rail.
                // The sticky container makes the RAIL contents stay put, but we want the NOTES to stay next to text.
                // So the notes should NOT be inside the sticky container. They should be in the ASIDE column but outside the sticky div?
                // OR we just absolutely position them in the grid column 10-12 relative to the whole grid row.

                // Let's APPEND them to the Aside Column itself (parent of sticky), and make sure that column is relative.
                const asideColumn = document.querySelector('aside');
                asideColumn.style.position = 'relative';

                // Calculate position relative to the main article wrapper
                // The label's offsetTop is relative to the prose container.
                const labelOffset = label.getBoundingClientRect().top + window.scrollY;
                const asideOffset = asideColumn.getBoundingClientRect().top + window.scrollY;

                const relativeTop = labelOffset - asideOffset - 10; // -10 for alignment

                dockedNote.style.top = `${Math.max(0, relativeTop)}px`;
                dockedNote.id = `docked-${index}`;

                asideColumn.appendChild(dockedNote);

                // Add interaction
                label.addEventListener('mouseenter', () => {
                    dockedNote.classList.add('sidenote-active');
                    dockedNote.style.zIndex = '50';
                });
                label.addEventListener('mouseleave', () => {
                    dockedNote.classList.remove('sidenote-active');
                    dockedNote.style.zIndex = '1';
                });

                // Mark original as moved/hidden
                content.classList.add('hidden-desktop');
            });
        }
    };

    // Run on load and resize (debounce resize)
    initSidenotes();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initSidenotes, 250);
    });
});
