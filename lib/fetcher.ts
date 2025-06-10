/**
 * SWRで使用するための汎用的なfetcher関数。
 * @param url - 取得先のURL
 * @returns - JSON形式のレスポンスデータ
 * @throws - レスポンスがokでない場合にエラーをスローします。
 */
export const fetcher = async (url: string) => {
    const res = await fetch(url);
  
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      // エラーオブジェクトに情報を付加して、デバッグしやすくします。
      // @ts-expect-error Errorオブジェクトにカスタムプロパティを追加
      error.info = await res.json();
      // @ts-expect-error Errorオブジェクトにカスタムプロパティを追加
      error.status = res.status;
      throw error;
    }
  
    return res.json();
  };