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
			$this.addClass('selected');

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

			$('html, body').animate({
	          scrollTop: data.el.offset().top - 100
	          },400);

		},100);
	}

	function clearSelect($el){
		var $selected = $el || getSelected();
		if($selected.length > 0){

			var data = $selected.data(),
				highlights = data.el.find('.ts-ce-hl'),
				content = highlights.eq(0).text();

			data.el.html(data.el.html().replace('<span class="ts-ce-hl">' + content + '</span>', content));

			$selected.removeClass('selected');
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
		return $('#text-search-extension li.selected');
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
				$next = null;

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
				$this.trigger('click').focus();
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

			if($selected.length > 0 && (evt.which === 38 || evt.which === 40)){
				if(evt.which === 38){ //up
					$prev = $selected.prev();
					if($prev.length > 0){
						$prev.trigger('click');
					}
				} else if(evt.which === 40){ //down
					$next = $selected.next();
					if($next.length > 0){
						$next.trigger('click');
					}
				}
				return false;
			}

			var $li;

			clearSelect();
			$resultSet.html('');
			$displayEl.addClass('no-results');

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
				_input;

			while ((textNode = nodeIterator.nextNode()) != null) {

				$parent = $(textNode).parent();
				startIndex = resultsIndex[i];
				_input = textNode.data.slice(startIndex, startIndex + length);

				$li = $('<li role="menuitem" tabindex="0"></li>');

				$li.text(textNode.data)
					.html($li.html().replace(_input,'<span class="ts-ce-hl">' + _input + '</span>'))
					.data({
						el: $parent,
						textEl: textNode
					});

				if(i === 0){
					$li.addClass('selected');
					$displayEl.removeClass('no-results');
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

	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){
			$displayEl = $('<div id="text-search-extension" class="no-results"><div class="search-wrap"><div class="search-wrap-inner"><input type="text" id="search" placeholder="Find in page" autocomplete="off"></input><div class="search-index-wrap"><div class="search-index">0</div>of<div class="search-total">0</div></div></div><i tabindex="0"></i></div><ul role="menu"></ul></div>');
			$('body').after($displayEl);
			$resultSet = $displayEl.find('ul');
			$searchIndex = $displayEl.find('.search-index');
			$searchTotal = $displayEl.find('.search-total');
			initSearchEvents();
			$searchField = $displayEl.find('input');
			if(window.getSelection){
				$searchField.val(window.getSelection().toString());
			}
			$searchField.trigger('keydown').focus();
		} else {
			$displayEl.toggleClass('hide-text-search');
			if(!$displayEl.hasClass('hide-text-search')){
				if(window.getSelection){
					$searchField.val(window.getSelection().toString());
				}
				$searchField.trigger('keydown').focus();
			} else {
				clearSelect();
				$resultSet.html('');
				$displayEl.addClass('no-results');
			}
		}
	}

})(window.jQuery);
