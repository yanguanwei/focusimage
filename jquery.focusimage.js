/*!
 * jQuery focusimage v1.0
 *
 * Copyright 2012, E-Mail: yanguanwei@qq.com, QQ: 176013294
 * Date: 2012-7-30
 */
(function ($) {

var Focusimage = function(container, options) {
	this._construct(container, options);	
};

Focusimage.prototype = {
	container	: null,	// 容器，选择器“.focusimage”，jquery对象
	list		: null,	// 图像列表，选择器“.focusimage-list li”，jquery对象数组
	indexList	: null,	// 索引列表，选择器“.focusimage-index li”，jquery对象数组
	caption		: null,	// 标题容器，选择器“.focusimage-caption”，jquery对象
	timer		: null,	// 定时器标识符，用在stop()函数中使定时器停止
	index		: 0,	// 当前的索引值
	prevIndex	: 0,	// 上一索引值
	length		: 0,	// 图像的个数
	size		: null,	// 图片大小 {width: 0, height: 0}
	_construct	: function(container, options) {	//构造函数，私有的
		this.container = container;
		//this.options = $.extend({}, $.Focusimage.defaults, options || {});
		this.options = $.Focusimage.parseOptions(this, options);
		
		this.list = this.options.imageList.call(this);
		this.size = {width: this.list.first().width(), height: this.list.first().height()};
		this.length = this.list.length;

		this.goto(this.options.startIndex);
		
		if (this.options.hasCaption)
			this.caption = this.options.caption.call(this);
			
		if (this.options.hasIndex)
			this.indexList = this.options.indexList.call(this);
		
		this.options.onConstruct.call(this);
		
		this.container.css('visibility', 'visible');
	},
	goto: function(i) {		// 移动索引到第 i 帧
		this.prevIndex = this.index;
		this.index = i % this.length;
		return this;
	},
	move: function() {	// 移动索引到下一帧
		this.goto(this.index + 1);
		return this;
	},
	focus: function() {	// 为当前帧产生一个过渡效果
		//console.log(this.container.attr('id') + ' focus index of ' + this.index);
		var activedPanel = $([]),
		self = this,
		$actived = this.list.eq(this.index);
		
		activedPanel = activedPanel.add($actived);
		if (this.indexList) {
			var $activedIndex = this.indexList.eq(this.index);
			activedPanel = activedPanel.add($activedIndex);
		}
			
		activedPanel.each(function() {
			$(this).addClass(self.options.activedClass)
				.siblings().removeClass(self.options.activedClass);					   
		});
		
		this.indexList && this.options.onIndexFocus.call(this, $activedIndex);
		this.caption && this.options.onCaptionFocus.call(this, $actived);
		this.options.onImageFocus.call(this, $actived);
		
		return this;
	},
	next: function() {	// 准备循环播放下一帧
		var self = this;
		this.timer = window.setTimeout(function() { 
			self.move().play(); 
		}, this.options.delay);
		return this;
	},
	play: function() {	// 播放当前指定的帧并准备循环播放下一帧
		this.focus().next();
		return this;
	},
	stop: function() {	// 停止过渡到下一帧的动画
		window.clearTimeout(this.timer);
		return this;
	}
};

$.Focusimage = function(container, options) {
	var fi = new Focusimage(container, options);
	//索引事件
	if (fi.options.hasIndex) {	//显示索引
		if (fi.options.indexOnClick) {	//通过点击来触发
			fi.indexList.click(function() {
				//console.log(fi.container.attr('id') + ' index click');
				var i = $(this).index();
				if (i != fi.index) {	// 需要判断当前帧是否与点击的帧的索引值相同
					fi.stop().goto(i).focus();
				}
				return false;	// 阻止点击事件的冒泡及默认行为的发生
			});
		} else {	//通过划进划出来触发
			fi.indexList.hover(function() {
				//console.log(fi.container.attr('id') + ' index hover over');
				fi.stop().goto($(this).index()).focus();
				return false;	//当索引处在容器的边界时，会同时触发container的hover over事件， 阻止事件冒泡
			}, function() {
				//console.log(fi.container.attr('id') + ' index hover out');
				//fi.next();	// 当鼠标移出整个容器时，再循环播放下一帧
				//return false;	// 不能阻止事件冒泡，应该由$container来触发hover out事件
			});
		}
	}
	//容器事件
	fi.container.hover(function() {
		//console.log(fi.container.attr('id') + ' container hover over');
		fi.stop();
	}, function() {
		//console.log(fi.container.attr('id') + ' container hover out');
		fi.next();	// 当鼠标移出整个容器时，再触发循环播放下一帧
	});
	//开始播放
	fi.play();
};

$.Focusimage.defaults = {
	captionPanelClass	: 'focusimage-caption',
	indexPanelClass		: 'focusimage-index',
	imagePanelClass		: 'focusimage-list',
	activedClass		: 'actived',
	startIndex			: 0,
	delay				: 3000,
	hasCaption			: true,
	hasIndex			: true,
	indexOnClick		: false,
	isIndexFilled		: true,
	imageList			: function() {
		return  this.container.find('.' + this.options.imagePanelClass).find('li');
	},
	indexList			: function() {
		var panel = $('<div />').append('<ul />');
		panel.addClass(this.options.indexPanelClass)
			.addClass(this.options.indexPanelClass + '-default');
		for (var i = 1; i <= this.length; i++) {
			var li = $('<li />').appendTo(panel.find('ul')).end();
			this.options.isIndexFilled && li.text(i);	//为每个索引添加当前的索引值
		}
		this.container.append(panel);
		return panel.find('li');		
	},
	caption				: function() {
		var caption = $('<div />');
		caption.addClass(this.options.captionPanelClass)
			.addClass(this.options.captionPanelClass + '-default')
			.appendTo(this.container);
		return caption;
	},
	onConstruct			: function() {},
	onCaptionFocus		: function($actived) {
		this.caption.html('<p>' + $('img', $actived).attr('alt') + '</p>');	
	},
	onImageFocus		: function($actived) {},
	onIndexFocus		: function($activedIndex) {}
};

$.Focusimage.parseOptions = function(self, options) {
	return $.extend( {}, $.Focusimage.defaults, options || {} );
};

$.fn.focusimage = function( options ) {
	this.each(function() {
		$.Focusimage($(this), options);
	});
};

}) (jQuery);