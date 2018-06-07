// if (typeof Function.prototype.bind !== "function") {
Function.prototype.bind = function (ctx) {
    var args = [].slice.call(arguments, 1), self = this;
    return function () {
        var innerArgs = [].slice.call(arguments);
        var finalArgs = args.concat(innerArgs);
        return self.apply(ctx, finalArgs);
    }
}
// }
var indexMain = {
    time: 60,
    orderTime: null,
    isJs: true,
    orderMoney: 6,
    payType: 0,
    qPayTimer: null,
    init: function () {
        var _this = this;
        _this._renderDefaultConfig().initEvents();
        //_this._showSucDig();
        //_this._showCodeDig({ url: 'http://new.xubei.com/shopList.html?gameid=1494', payType: '支付宝', payMoney: '10.20' });
        return _this;
    },
    initEvents: function () {
        var _this = this;
        $('body').on('click', '.golist', _this._goListPage.bind(_this));
        $('body').on('click', '#login', _this._submitLogin.bind(_this));
        $('body').on('click', '.send-code', { main: _this }, _this._sendCode);
        $('body').on('click', '.jsbtn', { main: _this }, _this._toggleJs);
        $('body').on('click', '.xb-radio', _this._radioChange);
        $('.buy').on('click', { main: _this }, _this._createOrder);
        $('body').on('click', '#subOrder', _this._subOrder.bind(_this));
        $('body').on('click','#shlc',_this._acthorHot);
        $('body').on('click','.copy',function(){
            CopyToClipboard($('.copytext').text());
        });
        $('body').on('click','.close',function(){
            layer.closeAll();
        });
        return _this;
    },


    _renderDefaultConfig: function () {
        var _this = this;

        return _this;
    },
    _acthorHot:function(){
        layer.closeAll();
        var a=$('.cz-lc').offset().top;
        $('html,body').animate({ scrollTop: a+'px' }, 'easein');
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
    _subOrder: function () {
        var _this = this;
        var verifyResult = _this._validator();
        if (verifyResult) {
            layer.load(2);
            _this._queryLogin().done(function () {
                _this._queryCreateOrder().done(function (data) {
                    _this._queryPayUrl(data).done(function (data) {
                        _this._showCodeDig(data);
                    });
                })
            });
        };
        return _this;
    },
    _goListPage: function (e) {//去列表
        var _this = this;
        e.preventDefault();
        if (!$.cookie('token')) {
            _this._showLoginDig();
            
        }else{
            location.href="./list.html";
        }
    },
    _submitLogin: function () {//提交登录
        var _this = this;
        var verifyResult = _this._validator();
        if (verifyResult) {
            _this._queryLogin(true);
        }
    },
    _sendCode: function (e) {//发送验证码
        if ($(this).hasClass('disabled')) {
            return;
        };
        var _this = e.data.main;
        var phone = $.trim($('.layui-layer-page').find('.phone').val());
        var reg = new RegExp(/^1[0-9]{10}$/)
        if (!phone || !reg.test(phone)) {
            layer.msg('请先填写正确的手机号！')
        } else {
            _this._countDown.bind(_this, this)();
            _this._queryPhoneCode(phone);
        }
    },
    _countDown: function (dom) {//倒计时
        var _this = this;
        $(dom).addClass('disabled');
        var timer = window.setInterval(function () {
            _this.time--;
            if (_this.time < 0) {
                $(dom).removeClass('disabled');
                $(dom).text('获取短信验证码');
                _this.time = 60;
                clearInterval(timer);
            } else {
                $(dom).text(_this.time + '秒后重新获取');
            }
        }, 1000);
    },
    _createOrder: function (e) {//初始化订单
        e.preventDefault();
        var _this = e.data.main;
        _this.orderTime = parseInt($(this).attr('data-time'));
        _this.isJs = true;
        _this._showOrderDig(_this._computePrice.bind(_this));
    },
    _toggleJs: function (e) {
        var _this = e.data.main;
        var dom = this;
        window.setTimeout(function () {
            if ($(dom).hasClass('selected')) {
                _this.isJs = true;
            } else {
                _this.isJs = false;
            }
            _this._computePrice();
        }, 1);
    },
    _computePrice: function () {
        var _this = this;
        $('.layui-layer-page').find('.o-time').text(_this.orderTime);
        $('.layui-layer-page').find('.o-time-price').text(_this.orderTime.toFixed(2));
        $('.layui-layer-page').find('.o-jsq-price').text(_this.isJs ? _this.orderTime.toFixed(2) : '0.00');
        $('.layui-layer-page').find('.o-total').text(_this.isJs ? (_this.orderTime * 2).toFixed(2) : _this.orderTime.toFixed(2));

    },
    _longQueryPay: function () {
        var _this = this;
        _this.qPayTimer = window.setInterval(_this._queryIsPay.bind(_this), 1000);
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
    //验证码发送
    _queryPhoneCode: function (mobile) {
        var _this = this;
        $.ajax({
            url: 'http://user-api.xubei.com/user-api/mobileLogin/sendCode',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                mobile: mobile,
                businessNo: 'yungengxin_activ'
            },
            success: function (data) {
                if (data.code === "1") {
                    layer.msg('发送成功')
                }else{
                    layer.msg(data.message);
                };
            }
        });
        return _this;
    },
    //登录
    _queryLogin: function (isGoList) {
        var _this = this;
        var deferred = $.Deferred();//延迟方法
        $.ajax({
            url: 'http://user-api.xubei.com/user-api/mobileLogin/login',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                mobile: $.trim($('.layui-layer-page').find('.phone').val()),
                code: $.trim($('.layui-layer-page').find('.phone-code').val())
            },
            success: function (data) {
                if (data.code === "1") {
                    $.cookie('token', data.result.yxdstoken, { expires: 1 });
                    $.cookie('mobile', data.result.mobile, { expires: 1 });
                    _this.mobile = data.result.mobile;
                    _this.token = data.result.yxdstoken;
                    deferred.resolve();
                    isGoList && (location.href = './list.html');
                } else {
                    layer.closeAll();
                    layer.msg(data.message);
                    deferred.reject();
                }
            }
        });
        return deferred;
    },
    //创建订单
    _queryCreateOrder: function () {
        var _this = this;
        var deferred = $.Deferred();//延迟方法
        var queryParams = {
            count: _this.orderTime,//时间
            userId: _this.token,
            mobile: _this.mobile,
            businessNo: 'yungengxin_activ'
        }
        _this.isJs ? $.extend(queryParams, { boosterAmount: 1 }) : '';
        $.ajax({
            url: 'http://order-server.xubei.com/activity/createRandomOrder',
            dataType: "jsonp",
            jsonp: 'callback',
            data: queryParams,
            success: function (data) {
                if (data.code === "1") {
                    _this.orderMoney = data.result.booster_amount + data.result.actual_amount;
                    _this.orderNo = data.result.order_no;
                    deferred.resolve(data.result);
                } else {
                    layer.closeAll();
                    layer.msg(data.message);
                    deferred.reject();
                }
            }
        });
        return deferred;
    },
    _queryPayUrl: function (data) {
        var _this = this, payQueryUrl;
        var deferred = $.Deferred();//延迟方法
        var queryParams = {
            orderNo: data.order_no,//时间
            type: 'lease',
            businessNo: 'yungengxin_activ'
        }
        _this.payType = parseInt($('[name=pay-type].selected').attr('data-value'));
        _this.payType === 1 ? payQueryUrl = 'payBaseOrderOfWechatScan' : payQueryUrl = 'scanQRCodePayBaseOrderOfAlipay';
        $.ajax({
            url: 'http://pay-api.xubei.com/pay/' + payQueryUrl,
            // url: 'http://pay-server.t.xubei.com/pay/' + payQueryUrl,            
            dataType: "jsonp",
            jsonp: 'callback',
            data: queryParams,
            success: function (data) {
                if (data.code === "1") {
                    deferred.resolve({ url: data.result, payMoney: _this.orderMoney, payType: _this.payType === 1 ? '微信' : '支付宝' });
                } else {
                    layer.closeAll();
                    layer.msg(data.message);
                    deferred.reject();
                }
            }
        });
        return deferred;
    },
    _queryIsPay: function () {
        var _this = this
        $.ajax({
            url: 'http://order-server.xubei.com/order/user/findOrderItemByOrderNo',
            dataType: "jsonp",
            jsonp: 'callback',
            data: {
                businessNo: 'yungengxin_activ',
                orderNo: _this.orderNo,
                userId: _this.token
            },
            success: function (data) {
                if (data.code === "1") {
                    if (data.result.order_status === 2) {
                        layer.closeAll();
                        _this._showSucDig(data.result);
                        clearInterval(_this.qPayTimer);
                    } else if (data.result.order_status === 3 || data.result.order_status === 7) {
                        layer.closeAll();
                        _this._showFailDig();
                        clearInterval(_this.qPayTimer);
                    }
                }
            }
        });
        return _this;
    },
    // 显示弹窗区域代码
    _showDialog: function (title, dom, width, cb) {
        var width = width || '650px';
        var callback = function (e) {
            var content = $(e).find('.layui-layer-content');
            content.height(content.height() + 40);
            typeof cb === "function" ? cb(content) : '';
        }
        return layer.open({
            type: 1,
            title: title,
            shade: 0.5,
            area: [width, 'auto'],
            content: dom.html(),
            success: callback
        });
    },
    _showOrderDig: function (cb) {//订单弹窗
        var _this = this;
        return _this._showDialog('填写订单', $('#order-dialog'), false, cb);
    },
    _showSucDig: function (data) {//下单成功
        var _this = this;
        data.totalmoney = (data.actual_amount + data.booster_amount).toFixed(2);
        return _this._showDialog('支付成功', $('#o-suc-dialog'), false, function (ctx) {
            $(ctx).find('[data-name]').each(function(i,item){
                $(item).text(data[$(item).attr('data-name')]);
            });
        });
    },
    _showFailDig: function (cb) {//下单成功
        var _this = this;
        return _this._showDialog('支付失败', $('#o-fail-dialog'), false, cb);
    },
    _showLoginDig: function (cb) {//下单成功
        var _this = this;
        return _this._showDialog('登录', $('#login-dialog'), false, cb);
    },
    _showCodeDig: function (option, cb) {
        var _this = this;
        layer.closeAll();
        return _this._showDialog('扫码支付', $('#o-code-dialog'), 'auto', function () {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 195, //设置宽高
                height: 195
            });
            qrcode.makeCode(option.url);
            $('#paytype').html(option.payType);
            $("#payMoney").html(option.payMoney.toFixed(2));
            _this._longQueryPay();
        });
    }
}
$(function () {
    layer.ready(function () {
        indexMain.init();
    });
})