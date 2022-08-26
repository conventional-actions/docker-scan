import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import os from 'os'

async function run(): Promise<void> {
  try {
    let version = core.getInput('version') || 'latest'

    const pluginDir = `${os.homedir()}/.docker/cli-plugins`
    core.debug('plugin dir is ${pluginDir}')
    await io.mkdirP(pluginDir)

    const pluginPath = `${pluginDir}/docker-scan`
    core.debug(`plugin path is ${pluginPath}`)

    const manifest = await tc.getManifestFromRepo(
        'conventional-actions',
        'docker-scan',
        process.env['GITHUB_TOKEN'] || '',
        'main'
    )
    core.debug(`manifest = ${JSON.stringify(manifest)}`)

    const rel = await tc.findFromManifest(
        version === 'latest' ? '*' : version,
        true,
        manifest,
        os.arch()
    )
    core.debug(`rel = ${JSON.stringify(rel)}`)

    if (rel && rel.files.length > 0) {
      version = rel.version
      const downloadUrl = rel.files[0].download_url
      core.debug(`downloading from ${downloadUrl}`)

      const downloadPath = await tc.downloadTool(downloadUrl)
      core.debug(`downloaded to ${downloadPath}`)

      await exec.exec('chmod', ['+x', downloadPath])

      core.debug(`copying ${downloadPath} to ${pluginPath}`)
      await io.cp(downloadPath, pluginPath)

      core.debug('caching tool')
      const toolPath = await tc.cacheFile(
          downloadPath,
          'docker-scan',
          'docker-scan',
          version,
          os.arch()
      )
      core.debug(`tool path ${toolPath}`)
    } else {
      throw new Error(`could not find docker-scan ${version} for ${os.arch()}`)
    }

    const token =
      core.getInput('token') ||
      process.env['SNYK_TOKEN'] ||
      process.env['SNYK_AUTH_TOKEN'] ||
      ''
    if (token) {
      core.setSecret(token)
      core.info('Logging into snyk')

      await exec.exec('docker', [
        'scan',
        '--accept-license',
        '--login',
        '--token',
        token
      ])
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
