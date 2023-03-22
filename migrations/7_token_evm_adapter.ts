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

  const tokenEVMAdapterContract = keyPair(seedWithNonce(deployerSeed, 7));
  const tokenEVMAdapterContractAddress = address(
    { publicKey: tokenEVMAdapterContract.publicKey },
    network.chainID
  );
  console.log(
    'Token EVM Adapter contract address =',
    tokenEVMAdapterContractAddress
  );

  // Deploy tokenEVMAdapterContract
  await transfer(
    {
      amount: network.setScriptFee + 2 * network.invokeFee,
      recipient: tokenEVMAdapterContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await deployScript(
    path.resolve(process.cwd(), './ride/token_evm_adapter.ride'),
    tokenEVMAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: tokenEVMAdapterContractAddress,
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
    tokenEVMAdapterContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  let protocolCaller = ''; // (evm_caller.ride)
  switch (network.name) {
    case 'mainnet':
      protocolCaller = '3PEiRVaHno6zYY4rnA8E9pRMPyRBd7WWi5e';
      break;
    case 'testnet':
      protocolCaller = '3MxTLPY7MJxVDfpJcNy9Liq2r8pyZxNbjjU';
      break;
    case 'custom':
      protocolCaller = deployerAddress;
      break;
  }

  await invoke(
    {
      dApp: tokenEVMAdapterContractAddress,
      call: {
        function: 'init',
        args: [
          {
            type: 'string',
            value: protocolCaller, // protocolCaller_
          },
          {
            type: 'string',
            value: brigdeAdapterContractAddress, // rootAdapter_
          },
          {
            type: 'string',
            value: multisigAddress, // pauser_
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
