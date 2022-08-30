import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import {getConfig} from './config'

async function run(): Promise<void> {
  try {
    const config = await getConfig()

    if (
      !(
        (config.images && config.images.length) ||
        (config.images && config.images.length)
      )
    ) {
      throw new Error('image input or tag is required')
    }

    let args = [
      'scan',
      '--accept-license',
      '--dependency-tree',
      '--severity',
      config.severity
    ]

    if (config.excludeBase) {
      args = args.concat('--exclude-base')
    }

    if (fs.existsSync(config.file)) {
      args = args.concat('--file', config.file)
    }

    return core.group('Scanning', async () => {
      if (config.images && config.images.length) {
        config.images.map(async image => {
          if (config.tags && config.tags.length) {
            config.tags.map(async tag => {
              core.info(`Scanning ${image}:${tag}`)
              return exec.exec('docker', args.concat(`${image}:${tag}`))
            })
          } else {
            core.info(`Scanning ${image}`)
            return exec.exec('docker', args.concat(image))
          }
        })
      } else if (config.tags && config.tags.length) {
        config.tags.map(async tag => {
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
