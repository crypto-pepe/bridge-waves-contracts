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

  const tokenContract = keyPair(seedWithNonce(deployerSeed, 8));
  const tokenContractAddress = address(
    { publicKey: tokenContract.publicKey },
    network.chainID
  );
  console.log('USDT-ERC20-PPT token contract address =', tokenContractAddress);

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
      executionAsset = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      break;
    case 'testnet':
      executionAsset = '0x3d4C6F189F81c9eA4AeE003C1fD49BE97614231A';
      break;
    default:
      executionAsset = '0x3d4C6F189F81c9eA4AeE003C1fD49BE97614231A';
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

  let erc20TokenBridgeContract = ''; // (ERC20TokenBridge.sol)
  switch (network.name) {
    case 'mainnet':
      erc20TokenBridgeContract = '0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83';
      break;
    case 'testnet':
      erc20TokenBridgeContract = '0x02ae24F2F5E3b781b5b901d46250dF630b2659b5';
      break;
    default:
      erc20TokenBridgeContract = '0x02ae24F2F5E3b781b5b901d46250dF630b2659b5';
  }

  await invoke(
    {
      dApp: tokenEVMAdapterContractAddress,
      call: {
        function: 'setERC20TokenBridgeContract',
        args: [
          {
            type: 'string',
            value: erc20TokenBridgeContract, // contract_
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
