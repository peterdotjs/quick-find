//TODO: Cases
//iframes, multiple documents
(function($){

	var input = "",
		$displayEl = null,
		$selected = null,
		caseSensitive = true;
   
	$(document).on('click','#text-search-extension li',selectCallback);

	initDocEvents(document);

	function selectCallback(){
		var $this = $(this),
			height = $this.parent().height(),
			data = $this.data();

		clearSelect();
		$selected = $this;
		$selected.addClass('selected');

		data.textEl.html(data.textEl.html().replace(data.input,'<span class="ts-ce-hl">' + data.input + '</span>'))

		$('html, body').animate({
          scrollTop: data.offset.top - height - 20
          },400);		
	}

	function clearSelect(){
		if($selected){
			var data = $selected.data();
			data.textEl.html(data.textEl.html().replace('<span class="ts-ce-hl">' + data.input + '</span>',data.input))
			$selected.removeClass('selected');
		}		
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
			if(evt.which === 191){
				toggleMenu();
			}	
		});
	}

	//add settimeout

	var keypressHandler = null;

	function initSearchEvents(){
		 $displayEl.on('keydown','input', function(evt){

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
					var $parent = $(results[i]).parent()
						offset = $parent.offset(),
						content = results[i].data.replace(input,'<span class="ts-ce-hl">' + input + '</span>');

					$li = $('<li>' + content + '</li>');

					if(!$selected){
						$selected = $li;
						$selected.addClass('selected');
					}

					$li.data({
						offset: offset,
						textEl: $parent,
						input: input
					});

					$ul.append($li);
				}

				if($selected){
					$selected.trigger('click');
				}

		 	}, 50);


		 });
	}

 	//update with regex
	function textMatch(node){
		var data = node ? node.data : '';
		if(!caseSensitive && data.toLowerCase().indexOf(input.toLowerCase()) !== -1){
			return NodeFilter.FILTER_ACCEPT;
		} else if(caseSensitive && data.indexOf(input) !== -1 && isVisible(node.parentNode)){
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILER_REJECT;
		}
	}

	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){
			$displayEl = $('<div id="text-search-extension"><input type="text" id="search" placeholder="Find in page"></input><ul></ul></div>');
			$('body').after($displayEl);
			initSearchEvents();
			$displayEl.find('input').focus();
		} else {
			$displayEl.toggleClass('$displayEl');
			if(!$displayEl.hasClass($displayEl)){
				$displayEl.find('input').focus();
			}
		}
	}

})(window.jQuery);
