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

  const wrappedTokenBridgeContract = keyPair(seedWithNonce(deployerSeed, 5));
  const wrappedTokenBridgeContractAddress = address(
    { publicKey: wrappedTokenBridgeContract.publicKey },
    network.chainID
  );
  console.log(
    'Wrapped Token Bridge contract address =',
    wrappedTokenBridgeContractAddress
  );

  // Deploy wrappedTokenBridgeContract
  await transfer(
    {
      amount: network.setScriptFee + 2 * network.invokeFee,
      recipient: wrappedTokenBridgeContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await deployScript(
    path.resolve(process.cwd(), './ride/wrapped_token_bridge.ride'),
    wrappedTokenBridgeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: wrappedTokenBridgeContractAddress,
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
    wrappedTokenBridgeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  let executorAddress = '';
  switch (network.name) {
    case 'mainnet':
      executorAddress = ''; // TODO: add
      throw 'executorAddress not set'; // TODO: remove
      break;
    case 'testnet':
      executorAddress = '3MuB15FfT7QUriD1R24GFbMPHz82NQ1Bm8X';
      break;
    case 'custom':
      executorAddress = deployerAddress;
      break;
  }

  await invoke(
    {
      dApp: wrappedTokenBridgeContractAddress,
      call: {
        function: 'init',
        args: [
          {
            type: 'string',
            value: executorAddress, // executor_
          },
          {
            type: 'string',
            value: brigdeAdapterContractAddress, // adapter_
          },
          {
            type: 'string',
            value: multisigAddress, // pauser_
          },
          {
            type: 'string',
            value: multisigAddress, // feeRecipient_
          },
        ],
      },
    },
    wrappedTokenBridgeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
