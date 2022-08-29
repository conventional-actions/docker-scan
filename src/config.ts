import {parseInputFiles} from './utils'
import * as core from '@actions/core'

type Config = {
  images: string[]
  tags: string[]
  severity: string
  file: string
  excludeBase: boolean
}

export const getConfig = async (): Promise<Config> => {
  const excludeBase =
    (core.getInput('excludeBase') || process.env['DOCKER_EXCLUDE_BASE']) ===
    'true'

  const config: Config = {
    images: parseInputFiles(core.getInput('image') || ''),
    tags: parseInputFiles(core.getInput('tag') || ''),
    severity: core.getInput('severity') || 'medium',
    file: core.getInput('file') || 'Dockerfile',
    excludeBase
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
