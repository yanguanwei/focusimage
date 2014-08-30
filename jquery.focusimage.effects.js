/*!
 * jQuery focusimage v1.0
 *
 * Copyright 2012, E-Mail: yanguanwei@qq.com, QQ: 176013294
 * Date: 2012-7-30
 */
$.Focusimage.effects = {};

$.extend($.Focusimage.defaults, {
	effects				: 'boring',			// 默认效果
	effectClassPrefix	: 'focusimage-'	// 效果的class前缀
});

$.Focusimage.addEffect = function (name, options) {
	if ($.Focusimage.effects[name])
		return false;
	
	options = options || {};
	
	$.Focusimage.effects[name] = {
		onConstruct	: function() {},	// 使每一个效果都有一个初始化的操作
		options		: {}				// 要导入到全局配置对象中
	};
	
	if (options.onConstruct) {
		$.Focusimage.effects[name].onConstruct = options.onConstruct;
		delete options['onConstruct'];
	}
	$.Focusimage.effects[name].options = $.extend( {}, $.Focusimage.effects[name].options, options );
};

$.Focusimage.parseOptions = function(self, options) {
	options = options || {};
	options.effects = options.effects || $.Focusimage.defaults.effects;
	options.effects  = ( typeof options.effects == 'string' ) ? [options.effects ] : options.effects ;
	var effectConstructs = [];
	for (var i = 0; i < options.effects.length; i++) {
		var en = options.effects[i];
		var effect = $.Focusimage.effects[en] || null;
		if (effect) {
			options = $.extend( {}, effect.options, options);
			effectConstructs.push(effect.onConstruct);
		}
	}
	options = $.extend( {}, $.Focusimage.defaults, options );
	for (var i = 0; i < options.effects.length; i++) {
		self.container.addClass( options.effectClassPrefix + options.effects[i] );
	}
	
	options.onConstruct = function() {
		for (var i = 0; i < effectConstructs.length; i++) {
			effectConstructs[i].call(self);
		}	
	};
	
	return options;
};

//没有特效的变化效果，直接用css中的display来实现
$.Focusimage.addEffect('boring');

// 水平变化效果
$.Focusimage.addEffect('horizontal', {
	direction	: 'left',
	easingImage	: 'swing',
	duration	: 600,
	onConstruct: function() {
		if (-1 == $.inArray(this.options.direction, ['left', 'right']))
			this.options.direction = 'left';
			
		this.list.css({'float': this.options.direction});
		var style = {'width': this.size.width * this.length, 'height': this.size.height};
		style[this.options.direction] = '0px';
		this.list.parent().css(style);
	},
	onImageFocus: function($actived) {
		var offset = this.index * this.size.width * (-1),
		params = {};
		params[this.options.direction] = offset + 'px';
		$actived.parent().stop(true, true).animate(params, this.options.duration, this.options.easing, function() {});
	}				   
});

// 垂直变化效果
$.Focusimage.addEffect('vertical', {
	direction	: 'top',
	easingImage	: 'swing',
	duration	: 600,
	onConstruct	: function() {
		if (-1 == $.inArray(this.options.direction, ['top', 'bottom']))
			this.options.direction = 'top';
			
			
		if (this.options.direction == 'bottom') {
			this.list.first().parent().html(this.list.get().reverse());
		}
		var style = {'width': this.size.width, 'height': this.size.height  * this.length};
		style[this.options.direction] = '0px';
		this.list.parent().css(style);
	},
	onImageFocus: function($actived) {
		var offset = this.index * this.size.height * (-1), params = {};
		params[this.options.direction] = offset + 'px';
		$actived.parent().stop(true, true).animate(params, this.options.duration, this.options.easing, function() {});
	}   
});

// 透明度渐变效果
$.Focusimage.addEffect('gradient', {
	easingImage	: 'swing',
	duration	: 600,
	onConstruct	: function() {
		this.list.parent().css({'width': this.size.width, 'height': this.size.height});
		this.list.eq(this.index).css('z-index', 2);
	},
	onImageFocus: function($actived) {
		if (this.prevIndex != null) {
			var $prev = this.list.eq(this.prevIndex);
			$prev.css('z-index', 1);
			$prev.siblings().hide().css({'z-index': 0, 'opacity': 1});
			$actived.css('z-index', 2);
			$actived.stop(true, true).fadeIn(this.options.duration, this.options.easing, function() {});
		}
	}				   
});

// 索引缩略图显示效果
$.Focusimage.addEffect('thumbnail', {
	maskLayerClass: 'masklayer',
	maskLayerOpacity: 0.5,
	indexList: function() {
		var lis = this.container.find('div.' + this.options.indexPanelClass + ' li'),
			self = this;
		
		lis.each(function() {
			var $this = $(this),
			 	$masklayer = $('<div class="' + self.options.maskLayerClass + '" />'),
				$img = $this.find('img');
			$masklayer.css({'opacity': self.options.maskLayerOpacity});
			$this.append( $masklayer );
		});
		return lis;
	},
	onIndexFocus: function($index) {
		$index.siblings().find('.' + this.options.maskLayerClass).css('opacity', this.options.maskLayerOpacity);
		$index.find('.' + this.options.maskLayerClass).css('opacity', 0);
	}
});