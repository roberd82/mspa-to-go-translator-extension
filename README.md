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
│  │  ├─ page-footer-left.html
│  │  ├─ page-footer-right.html
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
The originals can be found in the Asset Pack's `/archive/data` folder.

The public folder should contain .html files, that contain content, that will be replaced on the site.