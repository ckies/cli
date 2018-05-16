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
  .option('--flat', 'Skip language folder and export single language', prog.BOOL)
  .option('--silent', 'Skip console output for build process', prog.BOOL)
  .option('--language <language>', 'Just generate pages for <language>', prog.STRING)
  .option('--config <file>', 'Use <file> asconfiguration', prog.STRING, 'cookies.yml')
  .option('--format <type>', 'Use <type> to configure file format (html, markdown)', /^html|markdown$/, 'html')
  .option('--output <path>', 'Write files to <path>', prog.STRING)
  .action((args, options, logger) => {
    const cfg = new Config(options.config)

    if (options.language) {
      cfg.setLanguage(options.language)
    }

    if (!options.silent) {
      console.log(`Build Cookie Policy & Settings:`)
    }

    if (options.flat && cfg.languages.length > 1) {
      console.log(`\nError: You cannot pass --single and configure multiple languages`)
      process.exit(1)
    }

    if (cfg.languages.length === 0) {
      console.log(`\nError: No language(s) configured`)
      process.exit(1)
    }

    if (!options.silent && cfg.languages.length > 0) {
      console.log(` - ${cfg.languages.length} Language(s)`)
      cfg.languages.map(
        (language) => console.log(`     - ${language}`)
      )
    }

    if (!options.silent && cfg.services.length > 0) {
      console.log(` - ${cfg.services.length} Service(s):`)
      cfg.services.map(
        (service) => console.log(`     - ${service.name}`)
      )
    }

    if (!options.silent && cfg.services.length > 0 && cfg.additions.length > 0) {
      console.log(` - ${cfg.additions.length} Custom Cookie(s)`)
      cfg.additions.map(
        (addition) => console.log(`     - ${addition.name}`)
      )
    }

    if (!options.silent && cfg.cookies.length > 0) {
      console.log(` - ${cfg.cookies.length} Total Cookie(s)`)
      cfg.cookies.map(
        (cookie) => console.log(`     - ${cookie.name}`)
      )
    }

    if (!options.silent && !options.output) {
      console.log(` - Skipped build process.\n   Use --output to configure destination.`)
      return
    }

    const outputPath = path.resolve(options.output)

    if (!options.silent) {
      console.log(` - Building …`)
    }

    const builderOptions = { cookies: cfg.cookies, links: cfg.links }
    const languages = cfg.languages.map(
      (language) => ({
        files: {
          policy: new Builder(new Policy(language), builderOptions),
          settings: new Builder(new Settings(language), builderOptions)
        },
        language
      })
    )

    languages.forEach(
      (language) => {
        let languagePath

        if (options.flat) {
          languagePath = path.resolve(outputPath)
        } else {
          languagePath = path.resolve(outputPath, `${language.language}/`)
        }

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

    if (!options.silent) {
      console.log(` - Files written to ./${path.relative(path.resolve('.'), outputPath)}`)
    }
  })

prog.parse(process.argv)
