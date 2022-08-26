import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {parseInputFiles} from './utils'

async function run(): Promise<void> {
  try {
    const images = parseInputFiles(core.getInput('image') || '')
    core.debug(`images = ${images}`)

    const tags = parseInputFiles(core.getInput('tag') || 'latest')
    core.debug(`tags = ${tags}`)

    const severity = core.getInput('severity') || 'medium'
    core.debug(`severity = ${severity}`)

    const file = core.getInput('file') || 'Dockerfile'
    core.debug(`file = ${file}`)

    const excludeBase =
      (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
      'true'
    core.debug(`excludeBase = ${excludeBase}`)

    if (!images || !images.length) {
      core.setFailed('image input is required')
      return
    }

    let args = [
      'scan',
      '--accept-license',
      '--dependency-tree',
      '--severity',
      severity,
      '--file',
      file
    ]

    if (excludeBase) {
      args = args.concat('--exclude-base')
    }

    return core.group('Scanning', async () => {
      images.map(async image =>
        tags.map(async tag => {
          core.info(`Scanning ${image}:${tag}`)
          return exec.exec('docker', args.concat(`${image}:${tag}`))
        })
      )
      return
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
