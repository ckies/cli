import { Cookie } from '@ckies/builder'
import { Service } from '@ckies/definitions'
import { Policy, Settings } from '@ckies/pages'

import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

export interface Configuration {
  languages?: string[]
  services?: string[]
  additions?: Cookie[]
}

export class Config {
  private data: Configuration

  constructor(config: string | Configuration) {
    if (typeof config === 'string') {
      this.data = this.loadConfiguration(config)
    } else {
      this.data = config
    }
  }

  get services() {
    return (
      this.data.services || []
    ).map(
      (service) => new Service(service)
    )
  }

  get additions() {
    return (
      this.data.additions || []
    )
  }

  get languages() {
    return this.data.languages || []
  }

  get cookies() {
    return [].concat.apply(
      this.additions,
      this.services.map(
        (service) => service.cookies
      )
    ).sort(
      (a: Cookie, b: Cookie) => a.name > b.name ? 1 : -1
    ) as Cookie[]
  }

  public Policy(language: string) {
    return new Policy(language)
  }

  public Settings(language: string) {
    return new Settings(language)
  }

  private loadConfiguration(file: string) {
    if (!fs.existsSync(this.path(file))) {
      throw new Error(`Unable to find config: ${this.path}`)
    }

    try {
      return yaml.safeLoad(
        fs.readFileSync(this.path(file), 'utf8')
      ) as Configuration
    } catch (e) {
      throw new Error(`Unable to parse file: ${e.message}`)
    }
  }

  private path(file: string) {
    return path.resolve(file)
  }
}
