# Morpheus

An interactive story engine.

With Morpheus you can play so-called "books", compilations of places and characters, all with their own characteristics and agendas. Talk to AI-controlled NPCs, explore new places and let unfold a unique story no one has experienced before.

## Installation

### 1. Install Node.js

Install from here: https://nodejs.org/

### 2. Copy or Clone the Repository

You can download a ZIP file via Github's "Download ZIP" function. Unpack it in a new folder on your computer.

Alternatively you can clone this repository using Git:

```
git clone https://github.com/AlphaOrange/Morpheus.git
```

### 3. Install Dependencies

Use npm to install project dependencies:

```
npm install
```

### 4. Add Books

If you want to add custom books, copy the book folder with all its content into `/src/books`. See `documentation/write_books.md` for more information about writing books.

You can find books here:

- [Minimmal Book Boilerplate](https://github.com/AlphaOrange/Morpheus-Books-Minimal)
- [Example Book](https://github.com/AlphaOrange/Morpheus-Books-Example)

### 5. Set environmental variables

_Morpheus_ uses Google Gemini for controlling the NPC actions. The app does not include a Google API key, it must be entered under "Options" in the app.

If you want to add your API key as preset, create a file called `.env.local`and put your API key inside:

```
VITE_GEMINI_API_KEY=[your key]
```

Be careful to not share your key by accidentally uploading to Git or contain it in production code.

### 6. Built and Run App

Run locally:

```
npm run build
```

and open the `localhost` Link provided in the terminal.

Alternatively built for server upload:

```
npm run preview
```

Then copy content of `/dist` to a web server of your choice. You might need to configure your server, e.g. for routing to work properly.

## Play

If you run the app without putting your Google Gemini API key in an `.env` file, first go to "Options" and insert it under "API Key". _Morpheus_ will never send your key anywhere but to the Google Gemini API endpoint. However it will be included in your savegame (currently stored locally in your browser).

## Customize

### Impressum

If your jurisdiction requires a legal notice:

1. Copy `public/content/impressum.placeholder.html`
2. Rename to `public/impressum.local.html`
3. Replace with your own legal information

Your impressum will then be shown under "About"
