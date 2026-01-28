// spawncamp message box
if (document.getElementById("message-viz-links") != null) {
	if (!document.getElementById("message-viz-links").checked) {
		document.getElementById("message-viz-links").click();
	}
	document.getElementById("message-viz-links").disabled = true;
	document.getElementById("message-box-dismiss").click();
} else {
	document.cookie = "viz-links=false; SameSite=Strict; path=/; max-age=34560000";
}

redirectPage();

browser.storage.sync.get("translation_link").then(doTheTranslateyThing, onError);
// everything is in this function, since if we don't have a translation link we can't do anything anyway
async function doTheTranslateyThing(item) {
	// load the lang_info file
	const lang_info = await getJson(item['translation_link'] || "https://gitea.roberd.me/forditasok/mspa-magyarul/raw/branch/main/lang_info.json");

	// find if defined in "replace_page_content"
	let replacePage = -1;
	for (let i = 0; i < lang_info['replace_page_content'].length; i++) {
		if (window.location.pathname == lang_info['replace_page_content'][i][0] || window.location.pathname == lang_info['replace_page_content'][i][0] + "/") {
			replacePage = i;
			break;
		}
	}
	// if not, then check for "add_pages" too
	let addPage = -1;
	if (replacePage == -1) {
		for (let i = 0; i < lang_info['add_pages'].length; i++) {
			if (window.location.pathname == lang_info['add_pages'][i] || window.location.pathname == lang_info['add_pages'][i] + "/") {
				addPage = i;
				break;
			}
		}
	}
	// override page content if found
	if (replacePage > -1) {
		document.title = lang_info['replace_page_content'][replacePage][1] + " - MSPA To Go";
		// first the three special cases
		if (lang_info['replace_page_content'][replacePage][0] == "/") {
			document.getElementById("title").innerHTML = lang_info['replace_page_content'][replacePage][1];

			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_page_content'][replacePage][2]);
			newHtml = newHtml.getElementById("content");
			document.getElementById("content").innerHTML = newHtml.innerHTML;
		} else if (lang_info['replace_page_content'][replacePage][0] == "/options") {
			document.getElementById("title").innerHTML = lang_info['replace_page_content'][replacePage][1];

			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_page_content'][replacePage][2]);
			let newElements = newHtml.getElementsByTagName("label");
			let docElements = document.getElementById("content").getElementsByTagName("label");
			for (let i = 0; i < newElements.length; i++) {
				for (let j = 0; j < docElements.length; j++) {
					if (newElements[i].getAttribute("for") == docElements[j].getAttribute("for")) {
						docElements[j].innerHTML = newElements[i].innerHTML;
						if (docElements[j].nextElementSibling.id == "font-size-value") {
							docElements[j].nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = newElements[i].nextElementSibling.nextElementSibling.nextElementSibling.innerHTML;
						} else {
							docElements[j].nextElementSibling.nextElementSibling.innerHTML = newElements[i].nextElementSibling.nextElementSibling.innerHTML;
						}
						break;
					}
				}
			}
		} else if (lang_info['replace_page_content'][replacePage][0] == "/news") {
			document.getElementById("news-title").firstElementChild.setAttribute("alt", lang_info['replace_page_content'][replacePage][1]);
			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_page_content'][replacePage][2]);
			newHtml = newHtml.getElementById("news-content");
			document.getElementById("news-content").innerHTML = newHtml.innerHTML;
		} else {	// then the ones thats just replace the content of the innerHtml
			document.getElementById("title").innerHTML = lang_info['replace_page_content'][replacePage][1];
			replaceElementFromHtml("content", lang_info['replace_pages_url']+ "/" + lang_info['replace_page_content'][replacePage][2]);
		}
		reloadAllScripts();
	} else if (addPage > -1) {	// replace the loaded 404 page with the added page
		try {
			const newHtml = await fetch(lang_info['replace_pages_url'] + lang_info['add_pages'][addPage] + "/index.html");
			document.documentElement.innerHTML = await newHtml.text();
			reloadAllScripts();
		} catch (error) {
			console.error("Marked as new page, but there is no file.");
		}
	} else {	// replace comic content
		if (window.location.pathname.includes("/sbahj/")) {	// sbahj
			const imgs = document.getElementsByTagName("img");
			let srcs = [];
			for (let i = 0; i < imgs.length; i++) {
				if (imgs[i].getAttribute("src").includes("/assets/img/sbahj/")) {	// page assets
					srcs.push(imgs[i].getAttribute("src"));
					imgs[i].src = lang_info['assets_dir_url'] + srcs[i].replace("/assets/img/sbahj/", "sweetbroandhellajeff/");
					imgs[i].onerror = function() {
						imgs[i].src = srcs[i];
					}
				} else {	// comic pages
					srcs.push(imgs[i].getAttribute("src").substring(6));
					imgs[i].src = lang_info['assets_dir_url'] + srcs[i];
					imgs[i].onerror = function() {
						imgs[i].src = "/mspa/" + srcs[i];
					}
				}
			}
			// replace comic-list
			const sbahj_comic_list = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['sbahj_comic_list']);
			const comic_list_links = document.getElementById("comic-list").getElementsByTagName("a");
			for (let i = 0; i < comic_list_links.length; i++) {
				for (let j = 0; j < sbahj_comic_list['listedPages'].length; j++) {
					if (comic_list_links[i].getAttribute("href") == sbahj_comic_list['listedPages'][j]['url']) {
						comic_list_links[i].innerHTML = sbahj_comic_list['listedPages'][j]['title'];
						break;
					}
				}
			}
		} else {
			// get page number from current url
			var pageNum = window.location.pathname.split("/");
			pageNum = pageNum[pageNum.length-1];

			// get latest translated page number
			let lastPage = 999999;
			if (window.location.pathname.includes("/read/6")) {
				lastPage = parseInt(lang_info['hs_progress']);
			} else if (window.location.pathname.includes("/read/4")) {
				lastPage = parseInt(lang_info['ps_progress']);
			}

			// load in translation data files
			const mspa_data = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA']);

			// all these loops are needed because of Act 6 Act 5 Act 1 x2

			// replace gifs and flashes (and openbound someday)
			const medias = document.querySelectorAll("[id='media']");
			let allSrcs = [];
			for (let i = 0; i < medias.length; i++) {
				const imgs = medias[i].getElementsByTagName("img");
				let srcs = [];
				if (imgs.length > 0) {
					for (let j = 0; j < imgs.length; j++) {
						srcs.push(imgs[j].getAttribute("src").substring(6));
						imgs[j].src = lang_info['assets_dir_url'] + srcs[j];
						imgs[j].onerror = function() {
							imgs[j].src = "/mspa/" + allSrcs[i][j];
						}
					}
				}
				allSrcs.push(srcs);
			}
			const flashes = document.getElementsByTagName("ruffle-embed");
			if (flashes.length > 0) {
				for (let i = 0; i < flashes.length; i++) {
					const newSrc = lang_info['assets_dir_url'] + flashes[i].getAttribute("src").substring(6);
					// check if exists
					fetch(newSrc, { method: 'HEAD' })
					.then(response => {
						if (response.ok) {
							const newFlash = flashes[i].cloneNode(true);
							newFlash.setAttribute("src", newSrc);
							flashes[i].replaceWith(newFlash);
						}
					})
					.catch(() => {
						// do nothing
					});
				}
			}

			// replace commands, only works with mspa page numbers
			const commandses = document.getElementsByClassName("commands");
			for (let i = 0; i < commandses.length; i++) {
				const commands = commandses[i].getElementsByClassName("command");
				for (let j = 0; j < commands.length; j++) {
					const split = commands[j].firstElementChild.getAttribute("href").split("/");
					if (parseInt(split[split.length-1]) > lastPage && pageNum <= lastPage) {
						commands[j].innerHTML = lang_info['progress_message'];
						commands[j].style = "text-align: center;";
					} else {
						try {
							commands[j].firstElementChild.innerHTML = mspa_data[split[split.length-1]]['title'];
						} catch (error) {
							// nothin'
						}
					}
				}
			}

			try {	// replace titles (I don't remember why I put this in a trycatch block)
				document.title = mspa_data[pageNum]['title'] + " - MSPA To Go";
				const titles = document.querySelectorAll("[id='title']");
				for (let i = 0; i < titles.length; i++) {
					titles[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['title'];
				}
			} catch (error) {
				// continue
			}

			try {	// replace text and fix imported images and links
				const texts = document.getElementsByClassName("comic-text");
				let allTextSrcs = [];
				let allTextHrefs = [];
				for (let i = 0; i < texts.length; i++) {
					texts[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['content']/*.replaceAll("|PESTERLOG|", "")*/;

					const links = texts[i].getElementsByTagName("a");
					let hrefs = [];
					for (let j = 0; j < links.length; j++) {
						if (links[j].getAttribute("href").includes("http://www.mspaintadventures.com/")) {
							links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("http://www.mspaintadventures.com/", "/mspa/"));
						} else if (links[j].getAttribute("href").includes("http://mspaintadventures.com/")) {
							links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("http://mspaintadventures.com/", "/mspa/"));
						}
						// sbahj links
						if (links[j].getAttribute("href").includes("/mspa/sweetbroandhellajeff/")) {
							links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("/mspa/sweetbroandhellajeff/", "/sbahj"));
							if (links[j].getAttribute("href").includes("comoc.php")) {
								links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("comoc.php", ""));
							}
							if (links[j].getAttribute("href").includes("?cid=")) {
								links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("?cid=", "/"));
							}
						}
						// comic links
						if (links[j].getAttribute("href").includes("/mspa/?s=")) {
							links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("/mspa/?s=", "/read/"));
							if (links[j].getAttribute("href").includes("&p=")) {
								links[j].setAttribute("href", links[j].getAttribute("href").replaceAll("&p=", "/"));
							}
						}
						// external links
						if (links[j].getAttribute("href").includes("/archive/external/")) {
							const split = links[j].getAttribute("href").split("/archive/external/");
							links[j].href = lang_info['external_links'][split[split.length-1]];
						}
						// going around CORS to check if linked asset has translated version
						if (links[j].getAttribute("href").includes("/mspa/")) {
							hrefs.push(links[j].getAttribute("href").substring(6));
							const poorMansFetch = document.createElement("img");
							poorMansFetch.src = lang_info['assets_dir_url'] + hrefs[j];
							poorMansFetch.onerror = function () {
								//poorMansFetch.src = "/mspa/" + allTextHrefs[i][j];
								links[j].setAttribute("href", "/mspa/" + allTextHrefs[i][j]);
							}
							document.body.appendChild(poorMansFetch);
							poorMansFetch.style.display = 'none';
							links[j].setAttribute("href", poorMansFetch.getAttribute("src"));
						}
					}
					allTextHrefs.push(hrefs);

					const imgs =  texts[i].getElementsByTagName("img");
					let srcs = [];
					for (let j = 0; j < imgs.length; j++) {
						// first redirect mspaintadventures.com to /mspa
						if (imgs[j].getAttribute("src").includes("http://www.mspaintadventures.com/")) {
							imgs[j].setAttribute("src", imgs[j].getAttribute("src").replaceAll("http://www.mspaintadventures.com/", "/mspa/"));
						} else if (imgs[j].getAttribute("src").includes("http://mspaintadventures.com/")) {
							imgs[j].setAttribute("src", imgs[j].getAttribute("src").replaceAll("http://mspaintadventures.com/", "/mspa/"));
						}
						// then check if there is a translated version
						if (imgs[j].getAttribute("src").includes("/mspa/")) {
							srcs.push(imgs[j].getAttribute("src").substring(6));
							imgs[j].src = lang_info['assets_dir_url'] + srcs[j];
							imgs[j].onerror = function() {
								imgs[j].src = "/mspa/" + allTextSrcs[i][j];
							}
						}
					}
					allTextSrcs.push(srcs);
				}
			} catch (error) {
				// continue
			}

			// add footnotes
			for (let k = 0; k < document.querySelectorAll("[id='page']").length; k++) {		// this loop is needed for Act 6 Act 5 Act 1 x2
				for (let i = 0; i < lang_info['data_files']['footnotes'].length; i++) {
					const footnote = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['footnotes'][i]);
					if (typeof footnote[getNextPageNum(pageNum, k)] != 'undefined') {
						for (let j = 0; j < footnote[getNextPageNum(pageNum, k)].length; j++) {
							const note = document.createElement("div");
							note.innerHTML = footnote[getNextPageNum(pageNum, k)][j]['content'];
							note.id = "content";
							note.className = "comic-text";

							if (footnote[getNextPageNum(pageNum, k)][j]['author'] != 'undefined') {
								const author = document.createElement("span");
								author.innerHTML = footnote[getNextPageNum(pageNum, k)][j]['author'];
								author.setAttribute("style", "font-weight: 300;font-size: 10px;font-family: Verdana,Arial,Helvetica,sans-serif;display: flex;justify-content: flex-end;position: relative;top: 12px;margin-top: -12px;color: #979797;");
								// style from uhc
								note.appendChild(author);
							}

							const fotnoteContent = document.createElement("div");
							fotnoteContent.id = "page";

							const footnoteOuter = document.createElement("div");
							footnoteOuter.id = "page-outer";

							fotnoteContent.appendChild(note);
							footnoteOuter.appendChild(fotnoteContent);

							document.getElementById("footer").parentNode.insertBefore(footnoteOuter, document.getElementById("footer"));
						}
					}
				}
			}

			const pageFooters = document.querySelectorAll("[id='page-footer']");
			// replace page footer
			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_page_footer']);
			if (document.getElementById("page-footer-left") != null) {
				let newElements = newHtml.getElementsByTagName("a");
				let docElements = document.getElementById("page-footer-left").getElementsByTagName("a");

				for (let i = 0; i < newElements.length; i++) {
					for (let j = 0; j < docElements.length; j++) {
						if (newElements[i].id == docElements[j].id) {
							docElements[j].innerHTML = newElements[i].innerHTML;
							break;
						}
					}
				}
			}
			if (document.getElementById("page-footer-right") != null) {
				let newElements = newHtml.getElementsByTagName("a");
				let docElements;
				if (document.getElementById("options-menu") != null) {
					docElements = document.getElementById("options-menu").getElementsByTagName("a");
					if (document.getElementById("options-link") != null && newHtml.getElementById("options-link") != null) {
						document.getElementById("options-link").innerHTML = newHtml.getElementById("options-link").innerHTML;
					}
				} else {
					docElements = document.getElementById("page-footer-right").getElementsByTagName("a");
				}

				for (let i = 0; i < newElements.length; i++) {
					for (let j = 0; j < docElements.length; j++) {
						if (newElements[i].id == docElements[j].id) {
							docElements[j].innerHTML = newElements[i].innerHTML;
							break;
						}
					}
				}
			}
			for (let i = 1; i < pageFooters.length; i++) {	// copy page-footer in Act 6 Act 5 Act 1 x2
				pageFooters[i].innerHTML = pageFooters[i-1].innerHTML;
			}
		}
	}

	const allImgs = document.getElementsByTagName("img");
	let webImgs = [];
	for (let l = 0; l < allImgs.length; l++) {
		if (allImgs[l].getAttribute("src").includes("/assets/img/")) {
			webImgs.push(allImgs[l]);
		}
	}
	let webSrcs = [];
	for (let l = 0; l < webImgs.length; l++) {	// search for translated web assets
		webSrcs.push(webImgs[l].getAttribute("src"));
		webImgs[l].src = lang_info["assets_dir_url"] + webSrcs[l].replaceAll("/assets/img/", "images/");
		webImgs[l].onerror = function() {
			webImgs[l].src = webSrcs[l];
		}
	}

	if (window.location.pathname.includes("/options")) {	// nuke homestuck.com page numbers
		if (document.getElementById("viz-links").checked) {
			document.getElementById("viz-links").click();
			document.getElementsByTagName("form").item(0).submit();
		}
		document.getElementById("viz-links").disabled = true;
	} else if (window.location.pathname.includes("/log/")) {	// log pages
		// get latest translated page number
		let lastPage = 999999;
		if (window.location.pathname.includes("/log/6")) {
			lastPage = parseInt(lang_info['hs_progress']);
		} else if (window.location.pathname.includes("/log/4")) {
			lastPage = parseInt(lang_info['ps_progress']);
		}
		const mspa_data = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA']);
		// remove untranslated links
		const entries = document.querySelectorAll('#content a[href*="/read/"]');
		entries.forEach(link => {
			const linkNumber = parseInt(link.getAttribute('href').split('/').pop());
			if (linkNumber > lastPage) {
				const linkDate = link.previousSibling;
				const linkBr = link.nextSibling;
				link.remove();
				if (linkDate) {
					linkDate.remove();
				}
				if (linkBr && linkBr.tagName === 'BR') {
					linkBr.remove();
				}
			}
		});
		// translate links
		const links = document.getElementById("content").getElementsByTagName("a");
		for (let i = 1; i < links.length; i++) {	// start from 1 to skip order changer
			const split = links[i].getAttribute("href").split("/");
			links[i].innerHTML = mspa_data[split[split.length-1]]['title'];
		}
	} else if (window.location.pathname.includes("/map/")) {	// map assets
		const imgs = document.getElementsByTagName("img");
		let srcs = [];
		for (let i = 0; i < imgs.length; i++) {
			srcs.push(imgs[i].getAttribute("src").substring(6));
			imgs[i].src = lang_info['assets_dir_url'] + srcs[i];
			imgs[i].onerror = function() {
				imgs[i].src = "/mspa/" + srcs[i];
			}
		}
	} else if (window.location.pathname.includes("/archive")) {
		const progress = document.createElement("div");
		progress.style = "text-align: center;";
		progress.innerHTML = lang_info['progress_text'].replaceAll("999999", parseInt(getNextPageNum(lang_info['hs_progress'], -1900))).replaceAll("000000", parseInt(getNextPageNum(lang_info['ps_progress'], -218)));

		try {
			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_page_footer']);
			progress.appendChild(document.createElement("br"));
			const loadGame = newHtml.getElementById('load-game');

			loadGame.style = "font-size: 16px; font-weight: 700; font-family: Verdana, Arial, Helvetica, sans-serif; cursor: pointer; text-decoration: underline; color: #5599ff;";

			progress.appendChild(loadGame);
		} catch (error) {
			// it is what it is
		}

		document.getElementById("content").parentNode.insertBefore(progress, document.getElementById("content"));


	}

	// replace menu-bar
	if (document.getElementById("menu-bar") != null) {
		let docElements;
		if (document.getElementById("menu") != null) {	// mobile
			docElements = document.getElementById("menu").getElementsByTagName("a");
		} else {	// pc
			docElements = document.getElementById("menu-bar").getElementsByTagName("a");
		}

		if (docElements.item(0).innerHTML == "WORTHLESS GARBAGE.") {
			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_menu_bar_caliborn']);
		} else {
			var newHtml = await parseDomFromFile(lang_info['replace_pages_url'] + "/" + lang_info['replace_menu_bar']);
		}
		let newElements = newHtml.getElementsByTagName("a");

		if (document.getElementById("menu-button") != null && newHtml.getElementById("menu-button") != null) {
			document.getElementById("menu-button"). innerHTML = newHtml.getElementById("menu-button").innerHTML;
		}

		for (let i = 0; i < newElements.length; i++) {
			docElements[i].outerHTML = newElements[i].outerHTML;
		}

		if (docElements.length > 20) {
			for (let i = 0; i < newElements.length; i++) {
				docElements[i+newElements.length].outerHTML = newElements[i].outerHTML;
			}
		}
	}
	// replace footer
	replaceElementFromHtml("footer", lang_info['replace_pages_url'] + "/" + lang_info['replace_footer']);
	// end of script
}

function onError(error) {	// print an error to console
	console.log(`Error: ${error}`);
}

async function getJson(url) {	// read a json file to an object
	return await (await fetch(url)).json();
}

function getNextPageNum(pageNum, i) {	// get page number + i
	var pageNumNum = parseInt(pageNum) + i;
	pageNumNum = pageNumNum.toString();
	if (pageNumNum.length < pageNum.length) {
		pageNumNum = "0".repeat(pageNum.length-pageNumNum.length) + pageNumNum;
	}
	return pageNumNum;
}

function reloadAllScripts() {	// in case an overridden page has new scripts that need to execute
	const scripts = document.querySelectorAll('script');

	scripts.forEach((oldScript) => {
		const newScript = document.createElement('script');

		Array.from(oldScript.attributes).forEach(attr => {
			newScript.setAttribute(attr.name, attr.value);
		});

		newScript.appendChild(
			document.createTextNode(oldScript.innerHTML)
		);

		if (oldScript.parentNode) {
			oldScript.parentNode.replaceChild(newScript, oldScript);
		}
	});
}

async function replaceElementFromHtml(elementID, linkToHtml) {	// the file the link points to should contain the new innerHTML only
	try {
		const newHtml = await fetch(linkToHtml);
		document.getElementById(elementID).innerHTML = await newHtml.text();
	} catch (error) {
		// just don't throw error
	}
}

function redirectPage() {	// if on specific page redirect to another
	switch (window.location.pathname) {
		case "/read/6":
			window.location.replace("/read/6/001901");
			break;
		case "/read/5":
			window.location.replace("/read/5/001893");
			break;
		case "/read/4":
			window.location.replace("/read/4/000219");
			break;
		case "/read/2":
			window.location.replace("/read/2/000136");
			break;
		case "/read/1":
			window.location.replace("/read/2/000002");
			break;
		case "/sbahj":
			window.location.replace("/sbahj/1");
			break;
		default:
			break;
	}
}

async function parseDomFromFile(url) {
	try {
		var newHtml = await fetch(url);
		newHtml = await newHtml.text();
		const parser = new DOMParser();
		return parser.parseFromString(newHtml, 'text/html');
	} catch (error) {
		onError(error);
	}
}