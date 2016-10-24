/**
 * @version: 0.0.1
 * @author: guopeng
 * @date: 2016-10-10
 */

!function($){
    var DatePicker = function(element,options,cb){
        if(typeof this.options !== 'object' || options == null){
            options == {};
        }

        this.parentEl = (typeof options == 'object' && options.parentEl && $(options.parentEl).length) ? options.parentEl : 'body';
        this.defaultDate = options.defaultDate;
        this.element = element;
        if(this.defaultDate) $(this.element).val(this.defaultDate);

        var htmlTemplate = '<div class="datepicker-wrapper" style="display:none">'+
                                '<div class="picker-header"></div>'+
                                '<div class="picker"></div>'+
                                '<div class="picker-footer"></div>'+
                            '</div>';
        this.container = $(htmlTemplate).appendTo($(this.parentEl));
        this.setOptions(options,cb);


        //事件
        this.element.on('click',$.proxy(this.showCalendar,this));

        this.container.find('.apply-btn').on('click',$.proxy(this.applyCalendar,this));
        this.container.find('.cancel-btn').on('click',$.proxy(this.cancelCalendar,this));

        this.container.find('.picker-header .year-prev').on('click',$.proxy(this.yearPrev,this));
        this.container.find('.picker-header .year-next').on('click',$.proxy(this.yearNext,this));
        this.container.find('.picker-header .year-group select').on('change',$.proxy(this.selectYear,this));
        this.container.find('.picker-header .month-prev').on('click',$.proxy(this.monthPrev,this));
        this.container.find('.picker-header .month-next').on('click',$.proxy(this.monthNext,this));
        this.container.find('.picker-header .month-group select').on('change',$.proxy(this.selectMonth,this));
    }

    DatePicker.prototype = {
        constructor : DatePicker,
        setOptions : function(options,cb){
            this.separator = options.separator || '-';
            this.date = new Date();
            this.year = this.date.getFullYear();
            this.month = this.date.getMonth();
            this.day = this.date.getDate();

            if(this.defaultDate){
                this.cur_day = parseInt(this.defaultDate.split(this.separator)[2]);
                this.cur_month = parseInt(this.defaultDate.split(this.separator)[1]) -1;
                this.cur_year = parseInt(this.defaultDate.split(this.separator)[0])

            }else{
                this.cur_day = this.day;
                this.cur_month = this.month;
                this.cur_year = this.year;
            }

            //自动确认
            this.autoApply = options.autoApply || false;



            this.buildHeader();
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);

        },

        monthsArr : function(year){
            //如果当前年份能被4整除但是不能被100整除或者能被400整除，即可确定为闰年，返回1，否则返回0
            var y = year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0) )  : 0;
            return new Array(31, 28+y, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
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
            var year = this.cur_year;
            var month = (this.cur_month+1).toString().length < 2 ? '0' + (this.cur_month+1) : this.cur_month+1;
            var day = this.cur_day.toString().length < 2 ? '0' + this.cur_day : this.cur_day;

            this.element.val(year+this.separator+month+this.separator+day);
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
            this.container.find('.picker td.available').on('click',$.proxy(this.selectDate,this));
        },

        setPosition :function(){
            var top = this.element.offset().top + this.element.outerHeight() + 1 ;
            var left = this.element.offset().left;

            this.container.css({top:top,left:left});
        },
        selectDate : function(e){
            e.stopPropagation();
            this.cur_day = $(e.currentTarget).find('.canlendar_date').html();
            this.container.find('.picker td').removeClass('active');
            $(e.currentTarget).addClass('active');
            if($(e.currentTarget).is('.other_next')){
                this.monthNext();
            }else if($(e.currentTarget).is('.other_prev')){
                this.monthPrev();
            }
            if(this.autoApply){
                this.applyCalendar();
            }
        },

        disabledChangeBtn : function(){
            //控制操作年份按钮可用性
            var year_first_option = this.container.find('.year-group select option:first');
            var year_last_option = this.container.find('.year-group select option:last');
            var month_first_option = this.container.find('.month-group select option:first');
            var month_last_option = this.container.find('.month-group select option:last');

            this.container.find('.year-btn').attr('disabled',false);
            if(year_first_option.prop('selected')){
                this.container.find('.year-prev').attr('disabled',true);

                //控制操作月份按钮可用性
                if(month_first_option.prop('selected')){
                    this.container.find('.month-prev').attr('disabled',true);
                }else{
                    this.container.find('.month-prev').attr('disabled',false);
                }
            }else if(year_last_option.prop('selected')){
                this.container.find('.year-next').attr('disabled',true);

                //控制操作月份按钮可用性
                if(month_last_option.prop('selected')){
                    this.container.find('.month-next').attr('disabled',true);
                }else{
                    this.container.find('.month-next').attr('disabled',false);
                }
            }
        },

        selectYear : function(){
            this.cur_year = parseInt(this.container.find('.year-group select option:selected').html());
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        yearPrev : function(){
            if(this.container.find('.year-group select option:first').prop('selected')) return
            this.container.find('.year-group select option:selected').prev().prop('selected',true);

            //设置当前年份
            this.cur_year  = parseInt(this.container.find('.year-group select option:selected').html());
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        yearNext : function(){
            if(this.container.find('.year-group select option:last').prop('selected')) return
            this.container.find('.year-group select option:selected').next().prop('selected',true);

            //设置当前年份
            this.cur_year  = parseInt(this.container.find('.year-group select option:selected').html());
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        selectMonth : function(){
            this.cur_month = parseInt(this.container.find('.month-group select option:selected').html())-1;
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        //上一月
        monthPrev : function(){
            if(this.container.find('.month-prev').attr('disabled')) return
            var last_option = this.container.find('.month-group select option:last');
            var cur_option = this.container.find('.month-group select option:selected');

            if(cur_option.prev().length){
                cur_option.prev().prop('selected',true);
            }else{
                last_option.prop('selected',true);
                this.cur_year -= 1;
                this.container.find('.year-group select option:selected').prev().prop('selected',true);
            }

            this.cur_month = parseInt(this.container.find('.month-group select option:selected').html())-1;
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        //下一月
        monthNext : function(){
            if(this.container.find('.month-next').attr('disabled')) return

            var first_option = this.container.find('.month-group select option:first');
            var cur_option = this.container.find('.month-group select option:selected');

            if(cur_option.next().length){
                cur_option.next().prop('selected',true);
            }else{
                first_option.prop('selected',true);
                this.cur_year += 1;
                this.container.find('.year-group select option:selected').next().prop('selected',true);
            }

            this.cur_month = parseInt(this.container.find('.month-group select option:selected').html())-1;
            this.updateCalendar(this.cur_year,this.cur_month,this.cur_day);
            this.disabledChangeBtn();
        },

        //构建日历头部
        buildHeader : function(){
            var _html = '';

            //确认，取消日历按钮
            _html += '<div class="operate-btn">';
            _html += '<button class="apply-btn">确定</button>';
            _html += '<button class="cancel-btn">取消</button>';
            _html += '</div>';

            //年份选择器
            var year_options = '';
            for(var yops = (this.cur_year-10);yops < (this.cur_year+10);yops++){
                year_options += (this.cur_year == yops ? '<option selected>'+yops+'年</option>' : '<option>'+yops+'年</option>');
            }
            var year_group = '<div class="check-group year-group">' +
                '<a href="javascript:;" class="year-btn year-prev">&lt;</a>' +
                '<select>'+year_options+'</select>' +
                '<a href="javascript:;" class="year-btn year-next">&gt;</a>' +
                '</div>';

            //月份选择器
            var months_options = '';
            var month = (this.cur_month+1) < 10 ? '0'+(this.cur_month+1) : (this.cur_month+1);
            for(var mops = 1;mops <= 12;mops++){
                months_options += (month == mops ? '<option selected>'+mops+'月</option>' : '<option>'+mops+'月</option>');
            }

            var months_group = '<div class="check-group month-group">' +
                '<a href="javascript:;" class="month-btn month-prev">&lt;</a>' +
                '<select>'+months_options+'</select>' +
                '<a href="javascript:;" class="month-btn month-next">&gt;</a>' +
                '</div>';
            _html += '<div class="ym-check" >'+ year_group + months_group + '</div>';

            this.container.find('.picker-header').append(_html);
        },

        //构建日历表格
        buildCalendar: function (year, month, day) {
            var y = year,
                m = month,
                d = day,
                firstday = new Date(y,m,1),
                dayofweek = firstday.getDay(),
                curMonth = this.monthsArr(this.cur_year);

            var weeks =  ['日','一','二','三','四','五','六'];

            //表格行数
            var table_row = Math.ceil((dayofweek + curMonth[m])/7);
            var _html = '<table><tr>';

            //插入星期
            for(var w = 0;w < weeks.length ;w++){
                _html += '<td>'+ weeks[w] +'</td>';
            }

            _html += '</tr>';
            for(var i = 0;i < table_row;i++){//第一层for循环创建tr标签
                _html += '<tr>';
                for(var k = 0;k < 7;k++){ //第二层for循环创建td标签
                    var index = 7 * i + k;//为每个表格创建索引,从0开始
                    var date = index - dayofweek + 1;//将当月的1号与星期进行匹配
                    if(date < 1){//上月日期
                        var pre_m = m == 0 ? 11 : m;
                        _html += '<td class="available other other_prev"><span class="canlendar_date">'+ (curMonth[pre_m-1] + date) +'</span></td>';
                    }else if(date > curMonth[m]) {//下月日期
                        _html += '<td class="available other other_next"><span class="canlendar_date">' + ( date - curMonth[m]) + '</span></td>';
                    }else if(date == this.day && this.month == m && this.year== y){//今天
                        if(d == this.day){//今天与选中重叠
                            _html += '<td class="available cur active"><span class="canlendar_date">'+date+'</span></td>';
                        }else{
                            _html += '<td class="available cur"><span class="canlendar_date">'+date+'</span></td>';
                        }
                    }else if(date == d){//当前选中
                        if(d == this.day && this.month == m && this.year== y){//选中与今天重叠
                            _html += '<td class="available cur active"><span class="canlendar_date">'+date+'</span></td>';
                        }else{
                            _html += '<td class="available active"><span class="canlendar_date">'+date+'</span></td>';
                        }
                    }else{//本月日期
                        _html += '<td class="available"><span class="canlendar_date">'+date+'</span></td>';
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
}($);

