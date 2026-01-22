browser.storage.sync.get("translation_link").then(doThings, onError);

async function doThings(item) {
	const lang_info_url = item['translation_link'] || "https://gitea.roberd.me/forditasok/mspa-magyarul/raw/branch/main/lang_info.json";

	const lang_info = await getJson(lang_info_url)
	// urls to translation data
	const translation_MSPA_url = lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA'];

	// root url to assets tree
	const translated_assets_url = lang_info['assets_dir_url'];
	// load in translation data files
	const mspa_data = await getJson(translation_MSPA_url);

	// maybe should disable the option for homestuck.com page numbering and get the current page from url instead
	const pageNum = document.getElementById('content').dataset.p;
	
	document.title = mspa_data[pageNum]['title'] + " - MSPA To Go"
	// all these loops are needed because of Act 6 Act 5 Act 1 x2
	const titles = document.querySelectorAll("[id='title']");
	for (let i = 0; i < titles.length; i++) {
		titles[i].innerHTML = mspa_data[getNextPageNum(pageNum, i)]['title'];		
	}
	// only gifs for now, flashes almost work, openbound I don't even know where to begin
	const medias = document.querySelectorAll("[id='media']");
	var allSrcs = []
	for (let i = 0; i < medias.length; i++) {
		const imgs = medias[i].getElementsByTagName("img");
		var srcs = [];
		if (imgs.length > 0) {
			for (let j = 0; j < imgs.length; j++) {
				srcs.push(imgs[j].getAttribute("src").substring(6));
				imgs[j].src = translated_assets_url + srcs[j];
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
				const newSrc = translated_assets_url + srcs[j];
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
	}

	// only works if using mspa page numbers
	const commandses = document.getElementsByClassName("commands");
	for (let i = 0; i < commandses.length; i++) {
		const commands = commandses[i].getElementsByClassName("command");
		for (let j = 0; j < commands.length; j++) {
			var href = commands[j].firstElementChild.getAttribute("href").split("/");
			if (href.length > 1) {
				commands[j].firstElementChild.innerHTML = mspa_data[href[href.length-1]]['title'];
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