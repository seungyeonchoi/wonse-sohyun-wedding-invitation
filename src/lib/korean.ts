/** Picks the particle that follows `word` ("이"/"가", "을"/"를", …) from its last syllable's final consonant. */
export function josa(word: string, withBatchim: string, without: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return hasBatchim ? withBatchim : without;
}
