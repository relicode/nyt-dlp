#!/usr/bin/env node

import download from './nyt-dlp.js'

const cliArgs = process.argv.slice(2)

await download(cliArgs, {
  // audioOnly: false,
  // autoIndex: false,
  downloadDir: process.env.DOWNLOAD_DIR || './downloads',
  handleDownloadUpdate: (parsedData) => {
    console.table(parsedData)
  },
  onExit: (code, signal) => {
    console.log('Custom exit')
    console.table({ code, signal })
  }
})

console.log('Finished!')
process.exit(0)

