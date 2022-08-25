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

    const scanVersion = core.getInput('scan-version')
    const downloadPath = await tc.downloadTool(
      `https://github.com/docker/scan-cli-plugin/releases/download/${scanVersion}/docker-scan_linux_${osArch}`
    )
    const toolPath = await tc.cacheDir(
      downloadPath,
      'docker-scan',
      scanVersion,
      os.arch()
    )
    const pluginPath = `${os.homedir()}/.docker/cli-plugins`

    await io.mkdirP(pluginPath)
    await io.cp(toolPath, `${pluginPath}/docker-scan`)

    await exec.exec('chmod', ['+x', `${pluginPath}/docker-scan`])

    // exec.exec("apt", ["install", "docker-scan-plugin"])
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
