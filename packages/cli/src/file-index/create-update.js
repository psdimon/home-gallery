const log = require('@home-gallery/logger')('cli.index.update')

const command = {
  command: ['$0', 'create', 'update'],
  describe: 'Create or update file index',
  builder: (yargs) => {
    return yargs.option({
      index: {
        alias: 'i',
        describe: 'File index filename',
        default: 'index.idx'
      },
      directory: {
        alias: ['d', 'dir'],
        describe: 'Directory of file index',
        default: '.'
      },
      checksum: {
        alias: 'C',
        boolean: true,
        default: true,
        describe: 'Create file checksums'
      },
      exclude: {
        alias: 'e',
        array: true,
        describe: 'Exclude gitignore pattern'
      },
      'exclude-from-file': {
        alias: 'E',
        describe: 'Exclude gitignore patterns from file'
      },
      'dry-run': {
        alias: 'n',
        describe: 'Do not perform any writes'
      },
      'exclude-if-present': {
        alias: 'X',
        describe: 'Exclude files and directories if file is present'
      },
      'matcher': {
        alias: 'm',
        default: 'size-ctime-inode',
        describe: `File matcher for index merge by: size, size-ctime, size-ctime-inode`
      },
      'max-filesize': {
        string: true,
        describe: `Limit files up to given filesize. Example values are 2096, 5M or 0.2G`
      },
      'add-limits': {
        string: true,
        describe: `Limits of new index files for incremental imports. Format is initial,add?,factor?,max? eg. 200,500,1.25,8000`
      },
      'journal': {
        alias: 'j',
        string: true,
        describe: `Create index journal with given id`
      },
    })
    .demandOption(['index', 'directory'])
  },
  handler: (argv) => {
    const { update, matcherFns } = require('@home-gallery/index');

    const options = {
      checksum: argv.checksum,
      exclude: argv.exclude,
      excludeFromFile: argv['exclude-from-file'],
      excludeIfPresent: argv['exclude-if-present'],
      dryRun: argv['dry-run'],
      matcherFn: matcherFns[argv.m] || matcherFns['size-ctime-inode'],
      maxFilesize: argv.maxFilesize,
      addLimits: argv.addLimits,
      journal: argv.journal
    }
    update(argv.directory, argv.index, options, (err, _, limitExceeded) => {
      if (err && err.code == 'EUSERABORT') {
        log.warn(`Index creation aborted: ${err}`)
      } else if (err) {
        log.error(`Failed to create index: ${err}`)
      }
      process.exit(err ? 2 : (limitExceeded ? 1 : 0))
    })
  }
}

module.exports = command
