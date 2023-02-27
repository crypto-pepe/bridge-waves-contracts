import {
  NetworkConfig,
  deployScript,
  ProofsGenerator,
  data,
  transfer,
} from '@pepe-team/waves-sc-test-utils';
import path = require('path');
import { address, seedWithNonce, keyPair } from '@waves/ts-lib-crypto';

export default async function (
  deployerSeed: string,
  appliedNonce: number,
  network: NetworkConfig,
  proofsGenerator: ProofsGenerator
) {
  const deployerPrivateKey = keyPair(deployerSeed).privateKey;
  const contract = keyPair(seedWithNonce(deployerSeed, 1));
  const contractAddress = address(
    { publicKey: contract.publicKey },
    network.chainID
  );

  await transfer(
    {
      amount: network.setScriptFee + network.invokeFee,
      recipient: contractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  );

  await deployScript(
    path.resolve(process.cwd(), './ride/migrations.ride'),
    contract.privateKey,
    network,
    proofsGenerator
  );

  await data(
    {
      data: [
        {
          key: 'LAST_COMPLETED_MIGRATION',
          type: 'integer',
          value: 1,
        },
        {
          key: 'OWNER',
          type: 'string',
          value: address(deployerSeed, network.chainID),
        },
      ],
    },
    contract.privateKey,
    network,
    proofsGenerator
  );

  return true;
}
