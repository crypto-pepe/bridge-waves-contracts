import path = require('path');
import {
  deployScript,
  ProofsGenerator,
  invoke,
  transfer,
  NetworkConfig,
} from '@pepe-team/waves-sc-test-utils';
import { address, seedWithNonce, keyPair } from '@waves/ts-lib-crypto';
import { InvokeScriptCallStringArgument } from '@waves/ts-types';

export default async function (
  deployerSeed: string,
  appliedNonce: number,
  network: NetworkConfig,
  proofsGenerator: ProofsGenerator
) {
  const deployerPrivateKey = keyPair(deployerSeed).privateKey;
  const contract = keyPair(seedWithNonce(deployerSeed, appliedNonce + 1));
  const contractAddress = address(
    { publicKey: contract.publicKey },
    network.chainID
  );
  console.log('Multisig contract address =', contractAddress);

  await transfer(
    {
      amount: network.setScriptFee + network.invokeFee,
      recipient: contractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  let publicKeys: InvokeScriptCallStringArgument[];
  switch (network.name) {
    case 'custom':
      publicKeys = [
        {
          type: 'string',
          value: keyPair(deployerSeed).publicKey,
        },
      ];
      break;
    default:
      publicKeys = [
        {
          type: 'string',
          value: 'yMQKms5WvLvobErygwGjByEuNuebLMGXHndfVDsjMVD',
        },
        {
          type: 'string',
          value: 'BN9meJdnaezqtUK7iGhWC9a6TvgU51ESc69wT8x7AnN8',
        },
        {
          type: 'string',
          value: 'ENV5mvh5GsDNHhqwYt1BzxfZew1M3rRRzXub5vaGxY3C',
        },
        {
          type: 'string',
          value: 'nobcGCfJ1ZG1J6g8T9dRLoUnBCgQ6DM5H8Hy78sAmSN',
        },
        {
          type: 'string',
          value: 'Hv2T217jAFbgjXiqrz2CKQkbFH9CJc9dFAgwcQmi3Q83',
        },
      ];
  }

  let defaultQuorum;
  switch (network.name) {
    case 'mainnet':
      defaultQuorum = 3;
      break;
    case 'testnet':
      defaultQuorum = 2;
      break;
    default:
      defaultQuorum = 1;
  }

  await deployScript(
    path.resolve(process.cwd(), './ride/multisig.ride'),
    contract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: contractAddress,
      call: {
        function: 'init',
        args: [
          {
            type: 'list',
            value: publicKeys,
          },
          {
            type: 'integer',
            value: defaultQuorum,
          },
        ],
      },
      fee: 500000,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
