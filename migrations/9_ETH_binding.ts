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

  const tokenContract = keyPair(seedWithNonce(deployerSeed, 4));
  const tokenContractAddress = address(
    { publicKey: tokenContract.publicKey },
    network.chainID
  );
  console.log(
    'ETH-Ethereum-PPT token contract address =',
    tokenContractAddress
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

  const collectorFeeContract = keyPair(seedWithNonce(deployerSeed, 6));
  const collectorFeeContractAddress = address(
    { publicKey: collectorFeeContract.publicKey },
    network.chainID
  );
  console.log('Collector fee contract address =', collectorFeeContractAddress);

  const tokenEVMAdapterContract = keyPair(seedWithNonce(deployerSeed, 7));
  const tokenEVMAdapterContractAddress = address(
    { publicKey: tokenEVMAdapterContract.publicKey },
    network.chainID
  );
  console.log(
    'Token EVM Adapter contract address =',
    tokenEVMAdapterContractAddress
  );

  await transfer(
    {
      amount: 3 * network.invokeFee,
      recipient: wrappedTokenBridgeContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: wrappedTokenBridgeContractAddress,
      call: {
        function: 'updateFeeRecipient',
        args: [
          {
            type: 'string',
            value: collectorFeeContractAddress, // feeRecipient_
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
      dApp: wrappedTokenBridgeContractAddress,
      call: {
        function: 'updateExecutionChain',
        args: [
          {
            type: 'integer',
            value: execChainId, // executionChainId_
          },
          { type: 'boolean', value: true }, // enabled_
        ],
      },
    },
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
        function: 'updateBindingInfo',
        args: [
          {
            type: 'integer',
            value: execChainId, // executionChainId_
          },
          {
            type: 'string',
            value: tokenContractAddress, // assetContract_
          },
          {
            type: 'string',
            value: '0x0000000000000000000000000000000000000000', // executionAsset_
          },
          {
            type: 'integer',
            value: 100000, // minAmount_
          },
          {
            type: 'integer',
            value: 10000, // minFee_
          },
          {
            type: 'integer',
            value: 1000000, // thresholdFee_
          },
          {
            type: 'integer',
            value: 1000, // beforePercentFee_
          },
          {
            type: 'integer',
            value: 1500, // afterPercentFee_
          },
          { type: 'boolean', value: true }, // enabled_
        ],
      },
    },
    wrappedTokenBridgeContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await transfer(
    {
      amount: network.invokeFee,
      recipient: tokenEVMAdapterContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  let nativeTokenBridgeContract = '';
  switch (network.name) {
    case 'mainnet':
      nativeTokenBridgeContract = '';
      throw 'set nativeTokenBridgeContract'; // TODO
      break;
    case 'testnet':
      nativeTokenBridgeContract = '0x9bc2305890385aB6422a03d8ab958b7ccb3c815C';
      break;
    default:
      nativeTokenBridgeContract = '0x9bc2305890385aB6422a03d8ab958b7ccb3c815C';
  }

  await invoke(
    {
      dApp: tokenEVMAdapterContractAddress,
      call: {
        function: 'setNativeTokenBridgeContract',
        args: [
          {
            type: 'string',
            value: nativeTokenBridgeContract, // contract_
          },
        ],
      },
    },
    tokenEVMAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
