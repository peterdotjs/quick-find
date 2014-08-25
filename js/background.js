
chrome.runtime.onInstalled.addListener(function(details){	
	if(details.reason === 'install'){
		chrome.windows.create({url:"http://peterdotjs.com/quick-find-text-search/#content"});	
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "logPageView"){
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
    }
    sendResponse({});
});
