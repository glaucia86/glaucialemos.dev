import 'server-only';

/** Recipient delivery is configured exclusively by the owner's access key. */
export async function postWeb3Forms(accessKey: string | undefined, fields: Record<string, string | boolean>): Promise<boolean> {
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ ...fields, access_key: accessKey, from_name: 'glaucialemos.dev' }),
    });
    return response.ok && (await response.json())?.success === true;
  } catch {
    return false;
  }
}
