const { read } = require("fs");
const readline = require("readline");

function hitunghargaakhir(totalbelanja) {
  let diskon = 0;

  if (totalbelanja > 1000000) {
    diskon = 0.15;
  } else if (totalbelanja > 500000) {
    diskon = 0.1;
  } else {
    diskon = 0;
  }
  let hargaakhir = totalbelanja - totalbelanja * diskon;
  return hargaakhir;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Masukkan Total Belanja (Rp.): ", function (input) {
  const totalbelanja = parseFloat(input);
  const hasil = hitunghargaakhir(totalbelanja);

  console.log("Total Belanja : Rp. " + totalbelanja);
  console.log("Harga Akhir : Rp. " + hasil);

  rl.close();
});
