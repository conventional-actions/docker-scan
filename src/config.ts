import {parseMultiInput} from '@conventional-actions/toolkit'
import * as core from '@actions/core'
import os from 'os'
import * as io from '@actions/io'

type Config = {
  version: string
  snyk_token: string
  github_token: string
  images: string[]
  tags: string[]
  severity: string
  file: string
  excludeBase: boolean
  pluginDir: string
  pluginPath: string
}

export const getConfig = async (): Promise<Config> => {
  const excludeBase =
    (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
    'true'

  const pluginDir = `${os.homedir()}/.docker/cli-plugins`
  core.debug(`plugin dir is ${pluginDir}`)
  await io.mkdirP(pluginDir)

  const pluginPath = `${pluginDir}/docker-scan`
  core.debug(`plugin path is ${pluginPath}`)

  const config: Config = {
    version: core.getInput('version') || 'latest',
    snyk_token:
      core.getInput('token') ||
      process.env['SNYK_TOKEN'] ||
      process.env['SNYK_AUTH_TOKEN'] ||
      '',
    github_token: process.env['GITHUB_TOKEN'] || '',
    images: parseMultiInput(core.getInput('image') || ''),
    tags: parseMultiInput(core.getInput('tag') || ''),
    severity: core.getInput('severity') || 'medium',
    file: core.getInput('file') || 'Dockerfile',
    excludeBase,
    pluginDir,
    pluginPath
  }

  if (
    !(
      (config.images && config.images.length) ||
      (config.images && config.images.length)
    )
  ) {
    throw new Error('image input or tag is required')
  }

  return config
}
