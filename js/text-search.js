//TODO: Cases
//iframes, multiple documents
(function($){

	var input = "",
		$displayEl = null,
		$searchIndex = null,
		$searchTotal =  null,
		$selected = null,
		$resultSet = null,
		caseSensitive = true;

	$(document).on('click','#text-search-extension li',selectCallback);

	initDocEvents(document);

	function selectCallback(){
		var $this = $(this),
			data = $this.data();

		clearSelect();
		$selected = $this;
		$selected.addClass('selected');

		if($resultSet.html() !== ''){
			$searchIndex.text($this.index() + 1);
			$searchTotal.text($this.siblings().length + 1);
		}

		data.textEl.html(data.textEl.html().replace(data.input,'<span class="ts-ce-hl">' + data.input + '</span>'))

		$('html, body').animate({
          scrollTop: data.textEl.offset().top - 100
          },400);
	}

	function clearSelect(){
		if($selected){
			var data = $selected.data();
			data.textEl.html(data.textEl.html().replace('<span class="ts-ce-hl">' + data.input + '</span>',data.input))
			$selected.removeClass('selected');
		}

		$searchIndex.text(0);
		$searchTotal.text(0);

	}

	function isVisible(element) {
	  while (element) {
	    style = window.getComputedStyle(element);
	    if (style && (style.getPropertyValue('display') == 'none' ||
	                  style.getPropertyValue('visibility') == 'hidden'))
	      return false;
	    element = element.parentNode;
	  }
	  return true;
	}

	function initDocEvents(doc){
		$(doc).on('keydown',function(evt){
			if(evt.which === 191 && $(evt.target).is('body')){
				toggleMenu();
				return false;
			}
		});
	}

	//add settimeout

	var keypressHandler = null;

	function initSearchEvents(){
		 $displayEl.on('keydown','input', function(evt){
		 	evt.stopPropagation();

		 	if(keypressHandler){
		 		clearTimeout(keypressHandler);
		 	}

		 	var $this = $(this);

		 	keypressHandler = setTimeout(function(){

				var $ul = $displayEl.find('ul'),
					li;

				clearSelect();
				$selected = null;
				$ul.html('');

			 	input = $this.val();

			 	if(input.trim() === ''){
			 		return;
			 	}

				var nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT,textMatch);
				var results = [];

				while ((textNode = nodeIterator.nextNode()) != null) {
					results.push(textNode);
				}

				for(var i=0; i<results.length; i++){
					var $parent = $(results[i]).parent();

					$li = $('<li role="menuitem" tabindex="-1"></li>');
					$li.text(results[i].data)
						.html($li.html().replace(input,'<span class="ts-ce-hl">' + input + '</span>'))

					if(!$selected){
						$selected = $li;
						$selected.addClass('selected');
					}

					$li.data({
						textEl: $parent,
						input: input
					});

					$ul.append($li);
				}

				if($selected){
					$selected.trigger('click');
				}

		 	}, 50);


		 }).on('click','i',toggleMenu);
	}

 	//update with regex
	function textMatch(node){
		var data = node ? node.data : '',
			parent = node ? node.parentNode : null;

		if($(parent).is('script,noscript')){
			return NodeFilter.FILER_REJECT;
		}

		if(!caseSensitive && data.toLowerCase().indexOf(input.toLowerCase()) !== -1){
			return NodeFilter.FILTER_ACCEPT;
		} else if(caseSensitive && data.indexOf(input) !== -1 && isVisible(parent)){
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILER_REJECT;
		}
	}

	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){
			$displayEl = $('<div id="text-search-extension"><div class="search-wrap"><div class="search-wrap-inner"><input type="text" id="search" placeholder="Find in page" autocomplete="off"></input><div class="search-index-wrap"><div class="search-index">0</div>of<div class="search-total">0</div></div></div><i tabindex="0"></i></div><ul role="menu"></ul></div>');
			$('body').after($displayEl);
			$resultSet = $displayEl.find('ul');
			$searchIndex = $displayEl.find('.search-index');
			$searchTotal = $displayEl.find('.search-total');
			initSearchEvents();
			$displayEl.find('input').focus();
		} else {
			$displayEl.toggleClass('hide-text-search');
			if(!$displayEl.hasClass('hide-text-search')){
				$displayEl.find('input').focus();
			}
		}
	}

})(window.jQuery);
