makeBold = function (form) {
    var text = document.getElementById(form);
    var startIndex = text.selectionStart,
    endIndex = text.selectionEnd;
    var selectedText = text.value.substring(startIndex, endIndex);

    var format = '**'

    if (selectedText.includes('**')) {
        text.value = selectedText.replace(/\*/g, '');
    }
    else if (selectedText.length == 0) {
        text.value = text.value.substring(0, startIndex) + selectedText + text.value.substring(endIndex);
    }
    else {
        text.value = text.value.substring(0, startIndex) + format + selectedText + format + text.value.substring(endIndex);
    }
}

makeItalics = function (form) {
    var text = document.getElementById(form);
    var startIndex = text.selectionStart,
    endIndex = text.selectionEnd;
    var selectedText = text.value.substring(startIndex, endIndex);

    var format = '*'

    if (selectedText.includes('*')) {
        text.value = selectedText.replace(/\*/g, '');
    }
    else if (selectedText.length == 0) {
        text.value = text.value.substring(0, startIndex) + selectedText + text.value.substring(endIndex);
    }
    else {
        text.value = text.value.substring(0, startIndex) + format + selectedText + format + text.value.substring(endIndex);
    }
}

makeQuote = function (form) {
    var text = document.getElementById(form);
    var startIndex = text.selectionStart,
    endIndex = text.selectionEnd;
    var selectedText = text.value.substring(startIndex, endIndex);

    var format = '>'

    if (selectedText.includes('>')) {
        text.value = text.value.substring(0, startIndex) + selectedText.replace(/\>/g, '') + text.value.substring(endIndex);
    }
    else if (selectedText.length == 0) {
        text.value = text.value.substring(0, startIndex) + selectedText + text.value.substring(endIndex);
    }
    else {
        text.value = text.value.substring(0, startIndex) + format + selectedText + text.value.substring(endIndex);
    }
}

function autoExpand (field) {

                xpos=window.scrollX;
    ypos=window.scrollY;

                    field.style.height = 'inherit';

                    var computed = window.getComputedStyle(field);

                    var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
    + parseInt(computed.getPropertyValue('padding-top'), 10)
    + field.scrollHeight
    + parseInt(computed.getPropertyValue('padding-bottom'), 10)
    + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
    + 32;

    field.style.height = height + 'px';

                window.scrollTo(xpos,ypos);

};


document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() !== 'textarea') return;
    autoExpand(event.target);
}, false);

for(let el of document.getElementsByClassName('text-expand')) {
    el.onclick = function(event){
        if (event.which != 1) {
            return
        };
        id=this.data('id');


        document.getElementById('post-text-'+id).toggleClass('d-none');
        document.getElementsByClassName('text-expand-icon-'+id)[0].toggleClass('fa-expand-alt');
        document.getElementsByClassName('text-expand-icon-'+id)[0].toggleClass('fa-compress-alt');

    }
}

function post_toast2(url, button1, button2) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    var form = new FormData()

    if(typeof data === 'object' && data !== null) {
        for(let k of Object.keys(data)) {
                form.append(k, data[k]);
        }
    }


    form.append("formkey", formkey());
    xhr.withCredentials=true;

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                document.getElementById('toast-post-success-text').innerText = JSON.parse(xhr.response)["message"];
            } catch(e) {
                document.getElementById('toast-post-success-text').innerText = "Action successful!";
            }
            var myToast = new bootstrap.Toast(document.getElementById('toast-post-success'));
            myToast.show();
            return true

        } else if (xhr.status >= 300 && xhr.status < 400) {
            window.location.href = JSON.parse(xhr.response)["redirect"]
        } else {
            try {
                data=JSON.parse(xhr.response);

                var myToast = new bootstrap.Toast(document.getElementById('toast-post-error'));
                myToast.show();
                document.getElementById('toast-post-error-text').innerText = data["error"];
                return false
            } catch(e) {
                var myToast = new bootstrap.Toast(document.getElementById('toast-post-success'));
                myToast.hide();
                var myToast = new bootstrap.Toast(document.getElementById('toast-post-error'));
                myToast.show();
                document.getElementById('toast-post-error-text').innerText = "Error. Try again later.";
                return false
            }
        }
    };

    xhr.send(form);

    document.getElementById(button1).classList.toggle("d-none");
    document.getElementById(button2).classList.toggle("d-none");
}


// New comment counts

// localstorage comment counts format: {"<postId>": {c: <totalComments>, t: <timestampUpdated>}}
const COMMENT_COUNTS_ID = "comment-counts"

/**
 * Display the number of new comments present since the last time the post was opened
 */
function showNewCommentCounts(postId, newTotal) {
	const comments = JSON.parse(localStorage.getItem(COMMENT_COUNTS_ID)) || {}

	const lastCount = comments[postId]
	if (lastCount) {
		const newComments = newTotal - lastCount.c
		if (newComments > 0) {
			document.querySelectorAll(`#post-${postId} .new-comments`).forEach(elem => {
				elem.textContent = ` (+${newComments})`
				elem.classList.remove("d-none")
			})
		}
	}
}

function incrementCommentCount(postId) {
	saveCommentsCount(postId)
}

/**
 * Saves the comment count to the localStorage
 *
 * @param postId The id of the post associated with the comments
 * @param lastTotalComs The new amount, If null it will just increment the previous amount
 */
function saveCommentsCount(postId, lastTotalComs = null) {
	const comments = JSON.parse(localStorage.getItem(COMMENT_COUNTS_ID)) || {}

	const newTotal = lastTotalComs || ((comments[postId] || { c: 0 }).c + 1)

	comments[postId] = { c: newTotal, t: Date.now() }

	window.localStorage.setItem(COMMENT_COUNTS_ID, JSON.stringify(comments))
}

/**
 * Cleans the expired entries (5 days). It runs every hour.
 */
function cleanCommentsCache() {
	const LAST_CACHE_CLEAN_ID = "last-cache-clean"
	const EXPIRE_INTERVAL_MILLIS = 5 * 24 * 60 * 60 * 1000
	const CACHE_CLEAN_INTERVAL = 60 * 60 * 1000 // 1 hour

	function cleanCache() {
		const lastCacheClean = JSON.parse(localStorage.getItem(LAST_CACHE_CLEAN_ID)) || Date.now()
		const now = Date.now()

		if (now - lastCacheClean > CACHE_CLEAN_INTERVAL) {
			const comments = JSON.parse(localStorage.getItem(COMMENT_COUNTS_ID)) || {}

			for (let [key, value] of Object.entries(comments)) {
				if (now - value.t > EXPIRE_INTERVAL_MILLIS) {
					delete comments[key]
				}
			}
			window.localStorage.setItem(COMMENT_COUNTS_ID, JSON.stringify(comments))
		}
		window.localStorage.setItem(LAST_CACHE_CLEAN_ID, JSON.stringify(now))
	}

	// So it does not slow the load of the main page with the clean up
	setTimeout(cleanCache, 500)
}

cleanCommentsCache()
