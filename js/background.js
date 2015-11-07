
chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason === 'install'){
		chrome.windows.create({url:"http://peterdotjs.com/quick-find-text-search/#content"});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.method) {
		case "logPageView":
			var optOut = localStorage['tracking-opt-out'],
				deferTracking = false;

			if(optOut && optOut === 'true'){
				deferTracking = true;
			}

			if(!deferTracking) {
				// Standard Google Universal Analytics code
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

				ga('create', 'UA-34217520-4', 'auto');
				ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
				ga('require', 'displayfeatures');
				ga('send', 'pageview', '/');
			}
			break;

		default:
			// Don't respond to unknown messages
			return;
	}
	sendResponse({});
});

chrome.commands.onCommand.addListener(function callback(command) {

	if(command.indexOf('quick-find') !== -1){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id, {cmd: command}, function(response) {});
		});
	}

});
