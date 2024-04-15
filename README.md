# nyt-dlp - yt-dlp for node.js
This package provides a node.js library, cli and docker compose setup to for using [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Requirements
* node.js / cli
  - [NodeJS lts/iron](https://nodejs.org/en/blog/release/v20.9.0)
  - [ffmpeg](https://ffmpeg.org/)
* docker:
  - [docker](https://www.docker.com/)
  - support [docker compose](https://docs.docker.com/compose/)

#### Setup & Installation
Docker version can be run without setup. For CLI & library run `npm install`. After this you can either run the CLI with `node </path/to/nyt-dlp>` or install the binary globally with `npm i -g`.

## Usage:
The CLI and docker compose (that runs the CLI underneath) both accept command line parameters that get passed directly to `yt-dlp`.

**CLI & docker compose**
```bash
./cli.js 'https://www.youtube.com/watch?v=zGDzdps75ns'
nyt-dlp 'https://www.youtube.com/watch?v=zGDzdps75ns' # globally installed
docker compose run nytdlp nyt-dlp --extract-audio 'https://www.youtube.com/watch?v=zGDzdps75ns'
```

**Library**:
```javascript
import download from 'nyt-dlp'

await download(['https://www.youtube.com/watch?v=zGDzdps75ns', 'https://www.youtube.com/watch?v=QjqjoehA7kM'], {
  audioOnly: true,
  autoIndex: true,
  downloadDir: './downloads',
  handleDownloadUpdate: (parsedData) => {
    console.table(parsedData)
    /* Outputs
    ┌───────────────────┬─────────┐
    │ (index)           │ Values  │
    ├───────────────────┼─────────┤
    │ fileSizeUnit      │ 'MiB'   │
    │ downloadSpeedUnit │ 'MiB/s' │
    │ timeLeft          │ '00:00' │
    │ percentage        │ 100     │
    │ fileSize          │ 68      │
    │ downloadSpeed     │ 10      │
    └───────────────────┴─────────┘
    */
  },
  onExit: (code, signal) => {
    console.log('Custom exit')
    console.table({ code, signal })
  }
})
```

