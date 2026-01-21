function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		translation_link: document.querySelector("#translation_link").value,
	});
}

function restoreOptions() {
	function setCurrentChoice(result) {
		document.querySelector("#translation_link").value = result.translation_link || "https://gitea.roberd.me/forditasok/mspa-magyarul/raw/branch/main/lang_info.json";
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	let getting = browser.storage.sync.get("translation_link");
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);