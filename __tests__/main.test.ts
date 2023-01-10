import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_EXCLUDE_BASE'] = 'true'
  process.env['INPUT_IMAGE'] = 'github/actions'
  process.env['INPUT_TAG'] = 'latest'
  process.env['INPUT_SEVERITY'] = 'high'
  process.env['INPUT_FILE'] = 'docker/alpine/Dockerfile'
  process.env['INPUT_TOKEN'] = 'lkjdfkjdsklf'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'dist', 'main', 'index.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
    stdio: 'pipe'
  }
  try {
    console.log(cp.execFileSync(np, [ip], options).toString())
  } catch (error) {
    console.error(error)
  }
})
