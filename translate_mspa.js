// spawncamp message box
if (document.getElementById("message-viz-links") != null) {
	if (!document.getElementById("message-viz-links").checked) {
		document.getElementById("message-viz-links").click();
	}
	document.getElementById("message-viz-links").disabled = true;
	document.getElementById("message-box-dismiss").click();
}

redirectPage();

browser.storage.sync.get("translation_link").then(doThings, onError);
// everything is in this function, since if we don't have a translation link we can't do anything anyway
async function doThings(item) {
	// load the lang_info file
	const lang_info = await getJson(item['translation_link'] || "https://gitea.roberd.me/forditasok/mspa-magyarul/raw/branch/main/lang_info.json");
	
	// find if defined in "replace_pages"
	let replacePage = -1;
	for (let i = 0; i < lang_info['replace_pages'].length; i++) {
		if (window.location.pathname == lang_info['replace_pages'][i]) {
			replacePage = i;
			break;
		}
	}
	// override page if defined in "replace_pages"
	if (replacePage > -1) {
		try {
			const newHtml = await fetch(lang_info['replace_pages_url'] + lang_info['replace_pages'][replacePage] + "/index.html");
			document.documentElement.innerHTML = await newHtml.text();
			reloadAllScripts();
		} catch (error) {
			console.error("Page markd for override, but no there is no file.");
		}
	} else {	// replace comic content
		// get page number from current url
		var pageNum = window.location.pathname.split("/");
		pageNum = pageNum[pageNum.length-1];

		// load in translation data files
		const mspa_data = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA']);

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
				if (split.length > 1) {
					commands[j].firstElementChild.innerHTML = mspa_data[split[split.length-1]]['title'];
				}
			}
		}

		// replace browser page title
		document.title = mspa_data[pageNum]['title'] + " - MSPA To Go";

		// replace titles (all these loops are needed because of Act 6 Act 5 Act 1 x2)
		const titles = document.querySelectorAll("[id='title']");
		for (let i = 0; i < titles.length; i++) {
			titles[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['title'];		
		}

		// replace text and fix imported images and links
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
	}
	// page specific things
	if (window.location.pathname == "/options") {	// nuke homestuck.com page numbers
		if (document.getElementById("viz-links").checked) {
			document.getElementById("viz-links").click();
			document.getElementsByTagName("form").item(0).submit();
		}
		document.getElementById("viz-links").disabled = true;
	} else if (window.location.pathname.includes("/sbahj")) {	// sbahj
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
	} else if (window.location.pathname.includes("/log")) {	// log pages
		if (window.location.pathname.includes("/log/")) {	// so it doesn't throw an error on /log
			const mspa_data = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA']);
			const links = document.getElementById("content").getElementsByTagName("a");
			for (let i = 1; i < links.length; i++) {	// start from 1 to skip order changer
				const split = links[i].getAttribute("href").split("/");
				links[i].innerHTML = mspa_data[split[split.length-1]]['title'];
			}
		}
	} else if (window.location.pathname.includes("/map")) {	// map assets
		const imgs = document.getElementsByTagName("img");
		let srcs = [];
		for (let i = 0; i < imgs.length; i++) {
			srcs.push(imgs[i].getAttribute("src").substring(6));
			imgs[i].src = lang_info['assets_dir_url'] + srcs[i];
			imgs[i].onerror = function() {
				imgs[i].src = "/mspa/" + srcs[i];
			
			}
		}
	}
	// replace footer and menu-bar
	if (document.getElementById("menu-bar").firstElementChild.innerHTML == "WORTHLESS GARBAGE.") {	// caliborn check
		replaceElementFromHtml("menu-bar", lang_info['replace_pages_url'] + "/" + lang_info['replace_menu_bar_caliborn']);
	} else if (document.getElementById("menu-bar").getElementsByTagName('a').length > 20) {	// Act 6 Act 5 Act 1 x2 check
		var newHtml = await fetch(lang_info['replace_pages_url'] + "/" + lang_info['replace_menu_bar']);
		newHtml = await newHtml.text();
		document.getElementById("menu-bar").innerHTML = newHtml + "<div class=\"candycorn\"></div>" + newHtml;
	} else {
		replaceElementFromHtml("menu-bar", lang_info['replace_pages_url'] + "/" + lang_info['replace_menu_bar']);
	}
	replaceElementFromHtml("footer", lang_info['replace_pages_url'] + "/" + lang_info['replace_footer']);
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
	const newHtml = await fetch(linkToHtml);
	document.getElementById(elementID).innerHTML = await newHtml.text();
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