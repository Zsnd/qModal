(function() {
    var cache = {};

    $(function() {
        $(document).off('click.modal.data-api')
            .on('click.modal.data-api', '[data-toggle="modal"]', function(e) {
                var $this = $(this),
                    href = $this.attr('href'),
                    $id = $this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')),
                    $target = $($id) //strip for ie7
                    ;
                e.preventDefault();

                var dohtml = function(html, $target2) {
                    var ctx = $(html).html();
                    $target2.html(ctx);
                    return ctx;
                };

                var doremote = function(url, dtd, $target2, dohtml2, iscache) {
                    $.get(url).done(function(html, s, jqXhr) {
                        if (jqXhr.getResponseHeader("Content-Type").indexOf("text/html") < 0) {
                            $.error("错误", html.errors && html.errors.join());
                            return dtd;
                        } else {
                            var ctx = dohtml2(html, $target2);
                            if (iscache) cache[url] = ctx;
                            return dtd.resolve();
                        }
                    });
                    return dtd;
                };
                var func = function() {
                    var dtd = $.Deferred();

                    var url = $this.attr("data-remote-ex");
                    if (url) {
                        if (!$target.length) {
                            //不存在目标，加载远程，放入body，再设置目标的事件比较麻烦。
                            //一般用来加载静态的内容。加载远程完毕之后删掉"data-remote-ex"，按照默认modal行为。
                            return doremote(url, dtd, $target, function(h1) {
                                $("body").append(h1);
                                $target = $($id);
                                $this.removeAttr("data-remote-ex");
                            });
                        } else {
                            var iscache = $target.attr("data-modal-cache") != "false";
                            if (!iscache) {
                                //远程访问得到html
                                return doremote(url, dtd, $target, dohtml);
                            } else {
                                var ctx = cache[url];
                                if (!ctx) {
                                    //远程访问得到html
                                    return doremote(url, dtd, $target, dohtml, true);
                                } else {
                                    if ($target.attr("data-modal-reset") != "false") {
                                        $target.html(ctx);
                                    }
                                    return dtd.resolve;
                                }
                            }
                        }
                    } else {
                        //不存在表示默认做法
                        return dtd.resolve();
                    }

                };

                $.when(func()).done(function() {
                    var option = $target.data('modal') ? 'toggle' : $.extend({
                        remote: !/#/.test(href) && href
                    }, $target.data(), $this.data());

                    $target.modal(option)
                        .one('hide', function() {
                            $this.focus();
                        }).off("show.modal.stopPropagation").on("show.modal.stopPropagation", ".modal-body", function(e) {
                            e.stopPropagation();
                        });

                    $target.off("success.modal.data-api").on("success.modal.data-api", "form", function() {
                        $target.modal("hide");
                    });
                });
            });
    });
})(jQuery);