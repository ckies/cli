#! /usr/bin/env node

import * as prog from 'caporal'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'

import { Builder } from '@ckies/builder'
import { Policy, Settings } from '@ckies/pages'

import { Config } from '../lib/Config'

const pkg = JSON.parse(
  fs.readFileSync(`${__dirname}/../../package.json`).toString()
)

prog
  .version(pkg.version || '0.0.0-dev')
  .option('--config <file>', 'Use <file> asconfiguration', prog.STRING, 'cookies.yml')
  .option('--format <type>', 'Use <type> to configure file format (html, markdown)', /^html|markdown$/, 'html')
  .option('--output <path>', 'Write files to <path>', prog.STRING)
  .action((args, options, logger) => {
    const cfg = new Config(options.config)

    console.log(`Build Cookie Policy & Settings:`)

    console.log(` - ${cfg.languages.length} Language(s)`)
    cfg.languages.map(
      (language) => console.log(`     - ${language}`)
    )

    if (cfg.services.length > 0) {
      console.log(` - ${cfg.services.length} Service(s):`)
      cfg.services.map(
        (service) => console.log(`     - ${service.name}`)
      )
    }

    if (cfg.services.length > 0 && cfg.additions.length > 0) {
      console.log(` - ${cfg.additions.length} Custom Cookie(s)`)
      cfg.additions.map(
        (addition) => console.log(`     - ${addition.name}`)
      )
    }

    console.log(` - ${cfg.cookies.length} Total Cookie(s)`)
    cfg.cookies.map(
      (cookie) => console.log(`     - ${cookie.name}`)
    )

    if (!options.output) {
      console.log(` - Skipped build process.\n   Use --output to configure destination.`)
      return
    }

    const outputPath = path.resolve(options.output)

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
        const languagePath = path.resolve(outputPath, `${language.language}/`)
        mkdirp.sync(languagePath)

        if (options.format === 'markdown') {
          fs.writeFileSync(path.resolve(languagePath, `policy.md`), language.files.policy.toMarkdown())
          fs.writeFileSync(path.resolve(languagePath, `settings.md`), language.files.settings.toMarkdown())
        } else {
          fs.writeFileSync(path.resolve(languagePath, `policy.html`), language.files.policy.toHTML())
          fs.writeFileSync(path.resolve(languagePath, `settings.html`), language.files.settings.toHTML())
        }
      }
    )
    console.log(` - Files written to ./${path.relative(path.resolve('.'), outputPath)}`)
  })

prog.parse(process.argv)
