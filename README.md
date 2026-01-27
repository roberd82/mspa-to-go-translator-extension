# MSPA To Go Translator Extension
This extension applies translations to MSPA To Go mirrors.
## Making a compatible translation
The extensions main goal is to make translation mods made for the Unofficial Homestuck Collection readable on mobile phones (hence the support only for Firefox, since Chrome mobile doesn't have extensions). Because of this the translations structure should look like this:
```
your-translation/
├─ Assets/
├─ Data/
├─ public/
│  ├─ replace/
│  │  ├─ menu-bar.html
│  │  ├─ menu-bar-caliborn.html
│  │  ├─ footer.html
│  │  ├─ page-footer.html
│  │  ├─ options.html
│  ├─ news/
│  │  ├─ index.html
│  ├─ index.html
├─ mod.js
```
The Assets folder should contain your translated assets (images, gifs, flashes), and should mirror the structure of the Asset Pack.

The Data folder should have your .json files with the translated text in this format:
```
{
    "000002": {
      "title": "Start Jailbreak Adventure",
      "content": "You wake up locked in a deserted jail cell, completely alone. There is nothing at all in your cell, useful or otherwise."
    },
    "000003": {
      "title": "Attempt to pry open window.",
      "content": "There are no objects around with which to &quot;pry open window&quot;."
    },
    ...
    "010030": {
      "title": "[S] ==>",
      "content": ""
    }
}
```
The originals can be found in the Asset Pack's `/archive/data` folder. The `mspa.json` file has more json objects, that just the mspa pages text, those should be moved in different .json files and the main text should be elevated from the "story" object into the root of the json.

The public folder should contain .html files, that contain content, that will be replaced on the site.

## `lang_info` values explained
(Page number always refers to the MSPA page numbers, the Viz numbering is not supported and the extension disables it completely)
- "hs_progress": the latest translated Homestuck page's number
- "ps_progress": same but for Problem Sleuth
- "progress_text": text to be displayed at the top of the `/archive` page, the six 9s get replaced with the HS progress, the six 0s with the PS progress
- "progress_message": what will replace the commands to all the untranslated pages
- "lang": the name of your lang in your language
- "code": your language's lang code
- "assets_dir_url": your `Assets` folder, that mirrors the Asset Pack's structure (must have a trailing `/`)
- "data_dir_url": your `Data` folder with all your .json files (I recommend prefixing it with your lang code like this: `enData`)
- "data_files":
  - "translation_MSPA": the main translation file
  - "sbahj_comic_list": the comic list for SBAHJ in this format
  ```
  {
    "listedPages": [
      {"url": "/sbahj/46", "title": "COMIC #46: the game........... is afoof"},
      {"url": "/sbahj/45", "title": "COMIC #45: cloink"},
      ...
      {"url": "/sbahj/1", "title": "COMIC #1: man listen, stairs. i am TELLING you"}
    ]
  }
  ```
  - "footnotes": array of all your footnote files
- "external_links": links to every file from `/archive/external/` in the Asset Pack
- "replace_pages_url": the folder with .html files that contain content to be replaced
- "replace_menu_bar": the `<button id="menu-button">` element's outerHtml on the first line, then the menu-bars's links in order
- "replace_menu_bar-caliborn": same as the previous, just the Caliborn version
- "replace_footer": the `<div id="footer">` element's innerHtml
- "replace_page_footer": all the links in the `<div id="page-footer">` element
- "replace_page_content": pages that need to have the innerHtml of their `content` id div replaced
  - first element: the path wich to replace on
  - second element: the page title
  - thir element: the path to the .html file relative to "replace_pages_url"
  - there are three exceptions that work differently: the root `/`, `/options` and `/news`
    - `/`: save the main page of an MSPA To Go instance and edit the contents of the div with the `content` id manually
    - `/options`: almost works the same as the others, but only reads the label and span elements, must have the same order as on the normal page!
    - `/news`: needs to be in it's own folder and named `index.html`, has `news-content` tag instead of `content`
- "add_pages": adds completely new pages, need to be in their own folder and named `index.html` (actually just replaces the content of the 404 page, but whatever)

Look at the included template and [my translation](https://gitea.roberd.me/forditasok/mspa-magyarul) for reference.