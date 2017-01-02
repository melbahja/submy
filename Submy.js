/*!
 * Project: Submy
 * Description: JQuery Validation Forms and Ajax Submit Data
 * Author: Mohamed ELbahja 
 * Version: 1.1
 * Licensed under the GPL-3.0 (https://github.com/melbahja/submy/blob/master/LICENSE)
 */
;(function($, window, document, undefined) {

    "use strict";

    var $submyOptions = {
            submitId: '#submit', // default submit id
            messageId: '#formMessage', // default alert message
            formId: null,
            validOn: "submit", // valid form on change or submit ...
            rules: {},
            fileUpload: false,
            charset: 'UTF-8', // default form charset
            errConsole: true, // show console errors, logs...
            showError: [], // index 0 = in, after, before . index 1 = selector 
            jsonDone: false, // submy jsonDone 
            done: false, // ajax ajax done 
            error: false, // ajax error 
        },

        $submyMessages = {
            required: 'this field is required',
            notValid: 'this field is not valid',
            minTxt: 'minimum length is: {{min}}',
            maxTxt: 'maximum length is: {{max}}',
            minNum: 'minimum number is: {{min}}',
            maxNum: 'maximum number is: {{max}}',
            isEqual: 'error in this field',
            formNotValid: 'Please enter correct information',
        },

        $submyFileMessages = {
            required: 'please choose file',
            minSize: 'minimum file size is: {{min}}',
            maxSize: 'maximum file size is: {{max}}',
            type: 'file type is not allowed'
        },

        $submyHtmlMessages = {
            message: '<div class="alert alert-{{type}}">{{msg}}<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button></div>',
            fail: '<div class="alert alert-danger">Error please check your connection</div>',
            error: '<small class="form-text text-muted"> {{msg}} </small>',
            sending: '<i class="fa fa-spinner fa-spin"></i> Sending...'
        },

        $submyAjax = {
            method: 'POST',
            processData: true,
            data: null
        },

        $submyRegTypes = {
            number: /^\d+$/,
            text: /.+/,
            email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
            url: /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/,
            username: /^[a-zA-Z0-9\_]+$/,
        },

        $submyDataTypes = ['text', 'password', 'number', 'email', 'url', 'checkbox', 'radio', 'file', 'color', 'time', 'date', 'datetime-local', 'week', 'month', 'tel', 'range'],

        $submyNonValTypes = ['checkbox', 'radio', 'file'],

        $submyTextTypes = ['username'],

        $submyIsFunctions = {
            equal: function(val, tagret) {
                return (val === $(tagret).val());
            }
        };

    function Submy(form, options) {

        // check options is object
        if (typeof options !== 'object') {
            this.console().error('SubmyError: options is not object');
            return false;
        }

        this.$submyOptions = undefined;

        // submy options
        this.$submyOptions = $.extend({}, $submyOptions, options);

        // submy messages
        this.$submyOptions.messages = ('messages' in options) ? $.extend({}, $submyMessages, options.messages) : $submyMessages;

        // submy file messages
        this.$submyOptions.fileMessages = ('fileMessages' in options) ? $.extend({}, $submyFileMessages, options.fileMessages) : $submyFileMessages;

        // submy Html messages 
        this.$submyOptions.htmlMessages = ('htmlMessages' in options) ? $.extend({}, $submyHtmlMessages, options.htmlMessages) : $submyHtmlMessages;

        // submy ajax options	
        this.$submyOptions.ajax = ('ajax' in options) ? $.extend({}, $submyAjax, options.ajax) : $submyAjax;

        // submy rules
        this.$submyOptions.rules = ('rules' in options) ? options.rules : undefined;

        // unset
        options.messages = options.fileMessages = options.htmlMessages = options.ajax = options.rules = undefined;

        // submy defaults
        // this.$submyDefault = {};
        // this.$submyDefault = $submyOptions;
        // this.$submyDefault.messages = $submyMessages;
        // this.$submyDefault.fileMessages = $submyFileMessages;
        // this.$submyDefault.htmlMessages = $submyHtmlMessages;
        // this.$submyDefault.ajax = $submyAjax;

        try {
            this.init(form, this);
        } catch (e) {
            this.console().error(e);
        }
        return false;
    }

    Submy.prototype.inArray = function(v, arr) {

        if (Array.isArray(arr) === false) return false;
        return arr.indexOf(v) > -1;
    };

    // get form elem
    Submy.prototype.getElements = function(form) {
        return $(form + ' input, textarea, select');
    };

    // get input value
    Submy.prototype.getValue = function(data) {

        if (data.type === 'textarea') {

            return $(data).text();

        } else if (data.type === 'checkbox' || data.type === 'radio') {

            return $(data).is(':checked');
        }

        return $(data).val();
    };

    // get rules
    Submy.prototype.getSubmyRules = function(element) {

        var data = element.data('submy') || false;

        if (data !== false && typeof data === 'object') {

            return data;

        } else if (this.$submyOptions.rules !== undefined && typeof this.$submyOptions.rules === 'object' && element.get(0).name in this.$submyOptions.rules) {

            return this.$submyOptions.rules[element.get(0).name];
        }

        return false;
    };

    Submy.prototype.pregMatch = function(pattern, data) {

        return (new RegExp(pattern)).test(data);
    };

    // console
    Submy.prototype.console = function() {
        if (this.$submyOptions.errConsole === true) {
            return console;
        }

        return {
            log: function() {},
            error: function() {},
            warn: function() {}
        };
    };


    Submy.prototype.fSize = function(b) {

        if (b < 1024) {

            return b + 'bytes';

        } else if (b < 1048576) {

            return (b / 1024).toFixed(3) + 'kb';

        } else if (b < 1073741824) {

            return (b / 1048576).toFixed(3) + 'MB';
        }

        return (b / 1073741824).toFixed(3) + 'GB';
    };

    Submy.prototype.submySendRequest = function() {

        var submitBtn = $(this.$submyOptions.submitId),
            submitBtnHtml = submitBtn.html(),
            errMsgHtml = $(this.$submyOptions.messageId),
            $this = this,
            jsonData = undefined;
        errMsgHtml.html('');
        submitBtn.html(this.$submyOptions.htmlMessages.sending).attr('disabled', true);

        $.ajax(this.$submyOptions.ajax).done(function(r, s, o) {

            try {

                jsonData = $.parseJSON(r);

            } catch (e) {

                jsonData = undefined;
            }

            if (jsonData !== undefined) {

                if ($this.$submyOptions.jsonDone !== false && typeof $this.$submyOptions.jsonDone === 'callback') {

                    $this.$submyOptions.jsonDone(r, s, o);

                } else if (jsonData.type !== undefined && jsonData.message !== undefined) {

                    errMsgHtml.html($this.$submyOptions.htmlMessages.message.replace('{{type}}', jsonData.type).replace('{{msg}}', jsonData.message)).addClass('submyHtmlErrorMessage');

                } else {

                    $this.console().error('SubmyError: json data undefined');
                }

            } else if ($this.$submyOptions.done !== false && typeof $this.$submyOptions.done === 'callback') {

                $this.$submyOptions.done(r, s, o);

            } else {

                errMsgHtml.html($this.$submyOptions.htmlMessages.message.replace('{{type}}', 'danger').replace('{{msg}}', r)).addClass('submyHtmlErrorMessage');
            }

            return false;

        }).fail(function(r, s, o) {

            if ($this.$submyOptions.error !== false && typeof $this.$submyOptions.error === 'callback') {

                $this.$submyOptions.error(r, s, o);
                return false;
            }

            errMsgHtml.html($this.$submyOptions.htmlMessages.message.replace('{{type}}', 'danger').replace('{{msg}}', r)).addClass('submyHtmlErrorMessage');

            return false;

        });

        submitBtn.html(submitBtnHtml).attr('disabled', false);

        return false;
    };

    // form validation
    Submy.prototype.submyValidForm = function() {

        if (this.formElements === undefined) {
            this.console().error('SubmyError: formElements undefined');
            return false;
        }

        var k = 0,
            $v, rules, value, type, error, errorMessage;

        $(this.$submyOptions.formId).data('submyIsValidForm', false);
        $(".submyHtmlErrorMessage, .submyHtmlError").remove();
        $(this.$submyOptions.submitId).attr('disabled', true);
        this.$submyOptions.ajax.data = new FormData;

        for (; k < this.formElements.length; k++) {

            $v = $(this.formElements[k]);
            rules = this.getSubmyRules($v);
            value = this.getValue(this.formElements[k]);
            type = (rules !== false && rules.type !== undefined) ? rules.type : $v.get(0).type;
            error = false;
            errorMessage = null;

            if (typeof rules === 'object' && rules !== false) {

                rules.required = (rules.required !== undefined) ? rules.required : false;

                if (this.inArray(type, $submyNonValTypes) === false) {

                    if (rules.required !== false && value.replace(/\s/g, '') === '') {

                        error = true;
                        errorMessage = (typeof rules.required === 'boolean') ? this.$submyOptions.messages.required : rules.required;

                    }

                    if (type !== false) {

                        if (type in $submyRegTypes) {

                            if (error === false && this.pregMatch($submyRegTypes[type], value) === false) {

                                error = true;
                                errorMessage = (rules.typeMessage !== undefined) ? rules.typeMessage : this.$submyOptions.messages.notValid;
                            }
                        }

                        if (this.inArray(type, $submyTextTypes) === true) {
                            type = 'text';
                        }

                        rules.min = (rules.min !== undefined) ? rules.min : false;
                        rules.max = (rules.max !== undefined) ? rules.max : false;
                        rules.minMessage = (rules.minMessage !== undefined) ? rules.minMessage : false;
                        rules.maxMessage = (rules.maxMessage !== undefined) ? rules.maxMessage : false;

                        if (type === 'text' || type === 'password') {

                            if (error === false && rules.min !== false && value.length < rules.min) {

                                error = true;
                                errorMessage = (rules.minMessage !== false) ? rules.minMessage : this.$submyOptions.messages.minTxt;
                                errorMessage = errorMessage.replace('{{min}}', rules.min);
                            }

                            if (error === false && rules.max !== false && value.length > rules.max) {

                                error = true;
                                errorMessage = (rules.maxMessage !== false) ? rules.maxMessage : this.$submyOptions.messages.maxTxt;
                                errorMessage = errorMessage.replace('{{max}}', rules.max);
                            }

                        } else if (type === 'number') {

                            if (error === false && rules.min !== false && value < rules.min) {

                                error = ture;
                                errorMessage = (rules.minMessage !== false) ? rules.minMessage : this.$submyOptions.messages.minNum;
                            }

                            if (error === false && rules.max !== false && value > rules.max) {

                                error = true;
                                errorMessage = (rules.maxMessage !== false) ? rules.maxMessage : this.$submyOptions.messages.maxNum;
                            }

                            errorMessage = errorMessage.replace('{{min}}', rules.min).replace('{{max}}', rules.max);
                        }

                        if (error === false && rules.is !== undefined && Array.isArray(rules.is) === true && rules.is.length === 2 && rules.is[0] in $submyIsFunctions && $submyIsFunctions[rules.is[0]](value, rules.is[1]) === false) {
                            error = true;
                            errorMessage = (rules.isEqualMessage !== undefined) ? rules.isEqualMessage : this.$submyOptions.messages.isEqual;
                        }

                    } else {

                        $submy.console().warn('SubmyWarn: type not found in ' + this.formElements[k].localName + ' & name = ' + this.formElements[k].name);
                    }

                } else {

                    if (error === false && type !== false && (type === 'radio' || type === 'checkbox') && rules.required !== false) {

                        if (value === true) {

                            value = $v.val();

                        } else {

                            error = true;
                            errorMessage = (rules.required === true) ? this.$submyOptions.messages.required : rules.required;
                        }

                    } else if (type !== false && this.$submyOptions.fileUpload === true && type === 'file') {

                        if (error === false && $v[0].files[0] === undefined && rules.required !== false) {

                            error = true;
                            errorMessage = (rules.required === true) ? this.$submyOptions.fileMessages.required : rules.required;

                        } else if (error === false && rules.types !== undefined && Array.isArray(rules.types) === true && this.inArray($v[0].files[0].type, rules.types) === false) {

                            error = true;
                            errorMessage = (rules.typesMessage !== undefined) ? rules.typesMessage : this.$submyOptions.fileMessages.type;


                        } else if (error === false && rules.minSize !== undefined && $v[0].files[0].size < rules.minSize) {

                            error = true;
                            errorMessage = (rules.minSizeMessage !== undefined) ? rules.minSizeMessage : this.$submyOptions.fileMessages.minSize;
                            errorMessage = errorMessage.replace('{{min}}', this.fSize(rules.minSize));

                        } else if (error === false && rules.maxSize !== undefined && $v[0].files[0].size > rules.maxSize) {

                            error = true;
                            errorMessage = (rules.maxSizeMessage !== undefined) ? rules.maxSizeMessage : this.$submyOptions.fileMessages.maxSize;
                            errorMessage = errorMessage.replace('{{max}}', this.fSize(rules.maxSize));
                        }

                        value = $v[0].files[0];
                    }
                }

            } else {

                $submy.console().error('SubmyError: rules is not valid or not found in ' + this.formElements[k].localName + ' & name = ' + this.formElements[k].name);
            } // endIF

            if (error === true) {

                var showError, msg;
                showError = (rules.showError !== undefined && Array.isArray(rules.showError) === true) ? rules.showError : this.$submyOptions.showError;
                msg = this.$submyOptions.htmlMessages.error.replace('{{msg}}', errorMessage);
                msg = $(msg).addClass('submyHtmlError');

                if (showError.length === 0) {

                    $v.after(msg);

                } else if (showError[0] === 'before') {

                    $(showError[1]).before(msg);

                } else if (showError[0] === 'after') {

                    $(showError[1]).after(msg);

                } else if (showError[0] === 'in') {

                    $(showError[1]).html(msg);
                }

            } else {

                this.$submyOptions.ajax.data.append($v.get(0).name, value);
            }

        } // end for


        if ($(this.$submyOptions.formId).get(0).getElementsByClassName('submyHtmlError').length === 0) {

            $(this.$submyOptions.submitId).attr('disabled', false);
            $(this.$submyOptions.formId).data('submyIsValidForm', true);
            return true;
        }

        if (this.$submyOptions.validOn === 'submit') {
            $(this.$submyOptions.submitId).attr('disabled', false);
        }

        return false;
    };

    // init
    Submy.prototype.init = function($form, $this) {

        var formElements = null,
            k = 0,
            $formId = $($form.selector);

        $formId.attr('method', this.$submyOptions.ajax.method);
        $formId.attr('accept-charset', this.$submyOptions.charset);
        $formId.data('submyIsValidForm', false);

        if (this.$submyOptions.fileUpload === true) {
            $formId.attr('enctype', 'multipart/form-data');
            this.$submyOptions.ajax.processData = false;
            this.$submyOptions.ajax.contentType = false;
        }

        formElements = this.getElements($form.selector);
        this.formElements = formElements;
        this.$submyOptions.formId = $form.selector;
        $form = undefined;

        for (; k < formElements.length; k++) {

            var element = $(formElements[k]),
                rules = this.getSubmyRules(element);

            if (rules !== false && typeof rules === 'object') {

                if (rules.type !== undefined) {

                    if (this.inArray(rules.type, $submyTextTypes) === true) {
                        element.attr('type', 'text');
                    } else if (element.get(0).localName !== 'textarea') {
                        element.attr('type', rules.type);
                    }

                    if (rules.type === 'file') {

                        rules.types = (rules.types !== undefined && Array.isArray(rules.types) === true) ? rules.types : ['*/*'];
                        element.attr('accept', rules.types.join(', '));
                    }
                }

            } else {

                $submy.console().warn('submy: error data not valid or not found in ' + element.get(0).localName + ' and name="' + element.get(0).name + '"');
            }
        } // end for


        $formId.on(this.$submyOptions.validOn, function() {

            if ($this.$submyOptions.validOn === 'submit') {

                if ($this.submyValidForm() === true) {

                    try {
                        $this.submySendRequest();
                    } catch (e) {
                        $this.console().error(e);
                    }
                }

            } else {

                $this.submyValidForm();
            }

            return false;
        });

        if (this.$submyOptions.validOn !== 'submit') {

            $(this.$submyOptions.submitId).click(function() {

                if ($formId.data('submyIsValidForm') === true) {

                    try {
                        $this.submySendRequest();
                    } catch (e) {
                        $this.console().error(e);
                    }

                } else {

                    $this.submyValidForm();
                }

                return false;
            });
        }

        return false;
    };

    $.fn.submy = function $submy(o) {
        return new Submy(this, o);
    }

    return false;

})(jQuery, window, document);
