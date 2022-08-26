import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import os from 'os'

async function run(): Promise<void> {
  try {
    let osArch: string
    switch (os.arch()) {
      case 'x64':
        osArch = 'amd64'
        break

      default:
        osArch = os.arch()
        return
    }

    const token =
      core.getInput('token') ||
      process.env['SNYK_TOKEN'] ||
      process.env['SNYK_AUTH_TOKEN'] ||
      ''
    if (token) {
      core.setSecret(token)
    }

    const scanVersion = core.getInput('scan-version') || 'latest'
    core.debug(`downloading ${scanVersion} version`)

    const pluginPath = `${os.homedir()}/.docker/cli-plugins`
    core.debug(`plugin path ${pluginPath}`)
    await io.mkdirP(pluginPath)

    const downloadPath = await tc.downloadTool(
      scanVersion === 'latest'
        ? `https://github.com/docker/scan-cli-plugin/releases/latest/download/docker-scan_linux_${osArch}`
        : `https://github.com/docker/scan-cli-plugin/releases/download/${scanVersion}/docker-scan_linux_${osArch}`,
      `${pluginPath}/docker-scan`
    )
    core.debug(`downloaded to ${downloadPath}`)

    const toolPath = await tc.cacheFile(
      downloadPath,
      'docker-scan',
      'docker-scan',
      scanVersion,
      os.arch()
    )
    core.debug(`tool path ${toolPath}`)

    await exec.exec('chmod', ['+x', `${pluginPath}/docker-scan`])
    if (token) {
      core.info('logging into snyk')
      await exec.exec(`${pluginPath}/docker-scan`, [
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
