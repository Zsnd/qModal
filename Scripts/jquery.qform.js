(function () {
    "use strict";
    var QForm = function (element, options) {
        this.$form = $(element);
        this.options = options;

        var $form = this.$form;
        if ($form.data("validator") == undefined || $form.data("unobtrusiveValidation") == undefined) {
            $.validator.unobtrusive.parse($form);
        }
        $form.off("submit");
        updateParsed.call(this);
        $form.submit($.proxy(this.submit, this));
    };

    QForm.prototype = {
        constructor: QForm,

        update: function () {
            var $form = this.$form;
            $.validator.unobtrusive.parse($form);
            $form.data("validator").settings.rules = $form.data("unobtrusiveValidation").options.rules;
            $form.data("validator").settings.messages = $form.data("unobtrusiveValidation").options.messages;
        },

        submit: function (e) {
            e && e.preventDefault();
            var self = this, $form = self.$form;

            var event = $.Event('post');
            $form.trigger(event);
            
            // We check if jQuery.validator exists on the form
            if (event.isDefaultPrevented() || !$form.valid || $form.valid()) {

                $.post($form.attr('action'), $form.serializeArray())
                    .done(function (json) {
                        json = json || {};

                        // In case of success, we redirect to the provided URL or the same page.
                        if (json.success) {
                            //reset form
                            if ($form.attr("data-form-reset") != "false") {
                                $form.get(0).reset();
                                $form.validate().resetForm();
                                $form.find(".control-group").removeClass("error success");
                            }
                            if ($form.attr("data-form-redirect")) window.location = ($form.attr("data-form-redirect"));

                            $form.trigger("success", [json.data]);
                            $form.trigger("finished");
                        } else if (json.errors) {
                            displayErrors.call(self, json.errors);
                            $form.trigger("finished");
                        }
                    });
            } else {
                $form.trigger("finished");
            }

        }
    };

    //private
    var displayErrors = function (errors) {
        var $form = this.$form, summary = [];
        for (var i = 0; i < errors.length; i++) {
            if (typeof errors[i] == "string") {
                summary.push(errors.splice(i--, 1));
            }
        }

        var $summary = $form.find("[data-val-summary]"),
                position = {
                    my: "bottom right",
                    at: "bottom right",
                    viewport: $(window)
                };
        if (!$summary.length) {
            $summary = $form;
            position = {
                my: "bottom center",
                at: "top center",
                viewport: $(window)
            };
        }
        if (summary.length) {
            var ul = "<ul>" + $.map(summary.join(",").split(","), function (v) {
                return "<li>" + v + "</li>";
            }).join("") + "</ul>";
            $summary.qtip({
                content: ul,
                position: position,
                show: {
                    event: false,
                    ready: true
                },
                hide: { /*target: $form, event: "submit",*/inactive: 3000 },
                style: {
                    classes: 'qtip-red qtip-shadow qtip-rounded'
                }
            });
        } else {
            $summary.qtip("destroy");
        }

        if (errors.length) {
            $.each(errors, function (i, error) {
                var elem = '#' + error.field.replace('.', '_').replace('[', '_').replace(']', '_'),
                    $elem = $(elem);
                if (!$elem.length) {
                    elem = error.field;
                    $elem = $('[name="' + elem + '"]');
                }
                var corners = ['left center', 'right center'],
                    flipIt = $elem.hasClass("right"),
                    message = error.message;

                if (message) {
                    $elem.qtip({
                        content: message,
                        position: {
                            my: corners[flipIt ? 0 : 1],
                            at: corners[flipIt ? 1 : 0],
                            viewport: $(window)
                        },
                        show: {
                            event: false,
                            ready: true
                        },
                        hide: { /*target: $form, event: "submit",*/inactive: 3000 },
                        style: {
                            classes: 'qtip-red qtip-shadow qtip-rounded'
                        }
                    });
                }
            });
        }
    };

    var updateParsed = function () {
        var self = this, $form = self.$form,
            settings = $form.data('validator').settings;

        settings.errorPlacement = function (error, element) {
            var $elem = $(element),
                corners = ['left center', 'right center'],
                flipIt = $elem.hasClass("right");

            if (!error.is(':empty')) {
                $elem.filter(':not(.valid)').qtip({
                    overwrite: false,
                    content: error,
                    position: {
                        my: corners[flipIt ? 0 : 1],
                        at: corners[flipIt ? 1 : 0],
                        viewport: $(window)
                    },
                    show: {
                        event: false,
                        ready: true
                    },
                    hide: { target: $("a, button"), event: 'click', inactive: 3000 },
                    events: {
                        hide: function (event, api) {
                            $elem.qtip('destroy');
                        }
                    },
                    style: {
                        classes: 'qtip-red qtip-shadow qtip-rounded'
                    }
                }).qtip('option', 'content.text', error);
            } else {
                $elem.qtip('destroy');
            }
        };
        settings.success = $.noop;

        //http://twitter.github.com/bootstrap/
        settings.highlight = function (element) {
            $(element).parents(".control-group").removeClass("success").addClass("error");
        };
        settings.unhighlight = function (element) {
            $(element).parents(".control-group").removeClass("error").addClass("success");
        };
    };

    //plugin
    $.fn.qform = function (option) {
        return this.each(function () {
            var $this = $(this), data = $this.data('qform'),
                options = $.extend({}, $.fn.qform.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) $this.data('qform', (data = new QForm(this, options)));
            if (typeof option == 'string') data[option]();
            else $this.submit();
        });
    };

    $.fn.qform.defaults = {
    };

    $.fn.qform.Constructor = QForm;

    $.fn.qform.noConflict = function () {
        $.fn.qform = old;
        return this;
    };

    $(function () {
        $(document).on("click.qform.data-api", '[data-toggle="qform"]', function (e) {
            var $this = $(this),
                href = $this.attr('href'),
                $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
            ;

            e.preventDefault();

            if ($this.prop("disabled") || $this.hasClass("disabled")) {
                return;
            }

            $this.button && $this.button('loading');
            $target.on("finished", function () {
                setTimeout(function () {
                    $this.button && $this.button('reset');
                }, 100);
            }).qform();

        });
    });
})(jQuery);