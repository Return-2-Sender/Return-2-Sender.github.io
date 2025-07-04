/*!
 * jQuery Age Gate Plugin v1.0.0
 * Age verification modal with date of birth validation
 * 
 * Requires: jQuery 3.0+, Bootstrap 5.0+
 * 
 * Usage: $('body').ageGate(options);
 *
 * Updated: June 10 2025 with Bootstrap v5.3.1
 * Author:  Brocy Centeio
 *
 */

(function($) {
    'use strict';
    
    $.fn.ageGate = function(options) {
        
        // Default settings
        var settings = $.extend({
            minAge: 18,
            onVerified: function() {},
            onDenied: function() {},
            onError: function(message) {},
            errorMessage: 'You must be {minAge} or older to access this content.',
            modalId: 'ageGateModal',
            modalTitle: 'Enter your date of birth',
            submitText: 'Enter',
            dayPlaceholder: 'DD',
            monthPlaceholder: 'MM',
            yearPlaceholder: 'YYYY',
            cookieName: 'ageGateVerified',
            cookieExpiry: 30, // days
            rememberVerification: false,
            fadeInDuration: 300,
            autoFocus: true,
            enableShakeAnimation: true
        }, options);
        
        var plugin = this;
        var modal;
        var modalElement;
        
        // Replace placeholder in error message
        settings.errorMessage = settings.errorMessage.replace('{minAge}', settings.minAge);
        
        // Check if already verified via cookie
        if (settings.rememberVerification && getCookie(settings.cookieName)) {
            $('.page-content').addClass('age-verified');
            settings.onVerified();
            return this;
        }
        
        // Initialize the age gate
        init();
        
        function init() {
            // Check dependencies
            if (typeof $ === 'undefined') {
                console.error('Age Gate Plugin: jQuery is required but not found.');
                return;
            }
            
            if (typeof bootstrap === 'undefined') {
                console.error('Age Gate Plugin: Bootstrap 5 is required but not found.');
                return;
            }
            
            try {
                createModal();
                bindEvents();
                showModal();
            } catch (error) {
                console.error('Age Gate Plugin: Initialization error:', error);
            }
        }
        
        function createModal() {
            // Remove existing modal if present
            $('#' + settings.modalId).remove();
            
            var modalHtml = `
                <div class="modal fade" id="${settings.modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" role="dialog" aria-labelledby="${settings.modalId}Title" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content age-gate-modal">
                            <div class="modal-header">
                                <h4 class="modal-title" id="${settings.modalId}Title">${settings.modalTitle}</h4>
                            </div>
                            <div class="modal-body">
                                <form class="age-gate-form" role="form">
                                    <div class="age-gate-date-inputs">
                                        <input 
                                            type="number" 
                                            class="form-control age-gate-date-input" 
                                            id="ageGateDay" 
                                            placeholder="${settings.dayPlaceholder}" 
                                            min="1" 
                                            max="31" 
                                            maxlength="2"
                                            aria-label="Day"
                                            autocomplete="bday-day"
                                        >
                                        <input 
                                            type="number" 
                                            class="form-control age-gate-date-input" 
                                            id="ageGateMonth" 
                                            placeholder="${settings.monthPlaceholder}" 
                                            min="1" 
                                            max="12" 
                                            maxlength="2"
                                            aria-label="Month"
                                            autocomplete="bday-month"
                                        >
                                        <input 
                                            type="number" 
                                            class="form-control age-gate-date-input" 
                                            id="ageGateYear" 
                                            placeholder="${settings.yearPlaceholder}" 
                                            min="1900" 
                                            max="${new Date().getFullYear()}" 
                                            maxlength="4"
                                            aria-label="Year"
                                            autocomplete="bday-year"
                                        >
                                    </div>
                                    <button type="submit" class="age-gate-submit-btn" id="ageGateSubmit">
                                        ${settings.submitText}
                                    </button>
                                    <div class="age-gate-error" id="ageGateError" role="alert" aria-live="polite"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHtml);
            modalElement = document.getElementById(settings.modalId);
        }
        
        function bindEvents() {
            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.error('Age Gate Plugin: Bootstrap 5 is required but not found.');
                return;
            }
            
            try {
                // Initialize Bootstrap modal
                modal = new bootstrap.Modal(modalElement, {
                    backdrop: 'static',
                    keyboard: false,
                    focus: settings.autoFocus
                });
            } catch (error) {
                console.error('Age Gate Plugin: Error initializing modal:', error);
                return;
            }
            
            // Add custom backdrop class when modal is shown
            $(modalElement).on('shown.bs.modal', function() {
                $('.modal-backdrop').addClass('age-gate-backdrop');
                if (settings.autoFocus) {
                    $('#ageGateDay').focus();
                }
            });
            
            // Input navigation and formatting
            $('#ageGateDay, #ageGateMonth').on('input', function() {
                var value = this.value;
                if (value.length >= 2) {
                    $(this).nextAll('.age-gate-date-input').first().focus();
                }
                // Pad single digits for day/month
                if (value.length === 1 && parseInt(value) > 3 && this.id === 'ageGateDay') {
                    this.value = '0' + value;
                    $(this).nextAll('.age-gate-date-input').first().focus();
                }
                if (value.length === 1 && parseInt(value) > 1 && this.id === 'ageGateMonth') {
                    this.value = '0' + value;
                    $(this).nextAll('.age-gate-date-input').first().focus();
                }
            });
            
            $('#ageGateYear').on('input', function() {
                if (this.value.length >= 4) {
                    $('#ageGateSubmit').focus();
                }
            });
            
            // Prevent invalid characters
            $('.age-gate-date-input').on('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
            
            // Form submission
            $('.age-gate-form').on('submit', function(e) {
                e.preventDefault();
                verifyAge();
            });
            
            $('#ageGateSubmit').on('click', function(e) {
                e.preventDefault();
                verifyAge();
            });
            
            // Enter key navigation
            $('.age-gate-date-input').on('keydown', function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var nextInput = $(this).nextAll('.age-gate-date-input').first();
                    if (nextInput.length) {
                        nextInput.focus();
                    } else {
                        verifyAge();
                    }
                }
            });
        }
        
        function verifyAge() {
            var day = parseInt($('#ageGateDay').val()) || 0;
            var month = parseInt($('#ageGateMonth').val()) || 0;
            var year = parseInt($('#ageGateYear').val()) || 0;
            
            // Clear previous errors and loading state
            hideError();
            setLoadingState(true);
            
            // Validate input
            var validation = validateDate(day, month, year);
            if (!validation.valid) {
                showError(validation.message);
                setLoadingState(false);
                return;
            }
            
            // Create birth date
            var birthDate = new Date(year, month - 1, day);
            var today = new Date();
            
            // Calculate age
            var age = calculateAge(birthDate, today);
            
            // Small delay for better UX
            setTimeout(function() {
                setLoadingState(false);
                
                if (age >= settings.minAge) {
                    handleVerificationSuccess();
                } else {
                    handleVerificationFailure();
                }
            }, 500);
        }
        
        function validateDate(day, month, year) {
            var currentYear = new Date().getFullYear();
            
            if (!day || !month || !year) {
                return { valid: false, message: 'Please enter your complete date of birth.' };
            }
            
            if (day < 1 || day > 31) {
                return { valid: false, message: 'Please enter a valid day (1-31).' };
            }
            
            if (month < 1 || month > 12) {
                return { valid: false, message: 'Please enter a valid month (1-12).' };
            }
            
            if (year < 1900 || year > currentYear) {
                return { valid: false, message: 'Please enter a valid year.' };
            }
            
            // Check if date exists (handles leap years, etc.)
            var testDate = new Date(year, month - 1, day);
            if (testDate.getDate() !== day || testDate.getMonth() !== (month - 1) || testDate.getFullYear() !== year) {
                return { valid: false, message: 'Please enter a valid date.' };
            }
            
            // Check if date is in the future
            if (testDate > new Date()) {
                return { valid: false, message: 'Birth date cannot be in the future.' };
            }
            
            return { valid: true };
        }
        
        function calculateAge(birthDate, currentDate) {
            var age = currentDate.getFullYear() - birthDate.getFullYear();
            var monthDiff = currentDate.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age;
        }
        
        function handleVerificationSuccess() {
            // Set cookie if remember option is enabled
            if (settings.rememberVerification) {
                setCookie(settings.cookieName, 'true', settings.cookieExpiry);
            }
            
            modal.hide();
            
            $('.page-content').addClass('age-verified');
            
            // Callback
            settings.onVerified();
        }
        
        function handleVerificationFailure() {
            showError(settings.errorMessage);
            settings.onDenied();
        }
        
        function showError(message) {
            $('#ageGateError').text(message).show();
            settings.onError(message);
            
            // Shake animation
            if (settings.enableShakeAnimation) {
                $('.age-gate-modal').addClass('shake');
                setTimeout(function() {
                    $('.age-gate-modal').removeClass('shake');
                }, 600);
            }
        }
        
        function hideError() {
            $('#ageGateError').hide();
        }
        
        function setLoadingState(loading) {
            var $btn = $('#ageGateSubmit');
            if (loading) {
                $btn.addClass('loading').prop('disabled', true);
            } else {
                $btn.removeClass('loading').prop('disabled', false);
            }
        }
        
        function showModal() {
            try {
                if (modal) {
                    modal.show();
                } else {
                    console.error('Age Gate Plugin: Modal not initialized');
                }
            } catch (error) {
                console.error('Age Gate Plugin: Error showing modal:', error);
            }
        }
        
        // Cookie utilities
        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
        
        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
        
        // Public methods
        plugin.destroy = function() {
            if (modal) {
                modal.dispose();
            }
            $('#' + settings.modalId).remove();
            $('.page-content').removeClass('age-verified');
        };
        
        plugin.show = function() {
            if (modal) {
                modal.show();
            }
        };
        
        plugin.hide = function() {
            if (modal) {
                modal.hide();
            }
        };
        
        plugin.reset = function() {
            hideError();
            $('.age-gate-date-input').val('');
            if (settings.rememberVerification) {
                document.cookie = settings.cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
            $('.page-content').removeClass('age-verified');
        };
        
        return this;
    };
    
})(jQuery);