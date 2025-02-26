import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { globalServerConfig } from '@feynote/config';

export const proxyGetRequest = async (url: string, config?: Partial<AxiosRequestConfig>) => {
    const requestConfig = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0',
      },
      ...config,
    };
    if (globalServerConfig.proxy.enabled) {
      const proxyUrl = new URL(globalServerConfig.proxy.url);
      proxyUrl.username = globalServerConfig.proxy.username;
      proxyUrl.password = globalServerConfig.proxy.password;
      requestConfig['httpsAgent'] = new HttpsProxyAgent(proxyUrl);
    }
    const res = await axios.get(url, requestConfig);
    return res
}
