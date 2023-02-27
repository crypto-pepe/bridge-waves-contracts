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

  const tokenEVMAdapterContract = keyPair(seedWithNonce(deployerSeed, 7));
  const tokenEVMAdapterContractAddress = address(
    { publicKey: tokenEVMAdapterContract.publicKey },
    network.chainID
  );
  console.log(
    'Token EVM Adapter contract address =',
    tokenEVMAdapterContractAddress
  );

  // Invoke setAdapter and allow on brigdeAdapterContract
  await transfer(
    {
      amount: 2 * network.invokeFee,
      recipient: brigdeAdapterContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  let execChainId;
  switch (network.name) {
    case 'mainnet':
      execChainId = 2;
      break;
    case 'testnet':
      execChainId = 10002;
      break;
    default:
      execChainId = 10002;
  }

  await invoke(
    {
      dApp: brigdeAdapterContractAddress,
      call: {
        function: 'setAdapter',
        args: [
          {
            type: 'integer',
            value: execChainId, // executionChainId_
          },
          {
            type: 'string',
            value: tokenEVMAdapterContractAddress, // adapter_
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
        function: 'allow',
        args: [
          {
            type: 'string',
            value: wrappedTokenBridgeContractAddress, // caller_
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

  return appliedNonce + 1;
}
