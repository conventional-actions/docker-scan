import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'

async function run(): Promise<void> {
  try {
    const images: string[] = (core.getInput('image') || '').split(/\r?\n/)
    const tags: string[] = (core.getInput('tag') || 'latest').split(/\r?\n/)
    const severity: string = core.getInput('severity') || 'medium'
    const file: string = core.getInput('file') || 'Dockerfile'
    const token: string =
      core.getInput('token') || process.env['SNYK_AUTH_TOKEN'] || ''
    const excludeBase: boolean =
      (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
      'true'

    core.info(core.getInput('exclude-base'))

    if (!images) {
      core.error('image input is required')
      return
    }

    if (!token) {
      core.error('image token or env SNYK_AUTH_TOKEN is required')
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
