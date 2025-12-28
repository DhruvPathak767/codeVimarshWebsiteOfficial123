<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password - Code Vimarsh</title>
  <link rel="stylesheet" href="/output.css">
  <link rel="stylesheet" href="/css/home.css">
  <link rel="stylesheet" href="/css/auth.css">
  <link rel="stylesheet" href="/css/buttons.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link
    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Fira+Code:wght@400;600&display=swap"
    rel="stylesheet">
</head>

<body class="min-h-screen font-code bg-background text-text-main">
  <!-- Navigation Bar -->
  <%- include('../partials/nav.ejs') %>

    <!-- Forgot Password Section -->
    <section class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Glassmorphism Card -->
        <div class="glass-effect rounded-2xl p-8 md:p-12 border border-surface/50 relative overflow-hidden">
          <!-- Background glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
          </div>

          <div class="relative z-10">
            <!-- Header -->
            <div class="text-center mb-8 animate-fade-up">
              <h1 class="text-3xl md:text-4xl font-bold text-gradient mb-2 glitch-hover cursor-default">
                Forgot Password
              </h1>
              <p class="text-text-muted">Enter your email to receive a reset link</p>
            </div>

            <% if (locals.errorMessage) { %>
              <div class="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6"
                role="alert">
                <span class="block sm:inline">
                  <%= errorMessage %>
                </span>
              </div>
              <% } %>

                <% if (locals.successMessage) { %>
                  <div
                    class="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg relative mb-6"
                    role="alert">
                    <span class="block sm:inline">
                      <%= successMessage %>
                    </span>
                  </div>
                  <% } %>

                    <!-- Forgot Password Form -->
                    <form id="forgotPasswordForm" action="/auth/forgot-password" method="POST"
                      class="space-y-6 animate-fade-up delay-100">
                      <!-- Email -->
                      <div class="form-group">
                        <input type="email" id="email" name="email" class="form-input" placeholder=" " required>
                        <label for="email" class="form-label">Email Address</label>
                        <div class="error-message" id="email-error">Email is required</div>
                      </div>

                      <!-- Submit Button -->
                      <button type="submit"
                        class="w-full px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg glow-hover transition-all transform hover:scale-105 ">
                        Send Reset Link
                      </button>
                    </form>

                    <!-- Back to Login Link -->
                    <div class="mt-6 text-center animate-fade-up delay-200">
                      <p class="text-text-muted">
                        Remembered your password?
                        <a href="/signin" class="text-secondary hover:text-primary font-semibold transition-colors">
                          Sign In
                        </a>
                      </p>
                    </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <%- include('../partials/footer.ejs') %>

      <!-- Mobile Menu Script -->
      <script src="/js/home.js"></script>

      <!-- Form Validation Script -->
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const form = document.getElementById('forgotPasswordForm');
          const inputs = form.querySelectorAll('input[required]');

          // Show error function
          function showError(input, errorId, message) {
            input.classList.add('error');
            const errorElement = document.getElementById(errorId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
          }

          // Hide error function
          function hideError(input, errorId) {
            input.classList.remove('error');
            document.getElementById(errorId).style.display = 'none';
          }

          // Validate individual field
          function validateField(input) {
            const fieldName = input.name;
            const errorId = `${fieldName}-error`;

            if (!input.value.trim()) {
              const label = form.querySelector(`label[for="${input.id}"]`).textContent;
              showError(input, errorId, `${label} is required`);
              return false;
            }

            hideError(input, errorId);
            return true;
          }

          // Real-time validation on input
          inputs.forEach(input => {
            input.addEventListener('blur', () => {
              validateField(input);
            });

            input.addEventListener('input', () => {
              if (input.classList.contains('error')) {
                validateField(input);
              }
            });
          });

          // Reset button state on page load if there's a message
          // (This handles the case where the form was submitted but the page reloaded with a message)
          const submitBtn = form.querySelector('button[type="submit"]');
          const hasMessage = document.querySelector('.bg-red-500\\/10, .bg-green-500\\/10');
          
          if (hasMessage) {
            submitBtn.innerHTML = 'Send Reset Link';
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            submitBtn.disabled = false;
          }

          // Form submission
          form.addEventListener('submit', (e) => {
            let isValid = true;

            // Validate all fields
            inputs.forEach(input => {
              if (!validateField(input)) {
                isValid = false;
              }
            });

            if (!isValid) {
              e.preventDefault();
            } else {
              // Provide visual feedback only for valid submissions
              submitBtn.innerHTML = 'Sending...';
              submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
              submitBtn.disabled = true;
            }
          });
        });
      </script>
</body>

</html>
