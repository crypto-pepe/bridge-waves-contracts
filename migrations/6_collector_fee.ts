import path = require('path');
import {
  NetworkConfig,
  deployScript,
  ProofsGenerator,
  invoke,
  transfer,
} from '@pepe-team/waves-sc-test-utils';
import { address, seedWithNonce, keyPair } from '@waves/ts-lib-crypto';

export default async function (
  deployerSeed: string,
  appliedNonce: number,
  network: NetworkConfig,
  proofsGenerator: ProofsGenerator
) {
  const deployerPrivateKey = keyPair(deployerSeed).privateKey;
  const deployerAddress = address(deployerSeed, network.chainID);

  const multisigAddress = address(
    { publicKey: keyPair(seedWithNonce(deployerSeed, 2)).publicKey },
    network.chainID
  );
  console.log('Multisig contract address =', multisigAddress);

  const collectorFeeContract = keyPair(seedWithNonce(deployerSeed, 6));
  const collectorFeeContractAddress = address(
    { publicKey: collectorFeeContract.publicKey },
    network.chainID
  );
  console.log('Collector fee contract address =', collectorFeeContractAddress);

  // Deploy collectorFeeContract
  await transfer(
    {
      amount: network.setScriptFee + network.invokeFee,
      recipient: collectorFeeContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await deployScript(
    path.resolve(process.cwd(), './ride/collector_fee.ride'),
    collectorFeeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: collectorFeeContractAddress,
      call: {
        function: 'setMultisig',
        args: [
          {
            type: 'string',
            value: multisigAddress,
          },
        ],
      },
    },
    collectorFeeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
