# 说明

jquery.qmodal.js 是一个jquery插件。扩展了[Bootstrap](https://github.com/twitter/bootstrap)原生modal插件，增强了ajax获取modal内容的部分。

[]() 可以看到更多说明和例子。

## 阻止 `show` 冒泡
很多bootstrap系列的插件提供了 `show` 事件。`show` 事件会冒泡执行。
这会造成问题，例如：当modal中存在一个tab插件时，切换tab会触发 `show` 事件，
之后会冒泡并执行modal的 `show` 事件。往往会发生意料之外的情况。本插件阻止了 `show` 事件的冒泡。具体代码类似如下：

    <div id="test-div">
        <button>btn</button>
    </div>
    
    <script>
        $(function () {
            $("#test-div").on("click", "button", function (e) {
                e.stopPropagation();
                alert("btn clicked");
            }).on("click", function () {
                alert("div clicked");
            });
        })
    </script>

同理可以阻止其他事件冒泡。


## 需求
 - [Bootstrap3](http://getbootstrap.com/)
 - [qForm](https://github.com/Zsnd/qForm/) - form悬浮气泡验证支持。

##data-api

**可以通过设置按钮元素属性来使用内置功能。**

###data-remote-ex="url"

加载url指定的html内容。

**可以通过设置modal元素属性来使用内置功能。**

###data-modal-cache="false"

默认会缓存加载的html。当加载的内容可能会变化，比如此modal用来显示不同的产品，不同产品的具体内容均不相同，缓存会占用过多内存。使用此api禁用缓存。

###data-modal-reset="false"

默认当缓存有效时，每次呈现modal都会恢复其内容为缓存内容，这样设计是为了解决：

 - modal中form的内容已经被填写了，用form.reset()也没有办法恢复。
 - modal的html按照需求做了调整。

使用此api禁用此行为。

##总结
 - 原生modal不受影响。
 - 当使用 `data-remote-ex="url"`。远程页面缓存，每次显示时均还原为缓存页面。(create)
 - 当使用 `data-remote-ex="url"` `data-modal-cache="false"`。远程页面不缓存，每次显示时均为最新远程页面。(detail, edit)
 - 当使用 `data-remote-ex="url"` `data-modal-reset="false"`。远程页面缓存，每次显示时均为上次编辑之后的页面。(使用qForm时，需要 `data-form-reset="false"`)

另外，当使用了 `data-remote-ex="url"`，而页面上不存在目标页面 `<div id="..." class="modal large hide fade" ...></div>`时，将会加载原创页面，并附加在body中，之后类似原生modal。(不推荐)