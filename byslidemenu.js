var BySlideMenu = new Class({
	Implements: Options,

	options: {
		defaultIndex: false,
		expandMode: 'mouseover',
		pinMode: false,
		vertical: false,
		compressSize: 40,
		elementWidth: 320,
		elementHeight: 240,
		autoSize: true,
		duration: 'normal',
		transition: Fx.Transitions.linear
	},
	
	initialize: function(containerId, options){
		this.setOptions(options);
		this.elementsId = [];
		this.containerId = $pick(containerId, 'byslidemenu');
		
		var container = $(this.containerId);	
		
		container.addEvent('mouseleave', function(){
			this.resetAll();
		}.bind(this));
		
		var elements = container.getChildren();
		var num = elements.length;

		var imgHeight = null, imgWidth = null;
		if(this.options.autoSize)
		{
			var firstImg = elements[0].getElement('img');
		
			if(firstImg)
			{
				imgHeight = firstImg.getHeight();
				imgWidth = firstImg.getWidth();
			}
		}
		
		if(this.options.vertical)
		{
			this.posAttr = 'top';
			this.openSize = $pick(imgHeight, this.options.elementHeight);
			var containerWidth = $pick(imgWidth, this.options.elementWidth);
			var containerHeight = this.openSize + ((num - 1) * this.options.compressSize);
			this.closeSize = containerHeight / num;
			
			var elementHeight = this.openSize;
			var elementWidth = containerWidth;
		}
		else
		{
			this.posAttr = 'left';
			this.openSize = $pick(imgWidth, this.options.elementWidth);
			var containerHeight = $pick(imgHeight, this.options.elementHeight);
			var containerWidth = this.openSize + ((num - 1) * this.options.compressSize);
			this.closeSize = containerWidth / num;
			
			var elementHeight = containerHeight;
			var elementWidth = this.openSize;
		}

		container.setStyles({
			padding: 0,
			position: 'relative',
			overflow: 'hidden',
			width: containerWidth,
			height: containerHeight
		});
		
		var id = 0;
		
		elements.each(function(element){
			var beforePos = id * this.options.compressSize;
			var afterPos = this.openSize + ((id - 1) * this.options.compressSize);
			var closePos = id * this.closeSize;
			element.setStyles({
				position: 'absolute',
				height: elementHeight,
				width: elementWidth
			});
			element.setStyle(this.posAttr, closePos);
			element.set('tween', {
				duration: this.options.duration,
				transition: this.options.transition
			});
			
			id++;
			
			element.set('id', this.containerId + '_Elm' + id);
			element.store('id', id);
			
			element.store('beforePos', beforePos);
			element.store('afterPos', afterPos);
			element.store('closePos', closePos);
			
			this.elementsId.include(id);
			
			if([this.options.pinMode, this.options.expandMode].contains('mouseover'))
			{
				element.addEvent('mouseenter', function(element){
					if(this.options.expandMode == 'mouseover')
						this.expand(element, this.options.pinMode == 'mouseover');
				}.bind(this, element));
			}
			
			if(this.options.pinMode || this.options.expandMode == 'click')
			{
				element.addEvent('click', function(element){
					if(this.options.defaultIndex == element.retrieve('id'))
					{
						this.options.defaultIndex = 0;
						this.resetAll();
					}
					else if(this.options.expandMode == 'click')
						this.expand(element, this.options.pinMode == 'click');
					else
						this.options.defaultIndex = element.retrieve('id');
				}.bind(this, element));
			}

		}, this);
		
		if(this.options.defaultIndex)
			this.expand(this.options.defaultIndex, false, true);
	},
	
	expand: function(element, setDefault, noAnim){
		if($type(element) == 'number')
			element = $(this.containerId + '_Elm' + element);
		
		var currentId = element.retrieve('id');
		
		if(setDefault)
			this.options.defaultIndex = currentId;
		
		this.elementsId.each(function(elementId){
			var elm = $(this.containerId + '_Elm' + elementId);
			if(elementId > currentId)
				this.compressAfter(elm, noAnim);
			else
				this.compressBefore(elm, noAnim);
		}, this);
	},
	
	compressBefore: function(element, noAnim){
		var pos = element.retrieve('beforePos');
		var tween = element.get('tween', {property: this.posAttr, duration: this.options.duration, transition: this.options.transition});
		
		if(noAnim)
			tween.set(pos);
		else
			tween.start(pos);
	},
	
	compressAfter: function(element, noAnim){
		var pos = element.retrieve('afterPos');
		var tween = element.get('tween', {property: this.posAttr, duration: this.options.duration, transition: this.options.transition});
		if(noAnim)
			tween.set(pos);
		else
			tween.start(pos);
	},
	
	reset: function(element){
		var pos = element.retrieve('closePos');
		element.get('tween', {property: this.posAttr, duration: this.options.duration, transition: this.options.transition}).start(pos);
	},
	
	resetAll: function(){
		if(this.options.defaultIndex)
			this.expand(this.options.defaultIndex);
		else
		{
			this.elementsId.each(function(elementId){
				this.reset($(this.containerId + '_Elm' + elementId));
			}, this);
		}
	}
});