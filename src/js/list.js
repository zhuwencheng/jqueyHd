// if (typeof Function.prototype.bind !== "function") {
Function.prototype.bind = function (ctx) {
    var args = [].slice.call(arguments, 1), self = this;
    return function () {
        var innerArgs = [].slice.call(arguments);
        var finalArgs = args.concat(innerArgs);
        return self.apply(ctx, finalArgs);
    }
}

$.extend({
    select: function () {
        $('body').on('click', '.xb-c-select', function (e) {
            console.log(1);
            $(this).find('ul').show();
            e.stopPropagation();
        });
        $('body').on('click', '.xb-c-select li', function (e) {
            var text = $(this).text();
            var val = $(this).attr('data-val');
            $(this).closest('.xb-c-select').find('span').text(text);
            $(this).closest('.xb-c-select').find('span').attr('data-val', val);
            $(this).closest('ul').hide();
            e.stopPropagation();
        });
        $(document).on('click', function () {
            $('.xb-c-select').find('ul').hide();
        })
    }
});
// }
var listMain = {
    token: null,
    phone: null,
    init: function () {
        var _this = this;
        _this._renderDefaultConfig().initEvents();
        //_this._showWqDelEDig();
        return _this;
    },
    initEvents: function () {
        var _this = this;
        $.select();
        $('.signOut').on('click', _this._signOut.bind(_this));
        $('body').on('click', '.cxwq-btn', { main: _this }, _this._confirmCalWq);//取消维权
        $('body').on('click', '.sqwq-btn', { main: this }, _this._showWqDig);//维权
        $('body').on('click', '.sub-sqwq-btn', { main: this }, _this._querySqwq);//提交维权
        $('body').on('click', '.ckwq-btn', { main: this }, _this._queryWqDetail);//维权详情
        return _this;
    },


    _renderDefaultConfig: function () {
        var _this = this;
        _this.token = $.cookie('token');
        _this.phone = $.cookie('mobile');
        if(!_this.token){
            location.href="./index.html";
        }
        _this._setUserInfo();
        _this._queryOrderList();
        return _this;
    },

    _radioChange: function (e) {
        if ($(this).siblings('.xb-radio').length > 0) {
            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            } else {
                $(this).addClass('selected')
            }
        }

    },
    _setUserInfo: function () {
        var _this = this;
        $('.us').text('用户：' + _this.phone);
        return _this;
    },
    _signOut: function () {
        var _this = this;
        layer.confirm('确定退出订单页面吗？', {
            title: '提示',
            btn: ['确定', '取消'] //按钮
        }, function () {
            $.cookie('token', null);
            $.cookie('mobile', null);
            location.href = './index.html';
        });
        return _this;
    },
    _confirmCalWq: function (e) {
        var id = $(this).attr('data-orderno');
        var _this = e.data.main;
        layer.closeAll();
        layer.confirm('撤销维权后，此订单将无法再次申请维权！', {
            title: '提示',
            btn: ['确定', '取消'] //按钮
        }, function () {
            _this._queryCancelWq(id);
        });
        return _this;
    },
    //简单表单验证码
    _validator: function () {
        var _this = this;
        var needVerify = $('.layui-layer-page').find('[require]');
        var verifyStatus = true;
        needVerify.each(function (i, item) {
            var val = $.trim($(item).val());
            var t = eval($(item).attr('data-test'));
            var errorText = $(item).attr('data-error');
            if (!val || (t && !t.test(val))) {
                verifyStatus = false;
                $(item).siblings('.error').text(errorText);
                return false;
            } else {
                $(item).siblings('.error').text('');
            }
        });
        return verifyStatus;
    },
    //查询接口区域

    _queryOrderList: function (mobile) {
        var _this = this;
        var queryParams = {
            userId: _this.token,
            pageIndex: 1,
            orderFlag: 3,
            businessNo: 'yungengxin_activ'
        }
        $('.xb-pagination').setPager({
            pageindex: 1,
            pagesize: 10,
            ajax_function: function (pageindex) {
                return $.ajax({
                    url: 'http://order-server.xubei.com/order/user/findOrderByUserOrder',
                    data: $.extend({}, queryParams, { pageIndex: pageindex }),
                    dataType: 'jsonp',
                    jsonp: 'callback'
                });
            },
            successFun: function (data) {
                console.log(data.result);
                if (data.code == '1') {
                    _this._renderList(data.result);
                } else if(data.retCode == '320002'){
                    $.cookie('token', null);
                    $.cookie('mobile', null);
                    location.href = './index.html';
                } else{
                    layer.msg('加载数据失败');
                }
            },
            failFun: function (data) {
                // layer.msg('加载数据失败');
            }
        });
        return _this;
    },
    _queryCancelWq: function (id) {//撤销维权
        var _this = this;
        $.ajax({
            url: 'http://order-server.xubei.com/arbitration/overArbitration',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                userId: _this.token,
                orderNo: id,
                businessNo: 'yungengxin_activ'
            },
            success: function (data) {
                if (data.code === "1") {
                    layer.msg('撤销维权成功！');
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    layer.msg(data.message);
                }
            }
        });
        return _this
    },
    _queryWqDetail: function (e) {//维权详情
        var _this = e.data.main;
        var id = $(this).attr('data-orderno');
        $.ajax({
            url: 'http://order-server.xubei.com/arbitration/findArbitrationItem',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                userId: _this.token,
                orderNo: id,
                businessNo: 'yungengxin_activ'
            },
            success: function (data) {
                if (data.code === "1") {
                    console.log(data.result);
                    if (data.result.arbitrate_state === 0) {
                        _this._showWqDelZDig(data.result);
                    } else {
                        _this._showWqDelEDig(data.result);//1成功2失败
                    }
                } else {
                    layer.msg(data.message);
                }
            }
        });
        return _this
    },
    _querySqwq: function (e) {//申请维权
        var _this = e.data.main;
        var id = $(this).attr('data-id');
        $.ajax({
            url: 'http://order-server.xubei.com/arbitration/leaseeSubArbitration',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                userId: _this.token,
                orderNo: id,
                rightReason:$("#rights-reason").find('span').attr('data-val'),
                rightsProtection:$("#rights-protection").val(),
                businessNo: 'yungengxin_activ'
            },
            success: function (data) {
                if (data.code === "1") {
                    layer.msg('维权成功！');
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    layer.msg(data.message);
                }
            }
        });
        return _this;
    },
    //渲染页面
    _renderList: function (data) {
        var _this = this;
        var html = template('list_tem', data); //.compile
        $('#list-content').html(html);
        return _this
    },

    // 显示弹窗区域代码
    _showDialog: function (title, html, width, cb) {
        var width = width || '650px';
        var callback = function () {
            $('.layui-layer-content').height($('.layui-layer-content').height() + 40);
            typeof cb === "undefined" ? cb() : '';
        }
        return layer.open({
            type: 1,
            title: title,
            shade: 0.5,
            area: [width, 'auto'],
            content: html,
            success: callback
        });
    },
    _showWqDig: function (e) {//订单弹窗
        var _this = e.data.main;
        var id = $(this).attr('data-orderno');
        return _this._showDialog('申请维权', template('wq-dialog', { id, id }), false, null);
    },
    _showWqDelZDig: function (data) {//维权中
        var _this = this;
        return _this._showDialog('维权详情', template('wq-c-dialog', data), false, null);
    },
    _showWqDelEDig: function (data) {//维权结果
        var _this = this;
        return _this._showDialog('维权详情', template('wq-e-dialog', data), false, null);
    }
}
$(function () {
    layer.ready(function () {
        listMain.init();
    });
})