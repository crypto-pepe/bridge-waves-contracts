import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import inquirer from 'inquirer';
import {
  seedWithNonce,
  address,
  base58Encode,
  keyPair,
} from '@waves/ts-lib-crypto';
import {
  NetworkConfig,
  getIntegerValue,
  getScriptInfo,
  invoke,
  ProofsGenerator,
} from '@pepe-team/waves-sc-test-utils';
import { getEnvironmentByName } from 'relax-env-json';
import { protoSerialize } from '@waves/waves-transactions';

const migrationsDir = './migrations/';

(async () => {
  const options = yargs
    .usage('Usage: --network <mainnet|testnet|custom> --mode <seed|ledger>')
    .env('SEED')
    .option('network', {
      alias: 'Network',
      describe: 'Network used for migrations deployment',
      type: 'string',
      choices: ['mainnet', 'testnet', 'custom'],
      default: 'custom',
      demandOption: true,
    })
    .option('mode', {
      alias: 'Mode',
      describe:
        'Mode for deployment: seed - everything is deployed via provided deployer seed, ledger - use multiple ledger signatures',
      type: 'string',
      choices: ['seed', 'ledger'],
      default: 'seed',
      demandOption: true,
    })
    .option('seed', {
      alias: 'Seed',
      describe: 'Deployer seed with waves tokens',
      type: 'string',
      default: 'waves private node seed with waves tokens',
      demandOption: true,
    }).argv;

  let network: NetworkConfig;

  switch (options.network) {
    case 'mainnet':
    case 'testnet':
    case 'custom':
      network = getEnvironmentByName(options.network).network;
      break;
    default:
      throw new Error('Select network: mainnet, testnet or custom');
  }

  const deployerSeed = options.seed;
  if (deployerSeed == null || deployerSeed == undefined || deployerSeed == '') {
    throw new Error('Set deployer seed');
  }
  const deployerPrivateKey = keyPair(deployerSeed).privateKey;
  const migrationContract = address(
    seedWithNonce(deployerSeed, 1),
    network.chainID
  );

  console.log('Migration contract address =', migrationContract);

  const migrationContractScript = await getScriptInfo(
    migrationContract,
    network
  ).catch((e) => {
    throw e;
  });

  if (!migrationContractScript || !migrationContractScript.script) {
    console.log('No migration contract deployed, do it ...');

    await deployMigrationScript(deployerSeed, network).catch((e) => {
      throw e;
    });

    console.log('Migration contract deployed at', migrationContract);
  }

  const lastCompletedMigration = await getCompletedMigration(
    migrationContract,
    network
  );

  fs.readdir(
    path.resolve(process.cwd(), migrationsDir),
    async (err, migrationFiles) => {
      if (err !== null) throw err;

      await migrationFiles
        .filter((v) => v.match('\\d+_.*.ts') !== null)
        .filter((v) => parseInt(v.split('_')[0]) > lastCompletedMigration)
        .sort((a, b) => {
          return parseInt(a.split('_')[0]) < parseInt(b.split('_')[0]) ? -1 : 1;
        })
        .reduce(
          async (migrationPromise, migration) => {
            await migrationPromise;

            const migrationVersion = parseInt(migration.split('_')[0]);

            const lastMigration = await getCompletedMigration(
              migrationContract,
              network
            );

            if (lastMigration + 1 !== migrationVersion) {
              throw new Error(
                'Migration version mismatch: old=' +
                  lastMigration +
                  ', new=' +
                  migration
              );
            }

            return new Promise<void>((resolve) => {
              // eslint-disable-next-line
              require(path.resolve(process.cwd(), migrationsDir, migration))
                .default(
                  deployerSeed,
                  lastMigration,
                  network,
                  options.mode == 'ledger'
                    ? ledgerProofsGenerator
                    : seedProofsGenerator
                )
                .then(() => {
                  console.log('Migration ' + migration + ' has been deployed');
                  invoke(
                    {
                      dApp: migrationContract,
                      call: {
                        function: 'setCompleted',
                        args: [
                          {
                            type: 'integer',
                            value: migrationVersion,
                          },
                        ],
                      },
                    },
                    deployerPrivateKey,
                    network,
                    undefined
                  )
                    .then(() => {
                      console.log(
                        'Migration ' + migration + ' has been commited'
                      );
                      resolve();
                    })
                    .catch((e) => {
                      throw JSON.stringify(e);
                    });
                }) // eslint-disable-next-line
                .catch((e: any) => {
                  throw JSON.stringify(e);
                });
            });
          },
          new Promise<void>((resolve) => {
            resolve();
          })
        );

      const currentMigration = await getCompletedMigration(
        migrationContract,
        network
      );
      console.log(
        'No migrations to run: current applied migration: ' + currentMigration
      );
    }
  );
})().catch((e) => {
  throw e;
});

// const seedProofsGenerator: ProofsGenerator = async () => [];

const seedProofsGenerator: ProofsGenerator = async (
  tx: Uint8Array,
  txId: string
) => {
  const txParsed = protoSerialize.protoBytesToTx(tx);
  console.log(txParsed);

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'name',
        message: 'Broadcast tx ' + txId + ' ?',
        waitUserInput: true,
      },
    ])
    .catch((e) => {
      throw JSON.stringify(e);
    });

  return [];
};

const ledgerProofsGenerator: ProofsGenerator = async (message: Uint8Array) => {
  const messageStr = base58Encode(message);
  const result: string[] = [];

  console.log('All ledger holders have to sign this transaction\n');
  console.log(messageStr, '\n');

  let signaturesCount = 0;

  await inquirer
    .prompt([
      {
        type: 'number',
        name: 'signaturesCount',
        message: 'How many signatures should be in result signature?',
        waitUserInput: true,
        validate: (input) => {
          return new Promise((resolve) => {
            const parsed = parseInt(input);
            resolve(
              parsed > 0 && parsed <= 10
                ? true
                : 'You can provide from 1 to 10 signatures'
            );
          });
        },
        filter: (input) => {
          const parsed = parseInt(input);
          return isNaN(parsed) || parsed <= 0 || parsed > 10 ? '' : parsed;
        },
      },
    ])
    .then((answers) => {
      signaturesCount = answers.signaturesCount;
    })
    .catch((e) => {
      throw JSON.stringify(e);
    });

  const prompts = [];
  for (let i = 1; i <= signaturesCount; i++) {
    prompts.push({
      type: 'string',
      name: 'signature_' + i,
      message: 'Enter signature ' + i,
      waitUserInput: true,
    });
  }

  await inquirer.prompt(prompts).then((answers) => {
    for (let i = 1; i <= signaturesCount; i++) {
      result.push(answers['signature_' + i]);
    }
  });

  return result;
};

async function deployMigrationScript(
  deployerSeed: string,
  network: NetworkConfig
) {
  const migrations = (
    await fs.promises.readdir(path.resolve(process.cwd(), migrationsDir))
  )
    .filter((v) => v.match('\\d+_.*.ts') !== null)
    .filter((v) => parseInt(v.split('_')[0]) === 1);

  if (migrations.length !== 1) {
    throw new Error('No initial migration');
  }

  // eslint-disable-next-line
  await require(path.resolve(process.cwd(), migrationsDir, migrations[0]))
    .default(deployerSeed, 0, network)
    .then(() => {
      console.log('Migration contract ' + migrations[0] + ' has been deployed');
    }) // eslint-disable-next-line
    .catch((e: any) => {
      throw new Error('Cannot deploy migration script: ' + JSON.stringify(e));
    });
}

async function getCompletedMigration(
  migrationContract: string,
  network: NetworkConfig
) {
  const lastMigration = await getIntegerValue(
    migrationContract,
    'LAST_COMPLETED_MIGRATION',
    network
  ).catch((e: object) => {
    throw new Error('No completed migration: ' + JSON.stringify(e));
  });

  return lastMigration;
}
