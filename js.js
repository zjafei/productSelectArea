/**
 * User: Eric Ma
 * Email: zjafei@gmail.com
 * Date: 2015/7/6
 * Time: 8:53
 */
define(function (require, exports, module) {
    var $body = $('body'),
        cb = function () {},
        areaNameAry = [],
        areaIdAry = [],
        dialogPlus = require('dialogPlus'),
        areadialog = null,
        domHtml = '',
        areaDialogDomTemp = $('<div style="display: none">' +
        '<div class="product-select-area-title" id="productSelectAreaTitle"></div>' +
        '<div class="product-select-area-list" id="productSelectAreaList"></div>' +
        '</div>');

    //创建选择框头部
    function createAreaHead(idAry, nameAry) {
        var h = '',
            cur = '';

        $.each(nameAry, function (i, t) {
            if (i === nameAry.length - 1) {
                cur = ' cur';
            }
            h += '<div pid="' + idAry[i] + '" class="js-product-select-area-title' + cur + '">' + nameAry[i] + ' <span class="glyphicon glyphicon-triangle-bottom"></span></div>';
        });
        $('#productSelectAreaTitle').html(h);
    }

    //获取地区资源
    function getAreaData(pid, callback, id) {
        $.ajax({
            type: 'post',
            url: APP_PATH+'/Enterprise/country',
            data: 'id=' + pid,
            async: false,
            dataType: 'json',
            success: function (data) {
                switch (data.status) {
                    case 1:
                        createAreaList(data.areaList, id);
                        callback();
                }
            },
            error: function () {
                alert('网络错误');
            }
        });
    }

    //创建地区列表
    function createAreaList(data, id) {
        var h = '';
        $.each(data, function () {
            h += '<div class="js-product-select-area-btn" i="' + this.id + '">' + this.name + '</div>';
        });
        $('#productSelectAreaList').html(h);
        if (typeof id === "string" && id !== '') {
            $('.js-product-select-area-btn[i = "' + id + '"]').addClass('cur');
        }
    }

    $body.append(areaDialogDomTemp);


    //点击切换门
    $body.on('click', '.js-product-select-area-title', function () {
        var myThis = $(this);
        var index = myThis.index();
        if (!myThis.hasClass('cur')) {
            getAreaData(myThis.attr('pid'), function () {
                var tab = $('.js-product-select-area-title');
                tab.removeClass('cur');
                myThis.html('请选择 <span class="glyphicon glyphicon-triangle-bottom"></span>').addClass('cur');
                $.each(tab, function () {
                    var myThis = $(this);
                    if (myThis.index() > index) {
                        myThis.hide();
                        areaNameAry[index] = '';
                        areaIdAry[index] = '';
                    }
                });
                $('.js-product-select-area-btn').attr('index', index);
            });
        }
    });

    //点击地区
    $body.on('click', '.js-product-select-area-btn', function () {
        var myThis = $(this);
        var id = myThis.attr('i'),
            tab = $('.js-product-select-area-title'),
            index = parseInt(myThis.attr('index')),
            hasCur = myThis.hasClass('cur'),
            areaText = myThis.text();
        if (index === areaNameAry.length - 1) {//是不是最后一级
            if (!hasCur) {
                areaNameAry[index] = areaText;
                areaIdAry[index] = id;
                $('.js-product-select-area-btn').removeClass('cur');
                $('.js-product-select-area-btn[i="' + id + '"]').addClass('cur');
                $(tab[index]).html(areaText + ' <span class="glyphicon glyphicon-triangle-bottom"></span>');
                domHtml = $('#_PRODUCTSELECTAREA').html();
            }
            cb({"areaName": areaNameAry, "areaId": areaIdAry});
            areadialog.remove();
        } else {
            myThis.addClass('cur');
            $('.js-product-select-area-btn').removeClass('js-product-select-area-btn');

            getAreaData(id, function () {
                tab.removeClass('cur');
                areaNameAry[index] = areaText;
                areaIdAry[index] = id;
                $(tab[index]).html(areaText + ' <span class="glyphicon glyphicon-triangle-bottom"></span>');
                index++;
                $(tab[index]).html('请选择 <span class="glyphicon glyphicon-triangle-bottom"></span>').addClass('cur').show();
                $('.js-product-select-area-btn').attr('index', index);
            });
        }

    });

    module.exports = function ($dom, idAry, nameAry, callback) {
        if (typeof callback === "function") {
            cb = callback;
        }
        var that = $dom[0];
        areadialog = dialogPlus({
            skin: '_PRODUCTSELECTAREA',
            cssUri: seajs.data.base + 'modules/widget/productSelectArea/css.css',
            padding: 10,
            fixed: false,
            quickClose: true,
            width: 415
        });
        if (domHtml === '') {//判断是不是第一次加载
            areaIdAry = idAry;//地区id数组
            areaIdAry.unshift('');
            getAreaData(areaIdAry[areaIdAry.length - 2], function () {
                areaNameAry = nameAry;
                createAreaHead(areaIdAry, areaNameAry);
                $('.js-product-select-area-btn').attr('index', areaNameAry.length - 1);
                domHtml = areaDialogDomTemp.html();
                areaDialogDomTemp.html('');
                areadialog.content('<div id="_PRODUCTSELECTAREA">' + domHtml + '</div>');
                areadialog.show(that);
                areaIdAry.shift();
                areaDialogDomTemp.remove();
                areaDialogDomTemp = null;
            }, areaIdAry[areaIdAry.length - 1]);
        } else {
            areadialog.content('<div id="_PRODUCTSELECTAREA">' + domHtml + '</div>');
            areadialog.show(that);
        }
        return areadialog;
    };
});