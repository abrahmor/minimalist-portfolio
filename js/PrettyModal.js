export class PrettyModal {
    constructor() {
        this.injectStyles();
    }

    open(dialogId, triggerEl = null) {
        const dialog = document.getElementById(dialogId);
        if (!dialog) return;

        const origin = triggerEl || (typeof event !== 'undefined' && event ? event.currentTarget : null);
        const randomId = Math.random().toString(16).slice(2);

        dialog.dataset.flipId = randomId;
        if (origin) {
            origin.dataset.flipId = randomId;
        }

        // Lock background body scroll completely
        document.body.style.overflow = 'hidden';

        // Close on backdrop click & listen for close event to restore scroll
        if (!dialog.dataset.hasBackdropListener) {
            dialog.dataset.hasBackdropListener = 'true';
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (
                    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width
                );
                if (!isInDialog) {
                    this.close(dialogId);
                }
            });
            dialog.addEventListener('close', () => {
                document.body.style.overflow = '';
            });
            dialog.addEventListener('cancel', () => {
                document.body.style.overflow = '';
            });
        }

        if (origin && typeof Flip !== 'undefined') {
            const originState = Flip.getState(origin);

            dialog.showModal();

            Flip.from(originState, {
                targets: dialog,
                scale: true,
                ease: CustomEase.create("custom", "M0,0 C0.305,0.206 0.116,0.567 0.3,0.8 0.394,0.921 0.491,1 1,1"),
                toggleClass: 'pretty-modal-opening',
                duration: 0.7,
            });
        } else {
            dialog.showModal();
        }
    }

    toggleExpand(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (!dialog) return;
        dialog.classList.toggle('is-expanded');
    }

    close(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (!dialog) return;

        // Restore body scroll
        document.body.style.overflow = '';

        const originId = dialog.dataset.flipId;
        const origin = originId ? document.querySelector(`[data-flip-id="${originId}"]:not([open])`) : null;

        if (origin && typeof Flip !== 'undefined') {
            const originState = Flip.getState(origin);

            Flip.to(originState, {
                targets: dialog,
                scale: true,
                ease: CustomEase.create("custom", "M0,0 C0.305,0.206 0.116,0.567 0.3,0.8 0.394,0.921 0.491,1 1,1"),
                onComplete: () => {
                    dialog.setAttribute("style", "");
                    dialog.classList.remove('is-expanded');
                    dialog.close();
                    document.body.style.overflow = '';
                },
                toggleClass: 'pretty-modal-closing',
                duration: 0.45,
            });
        } else {
            dialog.setAttribute("style", "");
            dialog.classList.remove('is-expanded');
            dialog.close();
            document.body.style.overflow = '';
        }
    }

    injectStyles() {
        if (document.getElementById('pretty-modal-styles')) return;

        const styles = `
            dialog::backdrop {
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                transition: opacity 0.2s ease, backdrop-filter 0.2s ease;
            }

            dialog.pretty-modal-opening::backdrop {
                animation: pretty-backdrop-in 0.3s ease forwards;
            }

            dialog.pretty-modal-closing::backdrop {
                opacity: 0 !important;
                backdrop-filter: blur(0px) !important;
                -webkit-backdrop-filter: blur(0px) !important;
                transition: opacity 0.15s ease, backdrop-filter 0.15s ease;
            }

            .pretty-modal-opening {
                animation: pretty-modal-opening 500ms cubic-bezier(.56,.27,0,1);
            }

            @keyframes pretty-backdrop-in {
                from { opacity: 0; } to { opacity: 1; }
            }

            @keyframes pretty-modal-opening {
                from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: blur(0px); }
            }

            .pretty-modal-closing {
                animation: 
                    pretty-modal-closing-border-radius 400ms cubic-bezier(.56,.27,0,1), 
                    pretty-modal-closing-blur 400ms cubic-bezier(.37,.35,0,1), 
                    pretty-modal-closing-fade 500ms cubic-bezier(.56,.27,0,1) forwards
                ;
            }
            
            @keyframes pretty-modal-closing-border-radius {
                to { border-radius: 400px; }
            }

            @keyframes pretty-modal-closing-blur {
                0% { filter: blur(0); } 100% { filter: blur(20px); }
            }

            @keyframes pretty-modal-closing-fade {
                from { opacity: 1; } to { opacity: 0; }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'pretty-modal-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}
