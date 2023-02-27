const yargs = require('yargs');
import { broadcast, data } from '@waves/waves-transactions';
import {
  address,
  seedWithNonce,
  keyPair,
  MAIN_NET_CHAIN_ID,
  TEST_NET_CHAIN_ID,
} from '@waves/ts-lib-crypto';

(async () => {
  const options = yargs
    .usage(
      'Usage: --network <mainnet|testnet|custom> --nodeAPI <string> --seed <string>'
    )
    .option('network', {
      alias: 'Network',
      describe: 'Network used for addresses gen',
      type: 'string',
      choices: ['mainnet', 'testnet', 'custom'],
      default: 'mainnet',
      demandOption: true,
    })
    .option('nodeAPI', {
      alias: 'NodeAPI',
      describe: 'NodeAPI URL',
      type: 'string',
      demandOption: true,
    })
    .option('seed', {
      alias: 'Seed',
      describe: 'Seed string',
      type: 'string',
      demandOption: true,
    }).argv;

  const nodeAPI = options.nodeAPI;
  const seed = options.seed;
  let networkByte: any;
  switch (options.network) {
    case 'mainnet':
      networkByte = MAIN_NET_CHAIN_ID;
      break;
    case 'testnet':
      networkByte = TEST_NET_CHAIN_ID;
      break;
    case 'custom':
      networkByte = 'R';
      break;
    default:
      throw new Error('Select network: mainnet or testnet');
  }

  const tx = await data(
    {
      data: [
        {
          key: '3PDF7cDGdmt6tTKNAmGX1F7N2qqwaH2EwLp',
          type: 'string',
          value: '1-613668',
        },
        {
          key: '3PK32FgDf5FJEbxUyjSANMTvmkUoxPuXiqx',
          type: 'string',
          value: '613669-1133075',
        },
        {
          key: '3PH8GVPJSetZpH8qq6BdWuJn5TM4L6etiSt',
          type: 'string',
          value: '1133076-1510860',
        },
        {
          key: '3PDUrMXdU8THLGcGvVK3AJBA59HqfRGykYf',
          type: 'string',
          value: '1510861-1828089',
        },
        {
          key: '3PGq6codToK47655xQhaf13DhJJj5YdaWLs',
          type: 'string',
          value: '1828090-2012446',
        },
        {
          key: '3PCP6bMi2CndkdXKnkqqQdJaKeaYYLT7BSu',
          type: 'string',
          value: '2012447-2145617',
        },
        {
          key: '3PHoKBN3zfxujbHDNvCNFM3KXTM7GQHSFn2',
          type: 'string',
          value: '2145618-2277748',
        },
        {
          key: '3PQmZxpq8a6VQ4dBfJMVM3EkmiJCaWdcPHZ',
          type: 'string',
          value: '2277749-2371254',
        },
        {
          key: '3PCvvL1QMAPD5JyhPWfiq1NngNArCu3HfzC',
          type: 'string',
          value: '2371255-2457251',
        },
        {
          key: '3PQvBRzxtzFf5BrTUQz6JxG7c7BdQXPYm3g',
          type: 'string',
          value: '2457252-2530683',
        },
        {
          key: '3PES7MMthaKJx9WMXnNCY3cwTGG9nD9YT8f',
          type: 'string',
          value: '2530684-2567881',
        },
        {
          key: '3PDKRZwrS578vwGe5DgZKFuuhBT143wmYkq',
          type: 'string',
          value: '2567882-2604022',
        },
        {
          key: '3PPCzX2doZ7agBNuGSKqjrbdXgGEtE7CpQ3',
          type: 'string',
          value: '2604023-2640009',
        },
        {
          key: '3PBbj3cENG1EUxYmQ8z9TDJKJDGYdVWqeEM',
          type: 'string',
          value: '2640010-2665735',
        },
        {
          key: '3PGUsCwXhb4eksgZ8ShH2iSMaVuDs5oEHEo',
          type: 'string',
          value: '2665736-2689962',
        },
        {
          key: '3P76XWnhVE5H4zQ3CZnPuQ9pxeouWE8FWX2',
          type: 'string',
          value: '2689963-2712565',
        },
        {
          key: '3P4Y2Bt1x8NYS86MbJRtLfAd5WT11QaVSq8',
          type: 'string',
          value: '2712566-2734832',
        },
        {
          key: '3PNpz1AQ8qkNYTikA5Y8VnymiEWqvZE5LnJ',
          type: 'string',
          value: '2734833-2753392',
        },
        {
          key: '3PREzFgfU3va1xEZNnGcmRDFt92hZ4zjZLC',
          type: 'string',
          value: '2753393-2771912',
        },
        {
          key: '3PLipj24rFa8g1ESv3YHPWDRg2eSphTxWu3',
          type: 'string',
          value: '2771913-2790340',
        },
        {
          key: '3P6hueiHj4USfsmdAGbH6NL4mi7dJpDygM1',
          type: 'string',
          value: '2790341-2808212',
        },
        {
          key: '3PP2koK8jHT7Y5zKq1kZNFWsK5pBdLiTfyW',
          type: 'string',
          value: '2808213-2825549',
        },
        {
          key: '3PH5izrmREyaKygN7qjMPNUBEGzmY3VfMRr',
          type: 'string',
          value: '2825550-2840047',
        },
        {
          key: '3PMcMiMEs6w56NRGacksXtFG5zS7doE9fpL',
          type: 'string',
          value: '2840048-2854320',
        },
        {
          key: '3PARiM6ggFA4gPLJnzxUfC7zCRfF2QZpKnX',
          type: 'string',
          value: '2854321-2868334',
        },
        {
          key: '3PMwqgdbcjwHjBxGaciq3bRc9E4sCfKpvcc',
          type: 'string',
          value: '2868335-2880694',
        },
        {
          key: '3PH9BcXyHsiAuFgDPSaLXgXPqmethVkN4Qm',
          type: 'string',
          value: '2880695-2892651',
        },
        {
          key: '3P9E2yJTYCg2GZABsDopCby7izgvm2A1za3',
          type: 'string',
          value: '2892652-2904404',
        },
        {
          key: '3PCaqDZMvyKiGfUdaPKubhPucqo1bZnYsK3',
          type: 'string',
          value: '2904405-2915961',
        },
        {
          key: '3PPMqt7z3o143KXaDW2JGzeeYwg2yCRfGF9',
          type: 'string',
          value: '2915962-2927290',
        },
        {
          key: '3PQEVtX7SukU7zVfpgkKDmnrX7NFw1pHBVd',
          type: 'string',
          value: '2927291-2937606',
        },
        {
          key: '3PC8x5Q8utzPe2eQYsse5f1rE6Hebv2Ye4g',
          type: 'string',
          value: '2937607-2947492',
        },
        {
          key: '3PR9nDkVgTHbEgWsmkZC7jpLy7ZR9p66UaS',
          type: 'string',
          value: '2947493-2955094',
        },
        {
          key: '3PPyKKCD5V6ArRHSQKeLBLoDx2qj7vZgpEb',
          type: 'string',
          value: '2955095-2962666',
        },
        {
          key: '3PDRckK2s4opaejaMZ3sr7eDgSdXsb3CrTX',
          type: 'string',
          value: '2962667-2970077',
        },
        {
          key: '3P6hLaCZegkZY1NdK3aXZ3cPs8AxZxuXYH3',
          type: 'string',
          value: '2970078-2976417',
        },
        {
          key: '3PHBzfeszs4xTaUmm4vctp4TQWgWiDWUtED',
          type: 'string',
          value: '2976418-2982714',
        },
        {
          key: '3P92x17Ly1tBKc4F9RJ4zYFhz6rZPPvnoCK',
          type: 'string',
          value: '2982715-2988763',
        },
        {
          key: '3PLnbvbFKcmTLekZeKTfwWWS6neFYUvUvSd',
          type: 'string',
          value: '2988764-2994549',
        },
        {
          key: '3P5fDzDn5QnFFYJqwzkijVv2naN3PL9uHGv',
          type: 'string',
          value: '2994550-2999991',
        },
        {
          key: '3PD3rwyYssAZE3R5euDZrg9MdCPvnbWkFsJ',
          type: 'string',
          value: '2999992-3005278',
        },
        {
          key: '3PPEaQdfLLBCuKDKhTQ3EowGi1JKjDco3jN',
          type: 'string',
          value: '3005279-3008750',
        },
        {
          key: '3PPTLM5M82Z19a7da2PumXnUfPToEBocoRC',
          type: 'string',
          value: '3008751-3011655',
        },
        {
          key: '3P58vMvwJY1GUbdRwMK16KRGY4dcpjb24SR',
          type: 'string',
          value: '3011656-3013480',
        },
        {
          key: '3PK2p9Kz82a9JsvLtEZb5rZEgxpqBvGbz3V',
          type: 'string',
          value: '3013481-3015234',
        },
        {
          key: '3P6mMQQiPbk6imZQNq1Tf2NgTZeK2AF5dX1',
          type: 'string',
          value: '3015235-3016949',
        },
        {
          key: '3PBpuHBzPEyBokffjFi9aDZWrg6gSosv1i7',
          type: 'string',
          value: '3016950-3018109',
        },
        {
          key: '3PJLvaY9ruYWJta49HpZvnp6Xr4pEB4424D',
          type: 'string',
          value: '3018110-3019249',
        },
        {
          key: '3PGScWiDwXgJ5JF1CGBcGGGoiLAKYeWQTZv',
          type: 'string',
          value: '3019250-3020214',
        },
        {
          key: '3PEhNs8DNyuHFqQP92rR6agtWhVApuLwqUa',
          type: 'string',
          value: '3020215-3020854',
        },
        {
          key: '3PJpoHFZ3RPrQnVaV6MFJmXu5pMMLkJ39sz',
          type: 'string',
          value: '3020855-3021438',
        },
        {
          key: '3P6Qdw4cuT9dvTHaHLRJ2iordKyMKJZqUg9',
          type: 'string',
          value: '3021439-3021899',
        },
        {
          key: '3P54ZaN6zfVhzTD8yYkrZWqbPXtMRnzHb3Y',
          type: 'string',
          value: '3021900-3022343',
        },
        {
          key: '3PHuDH7pLrrokWHvFdfYrskgTwcrWoA5HGZ',
          type: 'string',
          value: '3022344-3022744',
        },
        {
          key: '3P2yMs9ptxuL37EnMF9BMjZCXdxt2yCXZX3',
          type: 'string',
          value: '3022745-3023106',
        },
        {
          key: '3PQ2VSkTUWHVQiDMZKJi9nXvHBfSQhrtNWv',
          type: 'string',
          value: '3023107-3023407',
        },
        {
          key: '3PMETgDXwVcEuxVXBcME1rtzeowc1fBXzhi',
          type: 'string',
          value: '3023408-3023701',
        },
        {
          key: '3PGsvXdTVYb1vBc257PALStgBgNdsCwR7qL',
          type: 'string',
          value: '3023702-3023993',
        },
        {
          key: '3P2FMHavshKyciyu8cHvkVjkwppqXmz7nWm',
          type: 'string',
          value: '3023994-3024272',
        },
        {
          key: '3PEdTLhqjcPAhmiLodTKqCLMciTQm891cB6',
          type: 'string',
          value: '3024273-3024481',
        },
        {
          key: '3PG4pYZmjmJDe42yqtJv2K5V6xS52m7aDiz',
          type: 'string',
          value: '3024482-3024658',
        },
        {
          key: '3P6dJ1M71iyFTwdEyjq3XaGugsvvWg66eFS',
          type: 'string',
          value: '3024659-3024831',
        },
        {
          key: '3PMx1kCAJyhppvz1QxcLEZoto5nU14gT5WP',
          type: 'string',
          value: '3024832-3024978',
        },
        {
          key: '3PFH6Mw6RKAWqda7PFUYGEUE91jXmsT33u9',
          type: 'string',
          value: '3024979-3025125',
        },
        {
          key: '3P9s2cJBcfqondA8jq4whoojer3BNFBvTQv',
          type: 'string',
          value: '3025126-3025248',
        },
        {
          key: '3PNMoSkRdkNKwmBxgZTTuPFJcU4AuEy27tx',
          type: 'string',
          value: '3025249-3025370',
        },
        {
          key: '3PKMzcKvfon1EmCn27LFoZmhGMS2pGmHTAH',
          type: 'string',
          value: '3025371-3025484',
        },
        {
          key: '3P9r1bkaKsgX7SPsb76nDGoEcSPieMHxBNi',
          type: 'string',
          value: '3025485-3025572',
        },
        {
          key: '3P6K4m1nrUbbHccpVgdjCvLNrvgZvSSXiAJ',
          type: 'string',
          value: '3025573-3025645',
        },
        {
          key: '3P9j9iqLVxdTQSzfjbRQmAz1nFpx7h8UNDN',
          type: 'string',
          value: '3025646-3025686',
        },
        {
          key: '3P5k5s1WkPnPCdmjf7JkKpPpc6GwF9dsFXo',
          type: 'string',
          value: '3025687-3025721',
        },
        {
          key: '3PCEtxT5VBJtmGwu5kBZjvMS2W6qLbHs3de',
          type: 'string',
          value: '3025722-3025753',
        },
        {
          key: '3P4Juy7b5gL2q3CaHFurmDpTS7M2vbJ4J7c',
          type: 'string',
          value: '3025754-3025782',
        },
        {
          key: '3PHiWaQatE59oZAz2TWYwtQX4ZQYL1khSgt',
          type: 'string',
          value: '3025783-3025811',
        },
        {
          key: '3PDp63SKjEEcnV5skfjM41XH2GX6vfkbESS',
          type: 'string',
          value: '3025812-3025834',
        },
        {
          key: '3P4Q1SgHPwRppM1gXezHNwuLfCSV1hXWGCD',
          type: 'string',
          value: '3025835-3025857',
        },
        {
          key: '3PN2aK5eXiR9Fe9KQMwkZPz9WSU2QHTxgWU',
          type: 'string',
          value: '3025858-3025865',
        },
        {
          key: '3PNnWhqsumTgav2c4vWzwbYMds6YHBxiy2u',
          type: 'string',
          value: '3025866-3025871',
        },
        {
          key: '3PEYT3X1ah2qCjsk4yyPj1gEKxRARWYKNtD',
          type: 'string',
          value: '3025872-3025876',
        },
        {
          key: '3P5svutcwqdyivdjwfbapuehkxfnqsaquyf',
          type: 'string',
          value: '3025877-3025879',
        },
      ],
      chainId: networkByte,
    },
    seed
  );

  await broadcast(tx, nodeAPI).catch((e) => {
    console.log(e);
  });
})();
