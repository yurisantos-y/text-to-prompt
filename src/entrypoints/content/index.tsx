// @ts-nocheck
import { createRoot } from 'react-dom/client';
import { ModalOptions } from '@/components/ModalOptions';
import '@/styles/globals.css';

// Store active icons to prevent duplicates
const activeIcons = new Map<HTMLElement, HTMLDivElement>();
let modalRoot: ReturnType<typeof createRoot> | null = null;
let modalContainer: HTMLDivElement | null = null;
let currentField: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null = null;
let focusedField: HTMLElement | null = null;
let isModalOpen = false;

/**
 * Create lightbulb SVG icon (inline)
 */
function createLightbulbSVG(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#FF6200');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.style.cssText = `
    display: block;
    pointer-events: none;
  `;
  
  // Lightbulb bulb (circle top part)
  const bulb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bulb.setAttribute('d', 'M15 14c.5-1 .5-2 .5-3a4.5 4.5 0 1 0-9 0c0 1 0 2 .5 3');
  bulb.setAttribute('fill', '#FFE5CC');
  bulb.setAttribute('fill-opacity', '0.4');
  
  // Base horizontal lines
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line1.setAttribute('d', 'M9 18h6');
  
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line2.setAttribute('d', 'M10 21.5h4');
  
  // Middle section
  const middle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  middle.setAttribute('d', 'M9 14h6v4H9z');
  middle.setAttribute('fill', 'none');
  
  svg.appendChild(bulb);
  svg.appendChild(middle);
  svg.appendChild(line1);
  svg.appendChild(line2);
  
  return svg;
}

/**
 * Check if element is a valid text field
 */
function isTextField(element: HTMLElement): boolean {
  if (!element) return false;

  // Check if element is disabled or readonly
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
  }

  // Input elements
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    // Exclude only non-text input types
    const excludedTypes = ['checkbox', 'radio', 'file', 'submit', 'button', 'image', 'hidden', 'range', 'reset', 'color'];
    return !excludedTypes.includes(type);
  }
  
  // Textarea elements
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  
  // ContentEditable elements
  if (element.isContentEditable) {
    return true;
  }
  
  // Elements with contenteditable attribute
  if (element.hasAttribute('contenteditable')) {
    const value = element.getAttribute('contenteditable');
    return value === 'true' || value === '' || value === 'plaintext-only';
  }
  
  // Elements with role="textbox"
  const role = element.getAttribute('role');
  if (role === 'textbox' || role === 'searchbox') {
    return true;
  }
  
  // Elements with designMode (rare but possible)
  if (element.ownerDocument && element.ownerDocument.designMode === 'on') {
    return true;
  }
  
  return false;
}

/**
 * Get text content from field
 */
function getTextFromField(field: HTMLElement): string {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value;
  }
  return field.innerText || field.textContent || '';
}

/**
 * Insert text into field
 */
function insertTextIntoField(field: HTMLElement, text: string): void {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = text;
    // Trigger input event to notify frameworks like React
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    field.innerText = text;
    // Trigger input event for contenteditable
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Update icon position based on field position
 */
function updateIconPosition(icon: HTMLDivElement, field: HTMLElement): void {
  const rect = field.getBoundingClientRect();
  
  // Position icon at bottom-right of field (fixed position relative to viewport)
  // Adjust by icon size (28px) to align properly with some padding
  icon.style.top = `${rect.bottom - 32}px`;
  icon.style.left = `${rect.right - 32}px`;
}

/**
 * Create and inject the icon
 */
function createIcon(field: HTMLElement): HTMLDivElement {
  // Check if icon already exists
  if (activeIcons.has(field)) {
    const existingIcon = activeIcons.get(field)!;
    updateIconPosition(existingIcon, field);
    return existingIcon;
  }

  const icon = document.createElement('div');
  icon.className = 'text-to-prompt-icon';
  icon.style.cssText = `
    position: fixed;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    border: 1px solid rgba(0, 0, 0, 0.06);
  `;

  // Create lightbulb icon
  const lightbulbSvg = createLightbulbSVG();
  icon.appendChild(lightbulbSvg);

  // Position the icon
  updateIconPosition(icon, field);

  // Click handler
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    currentField = field;
    const text = getTextFromField(field);
    openModal(text);
  });

  // Hover effect
  icon.addEventListener('mouseenter', () => {
    icon.style.transform = 'scale(1.1)';
  });
  icon.addEventListener('mouseleave', () => {
    icon.style.transform = 'scale(1)';
  });

  // Append to body instead of field
  document.body.appendChild(icon);
  activeIcons.set(field, icon);

  return icon;
}

/**
 * Show icon on focus
 */
function handleFocus(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  if (isTextField(target)) {
    focusedField = target;
    const icon = createIcon(target);
    // Show icon with delay, but only if modal is not open
    setTimeout(() => {
      if (!isModalOpen) {
        icon.style.opacity = '1';
      }
    }, 100);
  }
}

/**
 * Hide icon on blur (with delay to check if modal is opening)
 */
function handleBlur(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  setTimeout(() => {
    // Only hide if no modal is open and field is not focused
    if (activeIcons.has(target) && target !== focusedField) {
      const icon = activeIcons.get(target)!;
      icon.style.opacity = '0';
      // Clean up icon after fade out
      setTimeout(() => {
        if (icon.style.opacity === '0' && icon.parentElement) {
          icon.remove();
          activeIcons.delete(target);
        }
      }, 200);
    }
  }, 100);
}

/**
 * Open modal with React
 */
function openModal(text: string): void {
  isModalOpen = true;
  // Hide all icons when modal opens
  activeIcons.forEach((icon) => {
    icon.style.opacity = '0';
  });

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'text-to-prompt-modal-root';
    modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 999999;';
    document.body.appendChild(modalContainer);
    modalRoot = createRoot(modalContainer);
  }

  const handleClose = () => {
    isModalOpen = false;
    if (modalRoot && modalContainer) {
      modalRoot.render(<ModalOptions open={false} onClose={handleClose} text="" onInsert={() => {}} />);
    }
    // Re-show icon for currently focused field after modal closes
    if (currentField && activeIcons.has(currentField) && currentField === focusedField) {
      const icon = activeIcons.get(currentField)!;
      setTimeout(() => {
        updateIconPosition(icon, currentField!);
        icon.style.opacity = '1';
      }, 100);
    }
  };

  const handleInsert = (convertedText: string) => {
    if (currentField) {
      insertTextIntoField(currentField, convertedText);
      isModalOpen = false;
      // Keep icons hidden when text is inserted
      activeIcons.forEach((icon) => {
        icon.style.opacity = '0';
      });
    }
  };

  if (modalRoot) {
    modalRoot.render(
    <ModalOptions
      open={true}
      onClose={handleClose}
      text={text}
      onInsert={handleInsert}
    />
    );
  }
}

/**
 * Initialize content script
 */
function init(): void {
  // Add global event listeners
  document.addEventListener('focusin', handleFocus, true);
  document.addEventListener('focusout', handleBlur, true);

  // Update icon positions on scroll and resize
  let scrollTimeout: number;
  const updatePositions = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
      activeIcons.forEach((icon, field) => {
        if (icon.style.opacity === '1') {
          updateIconPosition(icon, field);
        }
      });
    }, 10);
  };
  
  window.addEventListener('scroll', updatePositions, true);
  window.addEventListener('resize', updatePositions);

  // Observe DOM changes for dynamically added fields
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check the node itself
          if (isTextField(node)) {
            // Icon will be created on focus
          }
          // Check descendants - comprehensive selector for all editable elements
          const textFields = node.querySelectorAll(
            'input, textarea, [contenteditable], [contenteditable="true"], ' +
            '[contenteditable=""], [contenteditable="plaintext-only"], ' +
            '[role="textbox"], [role="searchbox"]'
          );
          textFields.forEach((field) => {
            if (isTextField(field as HTMLElement)) {
              // Icon will be created on focus
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[Text to Prompt] Content script initialized');
}

// Export content script definition for WXT
export default {
  matches: ['<all_urls>'],
  main() {
    // Run when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  },
};
