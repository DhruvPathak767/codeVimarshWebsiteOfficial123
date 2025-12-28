// Mobile Navigation Logic with Enhanced Animations
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const mobileMenuBtn = document.getElementById('mobile-menu-btn'); // The hamburger button
  const mobileMenu = document.getElementById('mobile-menu'); // The sidebar
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop'); // The dark overlay
  const mobileMenuClose = document.getElementById('mobile-menu-close'); // The close button inside sidebar
  const menuItems = document.querySelectorAll('.mobile-menu-item'); // Links for staggered animation

  // State
  let isMenuOpen = false;

  function openMobileMenu() {
    if (isMenuOpen) return;
    isMenuOpen = true;

    // 1. Unhide elements (display: block)
    mobileMenu.classList.remove('hidden');
    mobileMenuBackdrop.classList.remove('hidden');

    // 2. Lock body scroll to prevent background scrolling
    document.body.style.overflow = 'hidden';

    // 3. Trigger animations after a tiny delay to ensure transition works
    setTimeout(() => {
      // Backdrop fade in
      mobileMenuBackdrop.classList.remove('opacity-0');

      // Sidebar slide in
      mobileMenu.classList.remove('translate-x-full');

      // Staggered Text Reveal
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.remove('opacity-0');
          item.classList.remove('translate-x-4'); // Optional: slide text slightly
        }, 100 + (index * 50));
      });
    }, 10);
  }

  function closeMobileMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;

    // 1. Sidebar slide out
    mobileMenu.classList.add('translate-x-full');

    // 2. Backdrop fade out
    mobileMenuBackdrop.classList.add('opacity-0');

    // 3. Reset menu items
    menuItems.forEach(item => {
      item.classList.add('opacity-0');
    });

    // 4. Wait for transitions to finish before hiding/unlocking
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      mobileMenuBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300); // Matches duration-300
  }

  // Toggle Button Listener
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate closing if using document listener
      if (isMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close Button Listener
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Backdrop Click Listener
  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  // Escape Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMobileMenu();
    }
  });

  // Close on resizing to desktop (cleanup)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isMenuOpen) {
      closeMobileMenu();
    }
  });
});
