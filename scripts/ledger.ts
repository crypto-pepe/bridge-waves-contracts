import inquirer from 'inquirer';
import { WavesLedger } from '@waves/ledger';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import { base58Decode } from '@waves/ts-lib-crypto';
import { protoSerialize } from '@waves/waves-transactions';
import {
  WavesNetworkCustom,
  WavesNetworkMainnet,
  WavesNetworkTestnet,
} from '../utils/network';
import { exit } from 'process';

(async () => {
  console.log('Plug-in your ledger device and enter to WAVES application\n');

  let txToSign = '';
  let networkByte;

  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'network',
        message: 'Select network for signing tx',
        waitUserInput: true,
        choices: ['mainnet', 'testnet', 'custom'],
      },
      {
        type: 'string',
        name: 'txToSign',
        message: 'Enter tx to sign',
        waitUserInput: true,
      },
    ])
    .then((answers) => {
      txToSign = answers.txToSign;
      switch (answers.network) {
        case 'mainnet':
          networkByte = WavesNetworkMainnet.chaidID.charCodeAt(0);
          break;
        case 'testnet':
          networkByte = WavesNetworkTestnet.chaidID.charCodeAt(0);
          break;
        case 'custom':
          networkByte = WavesNetworkCustom.chaidID.charCodeAt(0);
          break;
      }
    })
    .catch((e) => {
      throw JSON.stringify(e);
    });

  let isWavesAppOpened = false;
  while (!isWavesAppOpened) {
    await inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'isWavesAppOpened',
          message: 'Have you opened WAVES app on ledger?',
          waitUserInput: true,
        },
      ])
      .then((answers) => {
        isWavesAppOpened = answers.isWavesAppOpened;
      })
      .catch((e) => {
        throw JSON.stringify(e);
      });
  }

  let userId = -1;
  let userIdConfirmed = false;
  while (!userIdConfirmed) {
    const ledger = new WavesLedger({
      debug: true,
      openTimeout: 5000,
      listenTimeout: 30000,
      exchangeTimeout: 30000,
      networkCode: networkByte,
      transport: TransportNodeHid,
    });

    await inquirer
      .prompt([
        {
          type: 'number',
          name: 'userId',
          message: 'Which user id need to use?',
          waitUserInput: true,
          validate: (input) => {
            return new Promise((resolve) => {
              const parsed = parseInt(input);
              resolve(
                parsed >= 0 && parsed <= 1000
                  ? true
                  : 'You can provide user id from 0 to 1000'
              );
            });
          },
          filter: (input) => {
            const parsed = parseInt(input);
            return isNaN(parsed) || parsed < 0 || parsed > 1000 ? '' : parsed;
          },
        },
      ])
      .then((answers) => {
        userId = answers.userId;
      })
      .catch((e) => {
        throw JSON.stringify(e);
      });

    const user = await ledger.getUserDataById(userId);
    console.log(user);

    await inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'userIdConfirmed',
          message: 'Confirm to use ' + userId + ' for signing',
          waitUserInput: true,
        },
      ])
      .then((answers) => {
        userIdConfirmed = answers.userIdConfirmed;
      })
      .catch((e) => {
        throw JSON.stringify(e);
      });
  }

  const ledger = new WavesLedger({
    debug: true,
    openTimeout: 5000,
    listenTimeout: 30000,
    exchangeTimeout: 30000,
    networkCode: networkByte,
    transport: TransportNodeHid,
  });

  const message = base58Decode(txToSign);
  const tx = protoSerialize.protoBytesToTx(message);

  console.log(tx);
  console.log('VERIFY AND SIGN TX ON YOUR DEVICE!');

  const signature = await ledger.signSomeData(userId, { dataBuffer: message });
  console.log('Your signature:', signature);

  exit(0);
})().catch((e) => {
  throw e;
});
