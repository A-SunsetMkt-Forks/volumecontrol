/* // youtube_audio.js
chrome.runtime.sendMessage('enable-youtube-audio');

var makeSetAudioURL = function(videoElement, url) {
    if (videoElement.src != url) {
		var paused = videoElement.paused;
        videoElement.src = url;
		if (paused === false) {
			videoElement.play();
		}
    }
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let url = request.url;
        let videoElement = document.getElementsByTagName('video')[0];
		videoElement.onloadeddata = makeSetAudioURL(videoElement, url);

        let audioOnlyDivs = document.getElementsByClassName('audio_only_div');
        // Append alert text
        if (audioOnlyDivs.length == 0 && url.includes('mime=audio')) {
            let extensionAlert = document.createElement('div');
            extensionAlert.className = 'audio_only_div';

            let alertText = document.createElement('p');
            alertText.className = 'alert_text';
            alertText.innerHTML = 'Youtube Audio Extension is running. It disables the video stream and uses only the audio stream' +
                ' which saves battery life and bandwidth / data when you just want to listen to just songs. If you want to watch' +
                ' video also, click on the extension icon and refresh your page.';

            extensionAlert.appendChild(alertText);
            let parent = videoElement.parentNode.parentNode;

            // Append alert only if options specify to do so
            chrome.storage.local.get('disable_video_text', function(values) {
              var disableVideoText = (values.disable_video_text ? true : false);
              if (!disableVideoText && parent.getElementsByClassName("audio_only_div").length == 0)
                parent.appendChild(extensionAlert);
            });
        }
        else if (url == "") {
            for(div in audioOnlyDivs) {
                div.parentNode.removeChild(div);
            }
        }
    }
);

// global.js
const tabIds = new Set();

function removeURLParameters(url, parameters) {
    parameters.forEach(function(parameter) {
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {
            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);

            for (var i = pars.length; i-- > 0;) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }

            url = urlparts[0] + '?' + pars.join('&');
        }
    });
    return url;
}

function reloadTab() {
	for (const tabId of tabIds) {
		chrome.tabs.get(tabId, function(tab) {
			if (tab.active) {
				chrome.tabs.reload(tabId);
				return;
			}
		});
	}
}

function processRequest(details) {
	if (!tabIds.has(details.tabId)) {
		return;
	}

    if (details.url.indexOf('mime=audio') !== -1 && !details.url.includes('live=1')) {
        var parametersToBeRemoved = ['range', 'rn', 'rbuf'];
        var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
        chrome.tabs.sendMessage(details.tabId, {url: audioURL});
    }
}

function enableExtension() {
    chrome.browserAction.setIcon({
        path : {
            128 : "img/icon128.png",
            38 : "img/icon38.png"
        }
    });
    chrome.webRequest.onBeforeRequest.addListener(
        processRequest,
        {urls: ["<all_urls>"]},
        ["blocking"]
    );
}

function disableExtension() {
    chrome.browserAction.setIcon({
        path : {
            38 : "img/disabled_icon38.png",
        }
    });
    chrome.webRequest.onBeforeRequest.removeListener(processRequest);
}

function saveSettings(currentState) {
    chrome.storage.local.set({'youtube_audio_state': currentState});
}

chrome.browserAction.onClicked.addListener(function() {
    chrome.storage.local.get('youtube_audio_state', function(values) {
        var currentState = values.youtube_audio_state;
		var newState = !currentState;

        if (newState) {
            enableExtension();
        } else {
            disableExtension();
        }

        saveSettings(newState);
		reloadTab();
    });
});

chrome.storage.local.get('youtube_audio_state', function(values) {
    var currentState = values.youtube_audio_state;
    if (typeof currentState === "undefined") {
        currentState = true;
        saveSettings(currentState);
    }

    if (currentState) {
        enableExtension();
    } else {
        disableExtension();
    }
});

chrome.runtime.onMessage.addListener(function(message, sender) {
	tabIds.add(sender.tab.id);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	tabIds.delete(tabId);
});
*/

//Final code
