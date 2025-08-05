// Main UI setup on page load
document.addEventListener('DOMContentLoaded', () => {
    // Mini menu
    const moreBtn = document.querySelector('.more-btn');
    const miniMenu = document.getElementById('miniMenu');
    setupHoverDelay(moreBtn, miniMenu);

    // Mini menu links hover
    const miniMenuUl = miniMenu.querySelector('ul');
    if (miniMenuUl) {
        setupHoverBg(miniMenuUl.parentElement, '.mini-hover-bg', 'ul a');
    }

    // Mini menu actions hover
    const miniMenuActions = document.getElementById('miniMenuActions');
    if (miniMenuActions) {
        setupHoverBg(miniMenuActions, '.mini-hover-bg-actions', 'button');
    }

    // Navigation links hover
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        setupHoverBg(navLinks, '.hover-bg', 'a');
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

// Position mini menu below trigger
function positionMiniMenu(trigger, menu) {
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;

    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 20}px`;
    menu.style.left = `${rect.left + rect.width / 15 - menuWidth / 1.8}px`;
}

// Mini menu open/close with hover delay
function setupHoverDelay(trigger, target, openClass = 'open', openDelay = 180, closeDelay = 250) {
    let hoverTimeout;
    trigger.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            positionMiniMenu(trigger, target);
            target.classList.add(openClass);
        }, openDelay);
    });
    trigger.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            target.classList.remove(openClass);
        }, closeDelay);
    });
    target.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        target.classList.add(openClass);
    });
    target.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
            target.classList.remove(openClass);
        }, closeDelay);
    });
    document.addEventListener('click', (e) => {
        if (!target.contains(e.target) && !trigger.contains(e.target)) {
            target.classList.remove(openClass);
        }
    });
}

// Animated hover background for items
function setupHoverBg(container, hoverBgSelector, itemSelector) {
    const hoverBg = container.querySelector(hoverBgSelector);
    const items = container.querySelectorAll(itemSelector);
    if (!hoverBg || !items.length) return;

    // Get position relative to container
    function getOffsetRelativeTo(element, parent) {
        let x = 0, y = 0;
        while (element && element !== parent) {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return { left: x, top: y };
    }

    // Show hover background
    function showHoverBg(element) {
        const { left, top } = getOffsetRelativeTo(element, container);
        hoverBg.style.width = `${element.offsetWidth}px`;
        hoverBg.style.height = `${element.offsetHeight}px`;
        hoverBg.style.left = `${left}px`;
        hoverBg.style.top = `${top}px`;
        hoverBg.style.opacity = '1';
    }

    // Hide hover background
    function hideHoverBg() {
        hoverBg.style.opacity = '0';
    }

    items.forEach(item => {
        item.addEventListener('mouseenter', () => showHoverBg(item));
        item.addEventListener('mouseleave', hideHoverBg);
    });
}