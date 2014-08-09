//TODO: Cases
//iframes, multiple documents
(function($){

	var input = "Peter";

	//update with regex
	function textMatch(node){
		if(node.data.indexOf(input) !== -1){
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILER_REJECT;
		}
	}

	var nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT,textMatch);
	var results = [];

	while ((textNode = nodeIterator.nextNode()) != null) {
		results.push(textNode);
	}

	var $displayEl = $('#text-search-extension');

	if($displayEl.length === 0){
		$displayEl = $('<div id="text-search-extension"><ul></ul></div>');
		$('body').after($displayEl);
	}

	var $ul = $displayEl.find('ul'),
		li = null;

	for(var i=0; i<results.length; i++){
		var offset = $(results[i]).parent().offset(),
			content = results[i].data.replace(input,'<span class="ts-ce-hl">' + input + '</span>');

		li = $('<li>' + content + '</li>');

		li.data({
			offset: offset,
			textEl: results[i]
		});

		$ul.append(li);
	}

	var selection = window.getSelection();
	var range = document.createRange();

	$(document).on('click','#text-search-extension li',function(){
		var $this = $(this),
			height = $this.parent().height(),
			data = $this.data();

			debugger;

			data.textEl.data = $this.html();
			// start = data.textEl.data.indexOf(input),
			// end = start + input.length;

		// range.setStart(data.textEl,start);
		// range.setEnd(data.textEl,end);
		// selection.removeAllRanges();
		// selection.addRange(range);
		$('html, body').animate({
          scrollTop: data.offset.top - height - 20
          },400);
	});




})(window.jQuery);
