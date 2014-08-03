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

	var $ul = $displayEl.find('ul');

	for(var i=0; i<results.length; i++){
		$ul.append('<li>' + results[i].data + '</li>');
	}

})(window.jQuery);
