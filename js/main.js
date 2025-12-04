// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });

    // Time-based greeting functionality
    const timeGreetingElement = document.getElementById('time-greeting');

    if (timeGreetingElement) {
        function getTimeBasedGreeting() {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                return 'Good Morning';
            } else if (hour >= 12 && hour < 17) {
                return 'Good Afternoon';
            } else if (hour >= 17 && hour < 21) {
                return 'Good Evening';
            } else {
                return 'Good Night';
            }
        }

        // Set the greeting after a short delay to allow CSS animation to work
        setTimeout(() => {
            timeGreetingElement.textContent = ', ' + getTimeBasedGreeting();
            // Trigger a reflow to restart the animation
            timeGreetingElement.style.animation = 'none';
            setTimeout(() => {
                timeGreetingElement.style.animation = '';
            }, 10);
        }, 100);
    }

    // Add animation class to Hi text for more specific control if needed
    const hiText = document.getElementById('hi-text');
    if (hiText) {
        // Already handled via CSS animation
    }
});