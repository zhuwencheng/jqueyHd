/**
 * Created by Administrator on 2016/7/13.
 */
(function ($) {
    $.fn.setPager = function (options) {
        var that = $(this);
        var DEFAULT_OPTIIONS = {
            pageindex: 1,
            pagesize: 10,
            totalpage: 100,
            totalNum: 1000,
            maxBlockNumber: 5,
            showNumText: false,
            showFirstAndLast: true,
            showNum: true,
            totalType: 'total',
            ajax_function: undefined  //此处为一function (pageindex,pagesize,totalpage){} ,此函数的sucess方法和error方法中必须要调用 $.fn.setPager方法
        };
        $.extend(that, DEFAULT_OPTIIONS, options);
        var genNum = function (number) {
            return $('<span class="num" data-index="' + number + '">' + number + '</span>');
        };
        //事件绑定处理
        that.off('click', 'span');
        that.on('click', 'span', function () {
            if (!($(this).hasClass('disabled') || $(this).hasClass('active'))) {
                that.pageindex = parseFloat($(this).attr('data-index'));
                that.ajax_function(that.pageindex, that.pagesize).done(function (data) {
                    if (data.result.pageCount == undefined) {
                        alert('返回数据必须包含pageCount');
                        return;
                        var totalType = that.totalType;
                        that.totalNum = data[totalType];
                    } else {
                        that.totalNum = data.result.pageCount;
                    }
                    that.totalpage = Math.ceil(that.totalNum / that.pagesize);
                    that.AjustPage();
                    that.successFun(data);
                }).fail(function (data) {
                    that.successFun(data);
                });
            }
        });
        //事件绑定处理
        that.AjustPage = function () {
            if (that.totalpage == 0) {
                that.hide();
            } else {
                that.show();
            }
            var pageNumTextHtml = '<div class="page-numtext">当前第' + that.pageindex + '页/共' + that.totalpage + '页，共' + that.totalNum + '条记录，每页' + that.pagesize + '条</div>';
            var firstHtml = '<span class="first" data-index="1">首页</span>';
            var preHtml = '<span class="pre" data-index="' + (that.pageindex > 1 ? that.pageindex - 1 : 1) + '">上一页</span>';
            var nextHtml = '<span class="next" data-index="' + (that.pageindex + 1 > that.totalpage ? that.totalpage : that.pageindex + 1) + '">下一页</span>';
            var lastHtml = '<span class="last" data-index="' + that.totalpage + '">末页</span>';
            var $numHtml = $('<div></div>');
            var loop_start, loop_end;

            if (that.pageindex + (that.maxBlockNumber - 1) > that.totalpage) {
                loop_start = (that.totalpage - (that.maxBlockNumber - 1)) <= 1 ? 1 : (that.totalpage - (that.maxBlockNumber - 1));
                loop_end = that.totalpage;
                for (var j = loop_start; j <= loop_end; j++) {
                    (j == that.pageindex) ? $numHtml.append(genNum(j).addClass("active")) : $numHtml.append(genNum(j));
                }
            }
            else {
                loop_start = that.pageindex;
                loop_end = ((that.pageindex + (that.maxBlockNumber - 1)) > that.totalpage ? that.totalpage : (that.pageindex + (that.maxBlockNumber - 1)));
                for (var k = loop_start; k <= loop_end; k++) {
                    (k == that.pageindex) ? $numHtml.append(genNum(k).addClass("active")) : $numHtml.append(genNum(k));
                }
            }
            that.html(pageNumTextHtml + firstHtml + preHtml + $numHtml.html() + nextHtml + lastHtml);
            that.pageindex <= 1 ? that.find('.first,.pre').addClass('disabled') : '';
            that.pageindex >= that.totalpage ? that.find('.next,.last').addClass('disabled') : '';

            //控制隐藏部件
            that.showNumText ? that.find('.page-numtext').show() : that.find('.page-numtext').hide();
            that.showFirstAndLast ? that.find('.first,.last').show() : that.find('.first,.last').hide();
            that.showNum ? that.find('.num').show() : that.find('.num').hide();

        };
        var firstQuery = that.ajax_function(that.pageindex, that.pagesize).done(function (data) {
            /*if(data.result.total==undefined){
                //alert('返回数据必须包含total');
                return;
            }
            that.totalNum=data.result.total;*/
            if (data.result.pageCount == undefined) {
                /*alert('返回数据必须包含total');
                 return;*/
                var totalType = that.totalType;
                that.totalNum = data[totalType];
            } else {
                that.totalNum = data.result.pageCount;
            }
            that.totalpage = Math.ceil(that.totalNum / that.pagesize);
            that.AjustPage();
            that.successFun(data);
        }).fail(function (data) {
            that.successFun(data);
        });
        return that;
    }
})(jQuery);


/*使用案例
$('.hx-pagination').setPager({
    pageindex: 1, /!*页码，从1开始，不是从0开始*!/
    pagesize: 8, /!*每页条数*!/
    ajax_function: function (pageindex, pagesize, totalpage) {
        return $.ajax({
            url: 'http://mobileserver.hanxinbank.com/integral/skuList.action',
            data: {
                "logintoken": null,
                "begin": (pageindex-1)*pagesize+1,
                "end": pageindex*pagesize
            },
            type: 'post',
            dataType: 'jsonp',
            jsonp: 'callback'
        });
    },
    successFun:function(data){
        if(data.code=='200'){
            //that._renderListHtml(data);
            //that._renderDetailHtml(data);
        }else{
            utl.showMessage(utl.messageType.fail, "加载数据失败", 2000);
        }
    },
    failFun:function(data){
        utl.showMessage(utl.messageType.fail, "加载数据失败", 2000);
    }
});*/
