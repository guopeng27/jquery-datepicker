/**
 * Created by Administrator on 2016/10/10.
 */



//日期


!function($){
    var DatePicker = function(element,options,cb){
        this.parentEl = 'body';
        this.element = element;
        var htmlTemplate = '<div class="datepicker-wrapper" style="display:none">'+
                                '<div class="picker-header">' +
                                    '<a href="javascript:;" class="turn-btn turn-prev">&lt;</a>'+
                                    '<button class="apply-btn">确定</button>'+
                                    '<button class="cancel-btn">取消</button>'+
                                    '<a href="javascript:;" class="turn-btn turn-next">&gt;</a>'+
                                '</div>'+
                                '<div class="picker"></div>'+
                            '</div>';
        this.container = $(htmlTemplate).appendTo($(this.parentEl));
        this.setOptions(options,cb);


        //事件
        this.element.on('click',$.proxy(this.showCalendar,this));

        this.container.find('.apply-btn').on('click',$.proxy(this.applyCalendar,this));
        this.container.find('.cancel-btn').on('click',$.proxy(this.cancelCalendar,this));

        this.container.find('.turn-prev').on('click',$.proxy(this.preMonth,this));
        this.container.find('.turn-next').on('click',$.proxy(this.nextMonth,this));
    }

    DatePicker.prototype = {
        constructor : DatePicker,
        setOptions : function(options,cb){
            this.date = new Date();
            this.year = this.date.getFullYear();
            this.month = this.date.getMonth();
            this.day = this.date.getDate();
            this.cur_day = this.day;
            this.cur_month = this.month;
            this.cur_year = this.year;


            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
        },
        showCalendar : function(){
            $('.datepicker-wrapper:visible').hide();
            this.container.show();
            $(document).off('click');
            $(document).on('click',$.proxy(this.clickOutside,this));

        },
        hideCalendar : function(){
            this.container.hide();
            $(document).off('click');
        },
        applyCalendar : function(){
            this.element.val(this.cur_year+'-'+(this.cur_month+1)+'-'+this.cur_day)
            this.hideCalendar();
        },
        cancelCalendar : function(){
            this.hideCalendar();
        },
        clickOutside : function(e){
            if($(e.target).closest(this.element).length || $(e.target).closest(this.container).length ){
                return
            }
            this.container.hide();
            $(document).off('click');
        },
        updateCalendar : function(y,m,d){
            var canlendar = this.buildCalendar(y,m,d);
            this.container.find('.picker').html(canlendar);
            this.setPosition();
            this.container.find('.picker td').on('click',$.proxy(this.selectDate,this));
        },
        setPosition :function(){
            var top = this.element.offset().top + this.element.outerHeight() + 1 ;
            var left = this.element.offset().left;
            this.container.css({top:top,left:left});
        },
        selectDate : function(e){
            this.cur_day = $(e.target).html();
            this.container.find('.picker td').removeClass('active');
            $(e.target).addClass('active');

        },
        nextMonth : function(){
            if(this.cur_month >=11){
                this.cur_month = 0;
                this.cur_year += 1;
            }else{
                this.cur_month += 1;
            }
            this.updateCalendar(this.cur_day,this.cur_month,this.cur_year);
        },
        preMonth : function(){
            if(this.cur_month <= 0){
                this.cur_month = 11;
                this.cur_year -= 1;
            }else{
                this.cur_month -= 1;
            }
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
        },
        buildCalendar: function (year, month, day) {
            var y = year,
                m = month,
                d = day,
                firstday = new Date(y,m,1),
                dayofweek = firstday.getDay(),
                months_arr = new Array(31, 28 + isLeap(y), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
            //如果当前年份能被4整除但是不能被100整除或者能被400整除，即可确定为闰年，返回1，否则返回0
            function isLeap(year){
                return year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0) )  : 0;
            }
            var weeks =  ['日','一','二','三','四','五','六'];
            var year_month
            //表格行数
            var table_row = Math.ceil((dayofweek + months_arr[m])/7);
            var _html = '<table>';
            var month = this.cur_month+1;
            month = month < 10 ? '0'+month : month;
            _html += '<tr><th colspan="7">'+ this.cur_year +'年&nbsp;'+ month + '月</th></tr>';
            _html += '<tr>';
            for(var w = 0;w < weeks.length ;w++){
                _html += '<td>'+ weeks[w] +'</td>';
            }
            _html += '</tr>';
            for(i = 0;i < table_row;i++){//第一层for循环创建tr标签
                _html += '<tr>';
                for(var k = 0;k < 7;k++){ //第二层for循环创建td标签
                    var index = 7 * i + k;//为每个表格创建索引,从0开始
                    var date = index - dayofweek + 1;//将当月的1号与星期进行匹配
                    if(date < 1){
                        var pre_m = m == 0 ? 11 : m;
                        _html += '<td class="other">'+ (months_arr[pre_m-1] + date) +'</td>';
                    }else if(date > months_arr[m]){
                        _html += '<td class="other">'+ ( date -months_arr[m]) +'</td>';
                    }else if(date == d){
                        _html += '<td class="cur active">'+date+'</td>';
                    }else{
                        _html += '<td>'+date+'</td>';
                    }
                }
                _html += '</tr>';
            }
            _html +='</table>';

            return _html;
        },
    }

    $.fn.datepicker = function(options,cb){
        this.each(function(){
            var el = $(this);
            if(el.data('datepicker')){
                el.data('datepicker').remove()
            }
            el.data('datepicker', new DatePicker(el, options, cb));
        })
        return this
    }
}($)
