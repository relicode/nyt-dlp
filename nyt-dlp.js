import { spawn } from 'node:child_process'

import chalk from 'chalk'

const defaultHandler = (eventName, color = 'green') => () => console.log(chalk[color](eventName))

const defaultOptions = {
  audioOnly: false,
  autoIndex: false,
  handleDownloadUpdate: (parsedData) => {
    console.table(parsedData)
  },
  onClose: (code, _signal) => {
    const eventName = 'CLOSE'
    const message = code === 0 ? chalk.green(eventName) : chalk.red(eventName)
    console.log(message)
  },
  onDisconnect: defaultHandler('disconnect'),
  onError: defaultHandler('error', 'red'),
  onExit: (code, _signal) => {
    const eventName = 'EXIT'
    const message = code === 0 ? chalk.green(eventName) : chalk.red(eventName)
    console.log(message)
  },
  onMessage: defaultHandler('message'),
  onSpawn: defaultHandler('spawn'),
  downloadDir: '',
}

const statusMessageRegExp = new RegExp([
  '^\\D*\\[download\\]',  // Message identifier
  '(\\d+\\.\\d+)',        // Loaded percentage
  '(\\d+\\.\\d+)(\\S+)',  // File size & file size unit
  '(\\d+\\.\\d+)(\\S+)',  // Download speed & download speed unit
  '(\\d+:\\d+).*$',       // ETA as HH:mm
].join('\\D+'))

const jStr = (obj) => JSON.stringify(obj, null, 2)
const checkArgs = (urlsAndArgs, options) => {
  if (
    !Array.isArray(urlsAndArgs)
    || !urlsAndArgs[0]
    || typeof urlsAndArgs[0] !== 'string'
  ) return `Invalid urlsAndArgs (${typeof urlsAndArgs}): ${jStr(urlsAndArgs)}`

  if (
    !options
    || typeof options !== 'object'
  ) return `Invalid options (${typeof options}): ${jStr(options)}`

  if (
    !process.env.DOWNLOAD_DIR && !options.downloadDir
  ) return `No download dir found! ${jStr({ env: process.env, options })}`

  return ''
}

export const download = (urlsAndArgs, options = {}) => new Promise((res, rej) => {
  const argsError = checkArgs(urlsAndArgs, options)
  if (argsError) throw new Error(argsError)

  const opts = {
    ...defaultOptions,
    ...options,
  }

  const args = [
    '--exec', 'detox',
    '--no-playlist',
    '--proxy', 'socks5://192.168.1.10:1337',
    '--paths', opts.downloadDir || process.env.DOWNLOAD_DIR,
    '--output', opts.autoIndex
      ? '%(playlist)s/%(playlist_index)05d___%(title)s.%(ext)s'
      : '%(title)s.%(ext)s',
    ...(opts.audioOnly ? ['--extract-audio'] : []),
    ...urlsAndArgs,
  ]

  const subProcess = spawn('yt-dlp', args, {})
  subProcess.on('close', opts.onClose)
  subProcess.on('disconnect', opts.onDisconnect)
  subProcess.on('error', opts.onError)
  subProcess.on('exit', opts.onExit)
  subProcess.on('message', opts.onMessage)
  subProcess.on('spawn', opts.onSpawn)

  subProcess.stdout.on('data', (data) => {
    const stringified = String(data)
    console.log(stringified)
    const groups = statusMessageRegExp.exec(stringified)
    if (groups === null) return

    const [
      _, percentageStr, fileSizeStr, fileSizeUnit,
      downloadSpeedStr, downloadSpeedUnit, timeLeft,
    ] = groups

    const [percentage, fileSize, downloadSpeed] = [percentageStr, fileSizeStr, downloadSpeedStr]
      .map((u) => parseInt(u, 10))

    const parsed = {
      fileSizeUnit, downloadSpeedUnit, timeLeft,
      percentage, fileSize, downloadSpeed,
    }

    if (typeof opts.handleDownloadUpdate === 'function') opts.handleDownloadUpdate(parsed)
  })

  subProcess.once('exit', (code, signal) => {
    if (code === 0) return res({ code, signal })
    return rej({ code, signal })
  })
})

export default download

