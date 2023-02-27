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

  const brigdeAdapterContract = keyPair(seedWithNonce(deployerSeed, 3));
  const brigdeAdapterContractAddress = address(
    { publicKey: brigdeAdapterContract.publicKey },
    network.chainID
  );
  console.log(
    'Brigde Adapter contract address =',
    brigdeAdapterContractAddress
  );

  // Deploy brigdeAdapterContract
  await transfer(
    {
      amount: network.setScriptFee + 2 * network.invokeFee,
      recipient: brigdeAdapterContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await deployScript(
    path.resolve(process.cwd(), './ride/bridge_adapter.ride'),
    brigdeAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: brigdeAdapterContractAddress,
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
    brigdeAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: brigdeAdapterContractAddress,
      call: {
        function: 'init',
        args: [{ type: 'string', value: multisigAddress }],
      },
    },
    brigdeAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
