#! /usr/bin/env node

import * as prog from 'caporal'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'

import { Builder } from '@ckies/builder'
import { Policy, Settings } from '@ckies/pages'

import { Config } from '../lib/Config'

prog
  .version('0.0.1')
  .option(
    '--config <file>',
    'Use <file> configuration. Default to `cookies.yml`',
    prog.STRING,
    'cookies.yml'
  )
  .action((args, options, logger) => {
    const cfg = new Config(options.config)

    console.log(`Running for ${cfg.name} (${options.config}):`)

    console.log(` - ${cfg.languages.length} Language(s)`)
    cfg.languages.map(
      (language) => console.log(`     - ${language}`)
    )

    console.log(` - ${cfg.services.length} Service(s):`)
    cfg.services.map(
      (service) => console.log(`     - ${service.name}`)
    )

    console.log(` - ${cfg.additions.length} Custom Cookie(s)`)
    cfg.additions.map(
      (addition) => console.log(`     - ${addition.name}`)
    )

    console.log(` - ${cfg.cookies.length} Total Cookie(s)`)
    cfg.cookies.map(
      (cookie) => console.log(`     - ${cookie.name}`)
    )

    if (!cfg.output) {
      return
    }

    console.log(` - Building …`)
    const languages = cfg.languages.map(
      (language) => ({
        files: {
          policy: new Builder(new Policy(language), cfg.cookies),
          settings: new Builder(new Settings(language), cfg.cookies)
        },
        language
      })
    )

    languages.forEach(
      (language) => {
        if (!cfg.output) {
          return
        }

        const languagePath = path.resolve(cfg.output, `${language.language}/`)
        mkdirp.sync(languagePath)

        fs.writeFileSync(path.resolve(languagePath, `policy.html`), language.files.policy.toHTML())
        fs.writeFileSync(path.resolve(languagePath, `settings.html`), language.files.settings.toHTML())
      }
    )
  })

prog.parse(process.argv)
