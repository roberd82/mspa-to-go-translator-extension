browser.storage.sync.get("translation_link").then(doThings, onError);
// everything is in this function, since if we don't have a translation link we can't do anything anyway
async function doThings(item) {
	const lang_info = await getJson(item['translation_link'] || "https://gitea.roberd.me/forditasok/mspa-magyarul/raw/branch/main/lang_info.json");
	// maybe should disable the option for homestuck.com page numbering and get the current page from url instead
	const pageNum = document.getElementById('content').dataset.p;
	// todo: do something on specific page here
	// load in translation data files
	const mspa_data = await getJson(lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA']);
	
	document.title = mspa_data[pageNum]['title'] + " - MSPA To Go";
	// all these loops are needed because of Act 6 Act 5 Act 1 x2
	const titles = document.querySelectorAll("[id='title']");
	for (let i = 0; i < titles.length; i++) {
		titles[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['title'];		
	}
	// only gifs for now, flashes almost work, openbound I don't even know where to begin
	const medias = document.querySelectorAll("[id='media']");
	var allSrcs = [];
	for (let i = 0; i < medias.length; i++) {
		const imgs = medias[i].getElementsByTagName("img");
		var srcs = [];
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
		// I tried :c
		/*const flashes = medias[i].getElementsByTagName("ruffle-embed");
		if (flashes.length > 0) {
			var srcs = [];
			for (let j = 0; j < flashes.length; j++) {
				srcs.push(flashes[j].getAttribute("src").substring(6));
				const newSrc = lang_info['assets_dir_url'] + srcs[j];
				flashes[j].setAttribute("src", newSrc);
				//flashes[j].setAttribute("name", newSrc.substring(0, newSrc.length-4));
				flashes[j].onerror = function() {
					flashes[j].setAttribute("src", "/mspa/" + srcs[j]);
				}
			}
		}*/
	}

	const texts = document.getElementsByClassName("comic-text");
	for (let i = 0; i < texts.length; i++) {
		texts[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['content']/*.replaceAll("|PESTERLOG|", "")*/;

		const links = texts[i].getElementsByTagName("a");
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
			if (links[i].getAttribute("href").includes("/archive/external/")) {
				const split = links[i].getAttribute("href").split("/archive/external/");
				links[i].href = lang_info['external_links'][split[split.length-1]];
			}
		}

		const imgs =  texts[i].getElementsByTagName("img");
		for (let j = 0; j < imgs.length; j++) {
			// first redirect mspaintadventures.com to /mspa
			if (imgs[j].getAttribute("src").includes("http://www.mspaintadventures.com/")) {
				imgs[j].setAttribute("src", imgs[j].getAttribute("src").replaceAll("http://www.mspaintadventures.com/", "/mspa/"));
			} else if (imgs[j].getAttribute("src").includes("http://mspaintadventures.com/")) {
				imgs[j].setAttribute("src", imgs[j].getAttribute("src").replaceAll("http://mspaintadventures.com/", "/mspa/"));
			}
			// todo: try to load scraps, storyfiles the same way as media to check if exists
		}
	}

	// only works if using mspa page numbers
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

	// footnotes
	for (let k = 0; k < document.querySelectorAll("[id='page']").length; k++) {		// this loop is needed for Act 6 Act 5 Act 1 x2
		for (let i = 0; i < lang_info['footnote_files'].length; i++) {
			const footnote = await getJson(lang_info['data_dir_url'] + lang_info['footnote_files'][i]);
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

function onError(error) {
	console.log(`Error: ${error}`);
}

async function getJson(url) {
	return await (await fetch(url)).json();
}

function getNextPageNum(pageNum, i) {
	var pageNumNum = parseInt(pageNum) + i;
	pageNumNum = pageNumNum.toString();
	if (pageNumNum.length < pageNum.length) {
		pageNumNum = "0".repeat(pageNum.length-pageNumNum.length) + pageNumNum;
	}
	return pageNumNum;
}