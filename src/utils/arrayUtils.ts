/**
 * 指定された範囲の数値配列をシャッフルして返す
 * @param start 開始数値
 * @param end 終了数値
 * @returns シャッフルされた数値配列
 */
export const generateShuffledArray = (start: number, end: number): number[] => {
  // 指定範囲の配列を生成
  const array = Array.from(
    { length: end - start + 1 }, 
    (_, index) => start + index
  );
  
  // Fisher-Yatesアルゴリズムでシャッフル
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array;
}; 