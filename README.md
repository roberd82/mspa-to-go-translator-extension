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
```
The Assets folder should contain your translated assets (images, gifs, flashes), and should mirror the structure of the Asset Pack.
The Data folder should have your .json files with the translated text.
