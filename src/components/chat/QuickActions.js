'use client';

import styles from '@/styles/chat/QuickActions.module.css';

/**
 * Render a labeled grid of quick-action buttons.
 *
 * Renders nothing if `actions` is falsy or empty. Each button displays the action's
 * label and calls `onActionClick` with the action's `message` when clicked. The
 * `assistantColor` prop is applied to each button via the CSS custom property
 * `--assistant-color`.
 *
 * @param {Array<{label: string, message: string}>} actions - Array of action objects to render.
 * @param {function(string): void} onActionClick - Callback invoked with the action message when a button is clicked.
 * @param {string} assistantColor - CSS color value assigned to `--assistant-color` on each button.
 * @returns {JSX.Element|null} The rendered quick actions component or `null` when no actions are provided.
 */
export default function QuickActions({ actions, onActionClick, assistantColor }) {
    if (!actions || actions.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.label}>빠른 액션</div>
            <div className={styles.actionsGrid}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={styles.actionButton}
                        onClick={() => onActionClick(action.message)}
                        style={{ '--assistant-color': assistantColor }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}