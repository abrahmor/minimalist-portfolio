import { PrettyModal } from './PrettyModal.js';
import { projectsData } from './projects-data.js';

// Initialize Modal
const prettyModal = new PrettyModal();
window.prettyModal = prettyModal;

let currentProjectSlug = null;
const loadedTranslations = {};

// Render project content into the single dialog
export function renderProjectModal(slug) {
    const project = projectsData[slug];
    if (!project) return;
    currentProjectSlug = slug;

    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    const content = project[lang] || project.es;

    const iconEl = document.getElementById('modalProjectIcon');
    const titleEl = document.getElementById('modalProjectTitle');
    const subtitleEl = document.getElementById('modalProjectSubtitle');
    const demoBtn = document.getElementById('modalProjectDemoBtn');
    const repoBtn = document.getElementById('modalProjectRepoBtn');
    const leadEl = document.getElementById('modalProjectLead');
    const galleryEl = document.getElementById('modalProjectGallery');
    const featuresEl = document.getElementById('modalProjectFeatures');

    if (iconEl) {
        iconEl.src = project.icon;
        iconEl.alt = content.title;
    }
    if (titleEl) titleEl.textContent = content.title;
    if (subtitleEl) subtitleEl.textContent = content.subtitle;
    if (demoBtn) demoBtn.href = project.demoUrl;
    if (repoBtn) repoBtn.href = project.repoUrl;
    if (leadEl) leadEl.innerHTML = content.lead;

    // Render Screenshots
    if (galleryEl && project.screenshots) {
        galleryEl.innerHTML = project.screenshots.map((src, i) => `
            <div class="appstore-screenshot-card">
                <img src="${src}" alt="${content.title} Screenshot ${i + 1}" loading="lazy">
            </div>
        `).join('');
        galleryEl.scrollLeft = 0;
    }

    // Render Features Bento Grid
    if (featuresEl && content.features) {
        featuresEl.innerHTML = content.features.map(feat => `
            <div class="dialog-feature-card">
                <div class="dialog-feature-header">
                    <div class="dialog-feature-icon">
                        <i class="${feat.icon}"></i>
                    </div>
                    <h4 class="dialog-feature-title">${feat.title}</h4>
                </div>
                <p class="dialog-feature-desc">${feat.desc}</p>
            </div>
        `).join('');
    }
}

// Global modal trigger from any project card
window.openProjectModal = function(slug, triggerEl = null) {
    const origin = triggerEl || (typeof event !== 'undefined' && event ? event.currentTarget : null);
    renderProjectModal(slug);
    prettyModal.open('project-modal', origin);
};

// Carousel navigation helper (prev / next)
window.scrollCarousel = function(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const card = carousel.querySelector('.appstore-screenshot-card');
    const scrollAmount = card ? (card.offsetWidth + 14) : 320;
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
};

// Position mini menu below trigger button
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

// Animated hover pill background for navigation items
function setupHoverBg(container, hoverBgSelector, itemSelector) {
    const hoverBg = container.querySelector(hoverBgSelector);
    const items = container.querySelectorAll(itemSelector);
    if (!hoverBg || !items.length) return null;

    let isHovering = false;

    function getOffsetRelativeTo(element, parent) {
        let x = 0, y = 0;
        while (element && element !== parent) {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return { left: x, top: y };
    }

    function showHoverBg(element) {
        if (!element) {
            hideHoverBg();
            return;
        }
        const { left, top } = getOffsetRelativeTo(element, container);
        hoverBg.style.width = `${element.offsetWidth}px`;
        hoverBg.style.height = `${element.offsetHeight}px`;
        hoverBg.style.left = `${left}px`;
        hoverBg.style.top = `${top}px`;
        hoverBg.style.opacity = '1';
    }

    function hideHoverBg() {
        isHovering = false;
        hoverBg.style.opacity = '0';
    }

    function updateActiveState() {
        if (isHovering) return;
        const activeItem = container.querySelector(`${itemSelector}.active`);
        if (activeItem) {
            showHoverBg(activeItem);
        } else {
            hideHoverBg();
        }
    }

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            isHovering = true;
            showHoverBg(item);
        });
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        updateActiveState();
    });

    window.addEventListener('resize', () => {
        updateActiveState();
    });

    return {
        updateActiveState,
        showHoverBg,
        hideHoverBg
    };
}

// Initialize Page Interactions on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Mini menu
    const moreBtn = document.querySelector('.more-btn');
    const miniMenu = document.getElementById('miniMenu');
    if (moreBtn && miniMenu) {
        setupHoverDelay(moreBtn, miniMenu);
    }

    // Mini menu links hover
    const miniMenuUl = miniMenu ? miniMenu.querySelector('ul') : null;
    let miniHoverController = null;
    if (miniMenuUl) {
        miniHoverController = setupHoverBg(miniMenuUl, '.mini-hover-bg', 'li a');
    }

    // Immediately hide mini hover pill when cursor touches language switcher
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch && miniHoverController) {
        langSwitch.addEventListener('mouseenter', () => {
            miniHoverController.hideHoverBg();
        });
    }

    // Navigation links hover & active state tracking
    const navLinks = document.querySelector('.nav-links');
    let navHoverController = null;
    if (navLinks) {
        navHoverController = setupHoverBg(navLinks, '.hover-bg', 'a');
    }

    // Scroll spy: Active section detection on scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    function updateActiveNavOnScroll() {
        const scrollPosition = window.pageYOffset + 200;
        let currentId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentId = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (navHoverController) {
            navHoverController.updateActiveState();
        }
    }

    window.addEventListener('scroll', updateActiveNavOnScroll);
    updateActiveNavOnScroll();

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Theme Switch
    const themeSwitch = document.querySelector('.theme-switch');
    const themeButtons = document.querySelectorAll('.switch-btn');

    function applyTheme(theme) {
        if (themeSwitch) {
            themeSwitch.dataset.active = theme;
        }
        document.documentElement.setAttribute('data-theme', theme);
    }

    if (themeSwitch) {
        const savedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(savedTheme);

        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
                localStorage.setItem('theme', theme);
            });
        });
    }

    // Language Switch
    const langButtons = document.querySelectorAll('.lang-btn');

    async function applyLang(lang) {
        if (langSwitch) {
            langSwitch.dataset.active = lang;
        }

        document.documentElement.lang = lang;

        try {
            if (!loadedTranslations[lang]) {
                const response = await fetch(`./locales/${lang}.json`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                loadedTranslations[lang] = await response.json();
            }

            const texts = loadedTranslations[lang];

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                if (texts && texts[key]) {
                    el.innerHTML = texts[key];
                }
            });

            // Update modal if currently opened
            if (currentProjectSlug) {
                renderProjectModal(currentProjectSlug);
            }

            // Recalculate active nav pill position
            if (navHoverController) {
                setTimeout(() => navHoverController.updateActiveState(), 50);
            }
        } catch (error) {
            console.error(`Failed to load translation for: ${lang}`, error);
        }
    }

    if (langSwitch) {
        const userLang = navigator.language || navigator.userLanguage;
        const defaultLang = userLang.startsWith('es') ? 'es' : 'en';
        const savedLang = localStorage.getItem('lang') || defaultLang;
        applyLang(savedLang);

        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                applyLang(lang);
                localStorage.setItem('lang', lang);
            });
        });
    }
});
