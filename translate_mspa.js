const getting = browser.storage.sync.get("translation_link");
getting.then(doThings, onError);

async function doThings(item) {
	const lang_info_url = item['translation_link'];

	// get lang_info, comment this out when offline testing
	const lang_info = await getJson(lang_info_url)
	// urls to translation data
	const translation_MSPA_url = lang_info['data_dir_url'] + lang_info['data_files']['translation_MSPA'];
	// root url to assets tree
	const translated_assets_url = lang_info['assets_dir_url'];

	const pageNum = document.getElementById('content').dataset.p;

	const mspa_data = await getJson(translation_MSPA_url);

	document.getElementById('title').innerHTML = mspa_data[pageNum]['title'];
	// only standard gifs for now
	const imgs = document.getElementById("media").getElementsByTagName("img");
	var srcs = [];
	for (let i = 0; i < imgs.length; i++) {
		srcs.push(imgs[i].getAttribute("src").split("/mspa/"));
		imgs[i].src = translated_assets_url + srcs[i][srcs[i].length-1];
		imgs[i].onerror = function() {
			imgs[i].src = "/mspa/" + srcs[i][srcs[i].length-1];
		}
	}

	document.getElementsByClassName("comic-text").item(0).innerHTML = mspa_data[pageNum]['content']/*.replaceAll("|PESTERLOG|", "")*/;
	// only works if using mspa page numbers
	const commands = document.getElementsByClassName("command");
	for (let i = 0; i < commands.length; i++) {
		var href = commands[i].firstElementChild.getAttribute("href").split("/");
		commands[i].firstElementChild.innerHTML = mspa_data[href[href.length-1]]['title'];
	}
  
}

function onError(error) {
  console.log(`Error: ${error}`);
}

async function getJson(url) {
	return await (await fetch(url)).json();
}
