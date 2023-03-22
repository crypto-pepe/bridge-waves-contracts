import * as csvWriter from 'csv-writer';

(async () => {
  const ethWavesWriter = csvWriter.createObjectCsvWriter({
    path: './scripts/eth2waves.csv',
    header: ['nonce', 'recipient', 'amount', 'gasless'],
  });
  let ethWavesRecords = [];

  const wavesEthWriter = csvWriter.createObjectCsvWriter({
    path: './scripts/waves2eth.csv',
    header: ['nonce', 'recipient', 'amount', 'gasless'],
  });
  let wavesEthRecords = [];

  let ethWavesUrl =
    'https://api-testnet.wavesplatform.com/v0/transactions/invoke-script?dapp=3N935A8AAp2u1isbYYqX3Kp9prZmHF6kNps&function=execute&sort=asc&limit=100';
  let wavesEthUrl =
    'https://api-testnet.wavesplatform.com/v0/transactions/invoke-script?dapp=3Mx4GxjrawhKHBgMKH9C5Hmbj8ePZDrs8ed&function=burnTokens&sort=asc&limit=100';
  let ethWavesCursor = '';
  let wavesEthCursor = '';
  let count = 0;

  console.log('start');

  for (;;) {
    const res = await fetch(ethWavesUrl + ethWavesCursor);
    const data = await res.json();

    console.log(ethWavesUrl + ethWavesCursor);

    const lastCursor = data.lastCursor;
    const data1 = data.data;
    data1.forEach((elem) => {
      count += parseInt(elem.data.call.args[2].value[2].value);
      ethWavesRecords.push({
        nonce: elem.data.call.args[5].value,
        recipient: elem.data.call.args[2].value[3].value,
        amount: elem.data.call.args[2].value[2].value,
      });
    });

    if (!data.isLastPage) {
      ethWavesCursor = '&after=' + lastCursor;
    } else {
      ethWavesRecords = ethWavesRecords.sort((a, b) => a.nonce - b.nonce);
      await ethWavesWriter.writeRecords(ethWavesRecords);
      break;
    }
  }

  for (;;) {
    const res = await fetch(wavesEthUrl + wavesEthCursor);
    const data = await res.json();

    const lastCursor = data.lastCursor;
    const data1 = data.data;
    data1.forEach((elem) => {
      count += parseInt(elem.data.payment[0].amount);
      wavesEthRecords.push({
        recipient: elem.data.call.args[1].value,
        amount: elem.data.payment[0].amount,
      });
    });

    if (!data.isLastPage) {
      wavesEthCursor = '&after=' + lastCursor;
    } else {
      wavesEthRecords = wavesEthRecords.sort((a, b) => a.nonce - b.nonce);
      await wavesEthWriter.writeRecords(wavesEthRecords);
      break;
    }
  }
})();
