$(function () {
    'use strict';

    //**********************************
    // Set focus to the first text field
    //**********************************
    const $name = $('#name');
    $name.focus();

    //******************************************************************
    // Show the "Job role" input field if the "Other" option is selected
    //******************************************************************
    const $jobRoleOption = $('#title');
    const $jobRoleField = $('#other-title').hide();

    toggleJobRoleField();
    $jobRoleOption.on('change', toggleJobRoleField);

    function toggleJobRoleField() {
        $jobRoleOption.val() === 'other' ? $jobRoleField.show() : $jobRoleField.hide();
    }

    //***********************************************
    // Show the t-shirt color depending on the design
    //***********************************************
    const $tshirtDesign = $('#design');
    const $tshirtColorOptions = $('#color option');
    const $colorSection = $('#colors-js-puns');

    const tshirt = {
        showAllColors: () => {
            $tshirtColorOptions.map((index, element) => {
                $(element).show();
            });
        },

        hideAllColors: () => {
            $tshirtColorOptions.map((index, element) => {
                $(element).hide();
            });
        },

        'js puns': () => {
            $tshirtColorOptions.map((index, element) => {
                if (index < 3) $(element).show();
                else $(element).hide();
            });

            $("#color").val('cornflowerblue');

            $('#design option:first-of-type').text("Don't want stupid T-Shirt");
        },

        'heart js': () => {
            $tshirtColorOptions.map((index, element) => {
                if (index > 2) $(element).show();
                else $(element).hide();
            });

            $("#color").val('tomato');

            $('#design option:first-of-type').text("Don't want stupid T-Shirt");
        },

        showShirts: function (design) {
            if (design.toLowerCase() === 'select theme' || design.toLowerCase() === "don't want stupid t-shirt") {
                $("#color").val('');
                this.hideAllColors();
                $colorSection.hide();
                return;
            } else {
                $colorSection.show();
            }

            this.showAllColors();
            this[design]();
        }
    };

    tshirt.showShirts($tshirtDesign.val());
    $tshirtDesign.on('change', () => tshirt.showShirts($tshirtDesign.val()));

    //******************************************************************
    // Don't allow to register for activities which are at the same time
    //******************************************************************

    // Create a totalPrice element and append it to the DOM
    let totalPrice = 0;
    $('.activities').append(`<div id="price">Total: $${totalPrice}</div>`);
    
    // Get all of the checked checkboxes on pageload or after reload and if there are any - Manage the Activities
    const allCheckedCheckBoxes = $('.activities input:checkbox:checked');

    $.each(allCheckedCheckBoxes, (key, checkbox) => {
        manageActivity.call($(checkbox));
    });

    // If the user clicks on any of the checkboxes Manage The Activities
    $('input[type=checkbox]').on('click', manageActivity);

    function manageActivity() {
        const labels = $('.activities label');
        const isChecked = $(this).prop('checked');

        const dateAndTimeRegex = /[a-zA-Z]+\s[1-9]{1,2}(am|pm)-[1-9]{1,2}(am|pm)/;
        const priceRegex = /\$\d+/;

        const selectedCheckbox = $(this).parent().text();
        const selectedCheckboxDateAndTime = $(this).parent().text().match(dateAndTimeRegex) ? $(this).parent().text().match(dateAndTimeRegex)[0] : undefined;
        const selectedCheckboxPrice = Number($(this).parent().text().match(priceRegex)[0].substring(1));

        if(isChecked) {
            totalPrice += selectedCheckboxPrice;
        } else {
            totalPrice -= selectedCheckboxPrice;
        }

        $('#price').text(`Total: $${totalPrice}`);

        $.each(labels, (key, currentLabel) => {

            const currentLabelText = $(currentLabel).text();
            const currentCheckbox = $(currentLabel).children()[0];
            const currentCheckboxDateAndTime = currentLabelText.match(dateAndTimeRegex) ? currentLabelText.match(dateAndTimeRegex)[0] : undefined;
            const currentCheckboxPrice = Number(currentLabelText.match(priceRegex)[0].substring(1));

            if(currentLabelText !== selectedCheckbox && selectedCheckboxDateAndTime === currentCheckboxDateAndTime) {
                if(isChecked) {
                    $(currentCheckbox).attr('disabled', 'disabled');
                    $(currentLabel).css('color', '#728d9b');
                } else {
                    $(currentCheckbox).removeAttr('disabled');
                    $(currentLabel).css('color', '#000');
                }   
            }

        });
    }

    //************************************
    // Display the selected payment method
    //************************************
    showPaymentMethod();
    $('#payment').on('change', showPaymentMethod);
    
    function showPaymentMethod() {
        const paymentMethod = $(this).val();

        const creditcardSection = $('#credit-card');
        const paypalSection = $('#credit-card + div');
        const bitcoinSection = $('#credit-card + div + div');

        creditcardSection.hide();
        paypalSection.hide();
        bitcoinSection.hide();

        switch(paymentMethod) {
            case 'paypal':
                paypalSection.show();
            break;

            case 'bitcoin':
                bitcoinSection.show();
            break;

            default:
                creditcardSection.show();
            break;
        }


    }

    //************************************
    // Validate the information
    //************************************
    let isFormValid = false;

    // Validation colors
    const err = { color: '#DC143C' };
    const valid = { color: '#000', borderColor: '#c1deeb'};

    // Get the needed elements
    const $email = $('#mail');
    const $selectJob = $('#title');
    const $otherJobTitle = $('#other-title');
    const $activities = $('.activities input:checkbox');
    const $cardNumber = $('#cc-num');
    const $zipCode = $('#zip');
    const $cvv = $('#cvv');

    // Validate the data while the user is typing
    $name.on('change, blur', validateName);
    $email.on('change, blur', validateEmail);
    $selectJob.on('change', validateJobRole);
    $otherJobTitle.on('change, blur', validateJobRole);
    $activities.on('click', validateActivities);
    $cardNumber.on('change, blur', validateCardNumber);
    $zipCode.on('change, blur', validateZip);
    $cvv.on('change, blur', validateCvv);

    // Validate the data upon submition
    $('form').on('submit', validateSubmitedData);

    function validateSubmitedData(e) {
        e.preventDefault();

        validateName();
        validateEmail();
        validateJobRole();
        validateTshirtDesign();
        validateActivities();
        validatePayment();

        if(isFormValid) {
            $('form').html('Congratulations!<br/>You registered successfully for the Full Stack Conf.');
        }
    }

    // All the validation methods

    function validateName() {
        const nameRegex = /[a-zA-Z]+/;
        const isNameValid = nameRegex.test($name.val());
        const $nameLabel = $name.prev();

        if($name.val().trim() === '') {
            $nameLabel.text('Please enter your Name').css('color', err.color);
            $name.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else if(!isNameValid) {
            $nameLabel.text('Please enter valid Name').css('color', err.color);
            $name.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else {
            $nameLabel.text('Name:').css('color', valid.color);
            $name.css('border', `2px solid ${valid.borderColor}`);
            
            isFormValid = true;
        }
    }

    function validateEmail() {
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        const $email = $('#mail');
        const isEmailValid = emailRegex.test($email.val());
        const $emailLabel = $email.prev();

        if($email.val().trim() === '') {
            $emailLabel.text('Please enter your Email').css('color', err.color);
            $email.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else if(!isEmailValid) {
            $emailLabel.text('Please enter valid Email').css('color', err.color);
            $email.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else {
            $emailLabel.text('Email:').css('color', valid.color);
            $email.css('border', `2px solid ${valid.borderColor}`);

            isFormValid = true;
        }
    }

    function validateJobRole() {
        const selectedJobRole = $('#title').val();
        const $jobRoleLabel = $('#title').prev();
        const $otherJobRoleField = $('#other-title');

        if(selectedJobRole === 'other') {

            if($otherJobRoleField.val() === '') {
                $jobRoleLabel.text('Please enter your Job Role').css('color', err.color);
                $otherJobRoleField.css('border', `2px solid ${err.color}`);

                isFormValid = false;
            } else {
                $jobRoleLabel.text('Job Role').css('color', valid.color);
                $otherJobRoleField.css('border', `2px solid ${valid.borderColor}`);

                isFormValid = true;
            }
        } else {
            $jobRoleLabel.text('Job Role').css('color', valid.color);
            $otherJobRoleField.css('border', `2px solid ${valid.borderColor}`);

            isFormValid = true;
        }
    }

    function validateActivities() {
        const checkedActivities = $('.activities input:checkbox:checked');
        const $activitiesLabel = $('.activities > legend');

        if(!checkedActivities.length) {
            $activitiesLabel.text('Please select at least one activity').css('color', err.color);

            isFormValid = false;
        } else {
            $activitiesLabel.text('Register for Activities').css('color', valid.color);

            isFormValid = true;
        }
    }

    function validatePayment() {
        const $payment = $('#payment');
        const paymentMethod = $payment.val();

        if(paymentMethod === 'credit card') {
            validateCardNumber();
            validateZip();
            validateCvv();
        }
    }

    function validateCardNumber() {
        validateElement('#cc-num', /^(\d{13,16})$/, 'Please enter your Card Number', 'Please enter valid Card Number', 'Card Number:');
    }

    function validateZip() {
        validateElement('#zip', /^(\d{5})$/, 'Please enter Zip', 'Invalid Zip', 'Zip Code:');
    }

    function validateCvv() {
        validateElement('#cvv', /^(\d{3})$/, 'Please enter CVV', 'Invalid CVV', 'CVV:');
    }

    function validateElement(selector, regex, emptyMessage, invalidMessage, labelText) {
        const $element = $(selector);
        const $elementLabel = $element.prev();
        let isDataValid = regex.test($element.val());
        
        if($element.val() === '') {
            $elementLabel.text(emptyMessage).css('color', err.color);
            $element.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else if(!isDataValid) {
            $elementLabel.text(invalidMessage).css('color', err.color);
            $element.css('border', `2px solid ${err.color}`);

            isFormValid = false;
        } else {
            $elementLabel.text(labelText).css('color', valid.color);
            $element.css('border', `2px solid ${valid.borderColor}`);

            isFormValid = true;
        }
    }
    
});