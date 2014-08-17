(function($){

	var utility = {

		//update with regex
		textMatch: function(node){
			var data = node ? node.data : '',
				parent = node ? node.parentNode : null,
				re = null,
				startIndex = 0;

			re = new RegExp(textSearch.input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),textSearch.caseSensitive ? "": "i");

			startIndex = data.search(re);

			if(startIndex !== -1){
				if($(parent).is('script,noscript') || !isVisible(node)){
					return NodeFilter.FILER_REJECT;
				}
				textSearch.resultsIndex.push(startIndex);
				return NodeFilter.FILTER_ACCEPT;
			} else {
				return NodeFilter.FILER_REJECT;
			}
		},

		linkMatch: function(href){
			if(href.indexOf('http') === 0 || href.indexOf('ftp') === 0 ||  (href.length > 1 && href.indexOf('#') === 0)){
				return href;
			} else if(href[0] === '/'){
				return location.origin + href;
			} else if(href.indexOf('javascript') === 0 || href  === '#'){
				return '';
			} else {
				var pathName = location.pathname.split('/'),
					pathNameEnd,
					length = pathName.length;
				if(pathName[length-1] === ''){
					return location.origin + location.pathname;
				} else {
					pathNameEnd = pathName.slice(0,length-1);
					return location.origin + pathNameEnd.join('/') + '/' + href;
				}
			}
		},

		scrollToElement: function($el,cb){
			var scrollElements = [$el],
				$cur = $el.parent(),
				element = null,
				overflowX,
				overflowY;

			while($cur.length > 0 && !$cur.is('html, body')){
				element = $cur[0];
				overflowX = $cur.css('overflow-x');
				overflowY = $cur.css('overflow-y');
				if((element.offsetHeight < element.scrollHeight && (overflowY === 'auto' || overflowY === 'scroll')) || (element.offsetWidth < element.scrollWidth && (overflowX === 'auto' || overflowX === 'scroll'))){
				   scrollElements.unshift($cur);
				}
				$cur = $cur.parent();
			}

			var length = scrollElements.length,
				index = 0,
				$next,
				scrollTop,
				scrollLeft;

			if(length <= 1){
				$('html, body').animate({
					scrollTop: $el.offset().top - 200,
					scrolLeft: $el.offset().left - 200
				},400,cb);
			} else {
				for(;index<length-1;index++){
					$cur = scrollElements[index];
					$next = scrollElements[index+1];

					scrollTop = $next.offset().top - $cur.offset().top;
					scrollLeft = $next.offset().left - $cur.offset().left;

					if(index == length-2){
						$cur.animate({
							scrollTop: $cur.scrollTop() + scrollTop - 100,
							scrollLeft: $cur.scrollLeft() + scrollLeft - 100
						},400,cb);
					} else{
						$cur.animate({
							scrollTop: $cur.scrollTop() + scrollTop - 100,
							scrollLeft: $cur.scrollLeft() + scrollLeft - 100
						},400);						
					}

				}
			}
		},

		htmlEscape: function(str) {
		    return String(str)
		            .replace(/&/g, '&amp;')
		            .replace(/"/g, '&quot;')
		            .replace(/'/g, '&#39;')
		            .replace(/</g, '&lt;')
		            .replace(/>/g, '&gt;');
		}

	};

	function isVisible(element) {
	  var style;
	  while (element) {
	    style = window.getComputedStyle(element);
	    if (style && (style.getPropertyValue('display') == 'none' || style.getPropertyValue('visibility') == 'hidden')){
			return false;
	    }
	    element = element.parentNode;
	  }
	  return true;
	}

	window.utility = utility;

})(window.jQuery);