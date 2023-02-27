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

  // Deploy tokenContract
  await transfer(
    {
      amount: network.setScriptFee + 2 * network.invokeFee + 100000000,
      recipient: tokenContractAddress,
    },
    deployerPrivateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await deployScript(
    path.resolve(process.cwd(), './ride/mintable_token.ride'),
    tokenContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  await invoke(
    {
      dApp: tokenContractAddress,
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
    tokenContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  const tokenName = 'ETH-Ethereum-PPT';
  const tokenDescr =
    'ETH Token from Ethereum network powered by PepeTeam Crosschain Bridge. See details at https://bridge.pepe.team/tokens/ETH-Ethereum-PPT';

  await invoke(
    {
      dApp: tokenContractAddress,
      call: {
        function: 'init',
        args: [
          {
            type: 'string',
            value: tokenName, // tokenName_
          },
          {
            type: 'string',
            value: tokenDescr, // tokenDescr_
          },
          {
            type: 'integer',
            value: 8, // tokenDecimals_
          },
        ],
      },
      fee: 100000000 + network.invokeFee,
    },
    tokenContract.privateKey,
    network,
    proofsGenerator
  ).catch((e) => {
    throw e;
  });

  return appliedNonce + 1;
}
