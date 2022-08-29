import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {parseInputFiles} from './utils'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const images = parseInputFiles(core.getInput('image') || '')
    core.debug(`images = ${images}`)

    const tags = parseInputFiles(core.getInput('tag') || '')
    core.debug(`tags = ${tags}`)

    const severity = core.getInput('severity') || 'medium'
    core.debug(`severity = ${severity}`)

    const file = core.getInput('file') || 'Dockerfile'
    core.debug(`file = ${file}`)

    const excludeBase =
      (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
      'true'
    core.debug(`excludeBase = ${excludeBase}`)

    if (!((images && images.length) || (images && images.length))) {
      core.setFailed('image input or tag is required')
      return
    }

    let args = [
      'scan',
      '--accept-license',
      '--dependency-tree',
      '--severity',
      severity
    ]

    if (excludeBase) {
      args = args.concat('--exclude-base')
    }

    if (fs.existsSync(file)) {
      args = args.concat('--file', file)
    }

    return core.group('Scanning', async () => {
      if (images && images.length) {
        images.map(async image => {
          if (tags && tags.length) {
            tags.map(async tag => {
              core.info(`Scanning ${image}:${tag}`)
              return exec.exec('docker', args.concat(`${image}:${tag}`))
            })
          } else {
            return exec.exec('docker', args.concat(image))
          }
        })
      } else if (tags && tags.length) {
        tags.map(async tag => {
          core.info(`Scanning ${tag}`)
          return exec.exec('docker', args.concat(tag))
        })
      }
      return
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
