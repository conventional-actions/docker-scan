import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import {parseInputFiles} from './utils'

async function run(): Promise<void> {
  try {
    const images = parseInputFiles(core.getInput('image') || '')
    const tags = parseInputFiles(core.getInput('tag') || 'latest')
    const severity = core.getInput('severity') || 'medium'
    const file = core.getInput('file') || 'Dockerfile'
    const token =
      core.getInput('token') ||
      process.env['SNYK_TOKEN'] ||
      process.env['SNYK_AUTH_TOKEN'] ||
      ''
    const excludeBase =
      (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
      'true'

    core.info(core.getInput('exclude-base'))

    if (!images) {
      core.setFailed('image input is required')
      return
    }

    if (!token) {
      core.setFailed(
        'image token or env SNYK_TOKEN or env SNYK_AUTH_TOKEN is required'
      )
      return
    }

    let args = [
      'scan',
      '--accept-license',
      '--dependency-tree',
      '--file',
      file,
      '--severity',
      severity
    ]

    if (excludeBase) {
      args = args.concat('--exclude-base')
    }

    if (token) {
      core.setSecret(token)
      args = args.concat('--token', token)
    }

    const options: ExecOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          core.info(data.toString())
        },
        stderr: (data: Buffer) => {
          core.error(data.toString())
        }
      }
    }

    images.map(async image =>
      tags.map(async tag =>
        exec.exec('docker', args.concat(`${image}:${tag}`), options)
      )
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
