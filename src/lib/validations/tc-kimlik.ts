/**
 * Türkiye TC Kimlik Numarası doğrulama algoritması
 * 1) Tam 11 rakam olmalı
 * 2) İlk hane 0 olamaz
 * 3) (oddSum * 7 - evenSum) % 10 = 10. hane
 * 4) İlk 10 hanenin toplamı % 10 = 11. hane
 */
export function validateTCKimlik(tc: string): boolean {
  if (!/^\d{11}$/.test(tc)) return false;
  if (tc[0] === "0") return false;

  const d = tc.split("").map(Number);

  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  if (((oddSum * 7) - evenSum) % 10 !== d[9]) return false;

  const totalSum = d[0] + d[1] + d[2] + d[3] + d[4] + d[5] + d[6] + d[7] + d[8] + d[9];
  if (totalSum % 10 !== d[10]) return false;

  return true;
}
