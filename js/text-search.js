//TODO: Cases
//iframes, multiple documents
(function($){

	var input = "",
		$displayEl = null,
		$searchIndex = null,
		$searchTotal =  null,
		$resultSet = null,
		$searchField = null,
		caseSensitive = false,
		resultsIndex = [];

	var selectHandler = null,
		keypressHandler = null,
		keydownHandlerLi = null;

	initDocEvents(document);

	function selectCallback(){
		var $this = $(this),
			data = $this.data(),
			$selected = getSelected();

		if(selectHandler) {
			clearTimeout(selectHandler);
		}

		selectHandler = setTimeout(function(){
			clearSelect($selected);
			$this.addClass('tse-selected');

			var scrollTop = $this.offset().top - $resultSet.offset().top;

			if((scrollTop > 0  &&  scrollTop + $this.outerHeight() > $resultSet.height()) || scrollTop < 0 &&  scrollTop + $this.height() < $resultSet.outerHeight()){
				$resultSet.animate({
					scrollTop: $resultSet.scrollTop() + scrollTop
				},400);
			}

			if($resultSet.html() !== ''){
				$searchIndex.text($this.index() + 1);
				$searchTotal.text($this.siblings().length + 1);
			}

			var startIndex = resultsIndex[$this.index()];

			//ensure modifying correct input if inputQuery occurs elsewhere in parent html.
			var textElData = data.textEl.data,
				input = textElData.slice(startIndex, startIndex + $searchField.val().length),
				newText = textElData.slice().replace(input,'<span class="ts-ce-hl">' + input + '</span>'),
				innerHTML = data.el.html();

			data.el.html(innerHTML.replace(textElData,newText));

			// $('html, body').animate({
	  //         scrollTop: data.el.offset().top - 100
	  //         },400);

			scrollToElement(data.el);

		},100);
	}

	function clearSelect($el){
		var $selected = $el || getSelected();
		if($selected.length > 0){

			var data = $selected.data(),
				highlights = data.el.find('.ts-ce-hl'),
				content = highlights.eq(0).text();

			data.el.html(data.el.html().replace('<span class="ts-ce-hl">' + content + '</span>', content));

			$selected.removeClass('tse-selected');
		}

		$searchIndex.text(0);
		$searchTotal.text(0);

	}

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

	function getSelected(){
		return $displayEl.find('li.tse-selected');
	}

	//add settimeout
	function initDocEvents(doc){
		$(doc).on('click','#text-search-extension li',selectCallback)
		.on('keydown','#text-search-extension li', listItemKeydownCb)
		.on('keydown',function(evt){
			if((evt.which === 191 || evt.which === 222 || (evt.which === 70 && evt.altKey === true)) && $(evt.target).is('body')){
				toggleMenu();
				return false;
			}
		});
	}

	function initSearchEvents(){
		 $displayEl.on('keydown','input', searchKeydownCb).on('click','i',toggleMenu);
	}

	function listItemKeydownCb(evt){
		evt.stopPropagation();

		if(keydownHandlerLi){
			clearTimeout(keydownHandlerLi);
		}

		var $this = $(this);

		keydownHandlerLi = setTimeout(function(){
			var $prev = null,
				$next = null,
				$link;

			if(evt.which === 38){ //up
				$prev = $this.prev();
				if($prev.length > 0){
					$prev.trigger('click').focus();
				} else {
					$searchField.focus();
				}
			} else if(evt.which === 40){ //down
				$next = $this.next();
				if($next.length > 0){
					$next.trigger('click').focus();
				}
			} else if(evt.which === 13){ //enter
				if($this.hasClass('tse-selected')){
					$link = $this.find('a');
					if($link.length > 0){
						location.href = $link.attr('href');
					}
				} else {
					$this.trigger('click').focus();
				}
			}
			return false;
		},100);
	}

	function searchKeydownCb(evt){
		evt.stopPropagation();
		//check for invalid key inputs and return

		if(keypressHandler){
			clearTimeout(keypressHandler);
		}

		var $this = $(this);

		keypressHandler = setTimeout(function(){
			var $prev = null,
				$next = null,
				$selected = getSelected();

			if($selected.length > 0){
				if(evt.which === 38){ //up
					$prev = $selected.prev();
					if($prev.length > 0){
						$prev.trigger('click');
					}
					return false;
				} else if(evt.which === 40){ //down
					$next = $selected.next();
					if($next.length > 0){
						$next.trigger('click');
					}
					return false;
				} else if(evt.which === 13){ //enter
					$link = $selected.find('a');
					if($link.length > 0){
						location.href = $link.attr('href');
					}
					return false;
				}
			}

			var $li;

			clearSelect();
			$resultSet.html('');
			$displayEl.addClass('tse-no-results');

			input = $this.val();

			if(input.trim() === ''){
				return;
			}

			resultsIndex = [];

			// var start = new Date();

			var nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT,textMatch),
				textNode = null,
				length = input.length;


			// var tag1 = new Date();

			var i =0,
				$parent,
				startIndex,
				_input,
				href,
				processedHref,
				$closestAnchor;

			while ((textNode = nodeIterator.nextNode()) != null) {

				$parent = $(textNode).parent();
				startIndex = resultsIndex[i];
				_input = textNode.data.slice(startIndex, startIndex + length);

				$li = $('<li role="menuitem" tabindex="0"><div class"tse-li-inner">' + textNode.data + '</div></li>');

				$li.html($li.html().replace(_input,'<span class="ts-ce-hl">' + _input + '</span>'))
					.data({
						el: $parent,
						textEl: textNode
					});

				$closestAnchor = $parent.closest('a');
				if($closestAnchor.length > 0){
					href = $closestAnchor.attr('href');
					processedHref = linkMatch(href);
					if(processedHref !== ''){
						$li.append('<a href="' + href + '"' + ' title="'+ processedHref + '">' + processedHref + '</a>');	
					}
				}

				if(i === 0){
					$li.addClass('tse-selected');
					$displayEl.removeClass('tse-no-results');
				}

				$resultSet.append($li);

				i++;
			}

			// var tag2 = new Date();

			// console.log("tag1: " + (tag1 - start));
			// console.log("tag2: " + (tag2 - start));
			// console.log(input);

			getSelected().trigger('click');

		}, 150);
	}

	function linkMatch(href){
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
	}

	//update with regex
	function textMatch(node){
		var data = node ? node.data : '',
			parent = node ? node.parentNode : null,
			re = null,
			startIndex = 0;

		re = new RegExp(input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),caseSensitive ? "": "i");

		startIndex = data.search(re);

		if(startIndex !== -1){
			if($(parent).is('script,noscript') || !isVisible(node)){
				return NodeFilter.FILER_REJECT;
			}
			resultsIndex.push(startIndex);
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILER_REJECT;
		}
	}

	function scrollToElement($el){
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
			position;

		if(length <= 1){
			$('html, body').animate({
				scrollTop: $el.offset().top - 100,
				scrolLeft: $el.offset().left - 100
			},400)
		} else {
			for(;index<length-1;index++){
				$cur = scrollElements[index];
				$next = scrollElements[index+1];
				//need to handle scroll width
				$cur.animate({
					scrollTop: $next.position().top - 100,
					scrolLeft: $next.position().left - 100
				},400)
			}
		}
	}

	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){
			$displayEl = $('<div id="text-search-extension" class="tse-no-results"><div id="tse-search-wrap"><div id="tse-search-wrap-inner"><input type="text" id="tse-search" placeholder="Find in page" autocomplete="off"></input><div id="tse-search-index-wrap"><div id="tse-search-index">0</div>of<div id="tse-search-total">0</div></div></div><i tabindex="0"></i></div><ul role="menu"></ul></div>');
			$('body').after($displayEl);
			$resultSet = $displayEl.find('ul');
			$searchIndex = $displayEl.find('#tse-search-index');
			$searchTotal = $displayEl.find('#tse-search-total');
			initSearchEvents();
			$searchField = $displayEl.find('input');
			if(window.getSelection){
				$searchField.val(window.getSelection().toString());
			}
			$searchField.trigger('keydown').focus();
		} else {
			$displayEl.toggleClass('tse-hide-text-search');
			if(!$displayEl.hasClass('tse-hide-text-search')){
				if(window.getSelection){
					$searchField.val(window.getSelection().toString());
				}
				$searchField.trigger('keydown').focus();
			} else {
				clearSelect();
				$resultSet.html('');
				$displayEl.addClass('tse-no-results');
			}
		}
	}

})(window.jQuery);
