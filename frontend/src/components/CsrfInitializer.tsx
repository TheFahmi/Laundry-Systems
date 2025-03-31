'use client';

/**
 * This component used to initialize CSRF tokens, but CSRF protection has been removed
 * Keeping an empty component to avoid breaking imports in layouts
 */
export function CsrfInitializer() {
  // Empty component that does nothing
  return null;
}

export default CsrfInitializer; 