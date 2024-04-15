#!/usr/bin/env node

import download from '../nyt-dlp.js'

const cliArgs = process.argv.slice(2)

await download(cliArgs)

process.exit(0)

