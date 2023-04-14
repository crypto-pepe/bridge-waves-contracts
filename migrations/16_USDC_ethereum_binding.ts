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

  const tokenContract = keyPair(seedWithNonce(deployerSeed, 9));
  const tokenContractAddress = address(
    { publicKey: tokenContract.publicKey },
    network.chainID
  );
  console.log('USDC-ERC20-PPT token contract address =', tokenContractAddress);

  const wrappedTokenBridgeContract = keyPair(seedWithNonce(deployerSeed, 5));
  const wrappedTokenBridgeContractAddress = address(
    { publicKey: wrappedTokenBridgeContract.publicKey },
    network.chainID
  );
  console.log(
    'Wrapped Token Bridge contract address =',
    wrappedTokenBridgeContractAddress
  );

  await transfer(
    {
      amount: network.invokeFee,
      recipient: wrappedTokenBridgeContractAddress,
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

  let executionAsset;
  switch (network.name) {
    case 'mainnet':
      executionAsset = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      break;
    case 'testnet':
      executionAsset = '';
      throw 'todo';
      break;
    default:
      executionAsset = '';
  }

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
            value: executionAsset, // executionAsset_
          },
          {
            type: 'integer',
            value: 5000000, // minAmount_
          },
          {
            type: 'integer',
            value: 300000, // minFee_
          },
          {
            type: 'integer',
            value: 20000000000, // thresholdFee_
          },
          {
            type: 'integer',
            value: 1000, // beforePercentFee_
          },
          {
            type: 'integer',
            value: 900, // afterPercentFee_
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

  return appliedNonce + 1;
}
