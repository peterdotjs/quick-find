//TODO: Cases
//iframes, multiple documents
(function($){

	textSearch = {
		input: '',
		resultsIndex: [],
		resultLimit: 500,
		nodeIteratorPlaceholder: null,
		nodeIteratorIndex: 0,
		matchCase: false,
		linksOnly: false,
		highlightAll: false
	};

	var	$displayEl = null,
		$searchIndex = null,
		$searchTotal =  null,
		$resultSet = null,
		$searchField = null,
		selectHandler = null,
		keypressHandler = null,
		keydownHandlerLi = null;

	initDocEvents(document);

	//add settimeout
	function initDocEvents(doc){
		$(doc).on('keydown',function(evt){
			if((evt.which === 191 || evt.which === 222 || (evt.which === 70 && evt.ctrlKey === true && evt.shiftKey === true)) && $(evt.target).is('body')){
				toggleMenu();
				if(evt.which === 222){ //enable links mode
					textSearch.linksOnly = true;
					$displayEl.find('#tse-links-only').addClass('tse-option-select');
				} else if (evt.which === 191){ //disable links mode
					textSearch.linksOnly = false;
					$displayEl.find('#tse-links-only').removeClass('tse-option-select');					
				}
				return false;
			}
		});
	}

	function initSearchEvents(){
		 $searchField.on('keydown',function(evt){ //prevent cursor from moving
		 	if(evt.which === 40 || evt.which === 38){
		 		evt.preventDefault();
		 	}
		 });
		 $displayEl.on('keydown','input', searchKeydownCb)
		 .on('click','i',toggleMenu)
		 .on('click','li',selectCallback)
		 .on('keydown','li',listItemKeydownCb)
		 .on('click', '#tse-options span', function(evt){
		 	optionsCb($(this));
		 });
	}

	//handles menu toggle on target page
	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){ //menu has not been initialized
			$displayEl = $('<div id="text-search-extension" class="tse-no-results"><div id="tse-search-wrap"><div id="tse-search-wrap-inner"><input type="text" id="tse-search" placeholder="Find in page" autocomplete="off"></input><div id="tse-search-index-wrap"><div id="tse-search-index">0</div>of<div id="tse-search-total">0</div></div></div><i tabindex="0"></i></div><div id="tse-options"><span id="tse-match-case">Match <u>C</u>ase</span><span id="tse-links-only"><u>L</u>inks Only</span><span id="tse-highlight-all">Highlight <u>A</u>ll</span></div><ul role="menu"></ul></div>');
			$('body').after($displayEl);
			$resultSet = $displayEl.find('ul');
			$searchIndex = $displayEl.find('#tse-search-index');
			$searchTotal = $displayEl.find('#tse-search-total');
			$searchField = $displayEl.find('input');
			initSearchEvents();
			initMenu();
		} else { //menu already initialized
			$displayEl.toggleClass('tse-hide-text-search'); //show || hide
			if(!$displayEl.hasClass('tse-hide-text-search')){ 
				initMenu(); //init menu
			} else { 
				clearMenu(); //reset menu
			}
		}
	}

	//sets the input with highlight selection
	function initMenu(){
		if(window.getSelection){
			$searchField.val(window.getSelection().toString());
		}
		$searchField.trigger('keydown').focus(); //highlights the first result
	}

	function clearMenu(){
		clearSelect();
		updateSearchCounts(0,0);
		$resultSet.empty();
		$displayEl.addClass('tse-no-results');		
	}

	function optionsCb($el){
		var id = $el.attr('id');
		$el.toggleClass('tse-option-select');
		switch (id) {
			case "tse-match-case":
				textSearch.matchCase = textSearch.matchCase ? false : true; //toggle
				break;
			case "tse-links-only":
				textSearch.linksOnly = textSearch.linksOnly ? false : true; //toggle
				break;
			case "tse-highlight-all":
				textSearch.highlightAll = textSearch.highlightAll ? false : true; //toggle
				break;
			default:
				break;
		}
		$searchField.trigger('keydown').focus(); 
	}

	function searchKeydownCb(evt){
		evt.stopPropagation();
		//check for invalid key inputs and return
		if(keypressHandler){
			clearTimeout(keypressHandler);
		}

		var $this = $(this);

		keypressHandler = setTimeout(function(){
			var specialKeyHandler = handleSpecialKeys(evt);
			if(specialKeyHandler === false){
				return false;
			}
			clearMenu();
			textSearch.input = $this.val();
			if(textSearch.input.trim() === ''){
				return;
			}
			textSearch.resultsIndex = [];
			processSearch();
		}, 150);
	}

	function listItemKeydownCb(evt){
		evt.stopPropagation();
		if(keydownHandlerLi){
			clearTimeout(keydownHandlerLi);
		}
		var $this = $(this);
		keydownHandlerLi = setTimeout(function(){
			var specialKeyHandler = handleSpecialKeys(evt,$this,'li');
			if(specialKeyHandler === false){
				return false;
			}
		},100);
	}

	//event handlers
	function selectCallback(){
		var $this = $(this),
			data = $this.data(),
			$selected = getSelected();

		if(selectHandler) {
			clearTimeout(selectHandler);
		}

		selectHandler = setTimeout(function(){

			if($this.hasClass('tse-see-more-link')){
				$this.remove();
				searchHelper();
				return false;
			}

			clearSelect($selected);
			$this.addClass('tse-selected');

			//scrolling into view of result set
			var scrollTop = $this.offset().top - $resultSet.offset().top;
			if((scrollTop > 0 && scrollTop + $this.outerHeight() > $resultSet.height()) || scrollTop < 0 && scrollTop + $this.height() < $resultSet.outerHeight()){
				$resultSet.animate({
					scrollTop: $resultSet.scrollTop() + scrollTop
				},400);
			}

			//sets the value of result counts
			if($resultSet.html() !== ''){
				updateSearchCounts($this.index() + 1,null);
			}

			var startIndex = textSearch.resultsIndex[$this.index()];
			//ensure modifying correct input if inputQuery occurs elsewhere in parent html.
			var textElData = data.textEl.data,
				input = textElData.slice(startIndex, startIndex + $searchField.val().length),
				newText = textElData.slice().replace(input,'<span class="ts-ce-hl">' + input + '</span>'),
				innerHTML = data.el.html();

			data.el.html(innerHTML.replace(textElData,newText));
			utility.scrollToElement(data.el, function(){
				var $el = $('body').find('span.ts-ce-hl');
				if($el.length > 0 && $el.offset().left + $el.width() > $(window).width() - 310 && $el.offset().top < $displayEl.offset().top + $displayEl.height()){
					var offsetLeft = $(window).width() - $el.offset().left + 20;
					$displayEl.animate({
						right: (offsetLeft > $(window).width() || offsetLeft < 0) ? 3 : offsetLeft
					},400);
				} else {
					$displayEl.animate({
						right: 3
					},400);
				}
			});

		},100);
	}

	function processSearch(){
		var nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT,utility.textMatch);
		resetNodeIterator();
		searchHelper(nodeIterator);
		getSelected().trigger('click');		
	}

	function resetNodeIterator(){
		textSearch.nodeIteratorIndex = 0;
		textSearch.nodeIteratorPlaceholder = null;		
	}

	function searchHelper(nodeIterator){
		var textNode = null,
			length = textSearch.input.length,
			i=0,
			$parent,
			startIndex,
			_input,
			href,
			processedHref,
			$closestAnchor,
			$li,
			continueState = false,
			seeMoreLink = false;

		if(!nodeIterator){
			continueState = true;
			nodeIterator = textSearch.nodeIteratorPlaceholder;
		}

		while ((textNode = nodeIterator.nextNode()) !== null) {
			$parent = $(textNode).parent();
			startIndex = textSearch.resultsIndex[textSearch.nodeIteratorIndex];
			_input = textNode.data.slice(startIndex, startIndex + length);

			$li = $('<li role="menuitem" tabindex="0"><div class="tse-li-inner">' + textNode.data.replace(_input,'<span class="ts-ce-hl"></span>') + '</div></li>');

			$li.data({
				el: $parent,
				textEl: textNode
			}).find('.ts-ce-hl').text(_input);

			$closestAnchor = $parent.closest('a');
			if($closestAnchor.length > 0){
				href = $closestAnchor.attr('href') || '';
				processedHref = utility.linkMatch(href);
				if(processedHref !== ''){
					$li.append('<a href="' + href + '"' + ' title="'+ processedHref + '">' + processedHref + '</a>');
				}
			}

			if(textSearch.nodeIteratorIndex === 0){ //at least one result
				$li.addClass('tse-selected');
				$displayEl.removeClass('tse-no-results');
			}

			$resultSet.append($li);
			
			i++;
			textSearch.nodeIteratorIndex++;

			if(i === textSearch.resultLimit ){
				//add see more li
				updateSearchCounts(null,$resultSet.children().length + '+');
				$resultSet.append('<li class="tse-see-more-link" role="menuitem" tabindex="0">See more results</li>');
				textSearch.nodeIteratorPlaceholder = nodeIterator;
				seeMoreLink = true;
				break;
			} 

		}

		//highlightAll();

		if(!seeMoreLink){
			updateSearchCounts(null,$resultSet.children().length);
		}

	}

	function handleSpecialKeys(evt,$el,type){
		//input field events
		var $prev = null,
			$next = null,
			$link = null,
			$selected = $el || getSelected();

		if($selected.length > 0){
			switch (evt.which){
				case 38:  //up
					$prev = $selected.prev();
					if($prev.length > 0){
						$prev.trigger('click');
						if(type === 'li'){
							$prev.focus();
						}
					} else if(type === 'li'){
						$searchField.focus();
					}
					return false;
				case 40: //down
					$next = $selected.next();
					if($next.length > 0){
						$next.trigger('click');
						if(type === 'li'){
							$next.focus();
						}
					}
					return false;				
				case 13: //enter
					$link = $selected.find('a');
					if($link.length > 0){
						location.href = $link.attr('href');
					} else if(type === 'li'){
						$selected.trigger('click').focus();
					}
					return false;
				default:
					break;
			}
		}

		switch (evt.which){
			case 27: //esc
				toggleMenu();
				return false;
				break;
			case 65: //a - highlight all
				if(evt.altKey === true){
					optionsCb($displayEl.find('#tse-highlight-all'));
					return false;
				}
				break;
			case 67: //c - match case
				if(evt.altKey === true){
					optionsCb($displayEl.find('#tse-match-case'));
					return false;	
				}
				break;
			case 76: //l - links only
				if(evt.altKey === true){
					optionsCb($displayEl.find('#tse-links-only'));
					return false;
				}
				break;
			default:
				break;
		}
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
	}

	function getSelected(){
		return $displayEl.find('li.tse-selected');
	}

	function updateSearchCounts(index, total){
		if(index !== null){
			$searchIndex.text(index);
		}

		if(total !== null){
			$searchTotal.text(total);	
		}	
	}

	function highlightAll(){
		var items = $resultSet.find('li'),
			length,
			index;

		items = items.filter(function(){
			var $this = $(this);
			return !$this.hasClass('tse-hl') && !$this.hasClass('tse-see-more-link');
		});

		length = items.length;

		for(;index<length;index++){
			items[index].addClass('tse-hl');

		}
	}

})(window.jQuery);
