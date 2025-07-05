import { getChainIdFromRpcUrl } from './getExplorerTxUrl';

export async function fetchAbi(address: string, rpcUrl: string): Promise<unknown[]> {
  const key = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;
  const esc = (s: string) => encodeURIComponent(s);
  const chainId = getChainIdFromRpcUrl(rpcUrl);

  // 1️⃣ Query getsourcecode to detect proxy & find implementation
  const srcRes = await fetch(
    `https://api.etherscan.io/v2/api` +
      `?chainid=${chainId}` +
      `&action=getsourcecode` +
      `&module=contract` +
      `&address=${esc(address)}` +
      `&apikey=${esc(key!)}`,
  );
  const srcJson = await srcRes.json();
  const srcData = Array.isArray(srcJson.result) ? srcJson.result[0] : null;

  let target = address;
  if (srcData && srcData.Proxy === '1' && srcData.Implementation) {
    // If it's a proxy, switch to implementation address
    target = srcData.Implementation;
    console.log(`Proxy detected—using implementation at ${target}`);
  }

  // 2️⃣ Fetch the ABI (for proxy or implementation as needed)
  const abiRes = await fetch(
    `https://api.etherscan.io/v2/api` +
      `?chainid=${chainId}` +
      `&action=getabi` +
      `&module=contract` +
      `&address=${esc(target)}` +
      `&apikey=${esc(key!)}`,
  );
  const abiJson = await abiRes.json();
  if (abiJson.status !== '1') {
    throw new Error(`ABI not found for ${target}: ${abiJson.result}`);
  }
  return JSON.parse(abiJson.result) as unknown[];
}

export default fetchAbi;
