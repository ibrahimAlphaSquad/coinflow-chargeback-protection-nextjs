'use client';

import Script from 'next/script';

/**
 * nSure SDK script — required for chargeback protection.
 * Loads the SDK and initializes with appId + partnerId.
 * Use COINFTEST for sandbox; Coinflow will assign your partnerId for production.
 */
export default function NSureScript() {

  return null;
  // const isSandbox = process.env.NEXT_PUBLIC_SANDBOX === 'true';
  // const partnerId = process.env.NEXT_PUBLIC_NSURE_PARTNER_ID || (isSandbox ? 'COINFTEST' : '');

  // if (!partnerId) {
  //   return null;
  // }

  // return (
  //   <>
  //     <Script
  //       id="nsure-async-init"
  //       strategy="beforeInteractive"
  //       dangerouslySetInnerHTML={{
  //         __html: `window.nSureAsyncInit=function(){window.nSureSDK.init({appId:'9JBW2RHC7JNJN8ZQ',partnerId:'${partnerId}'});};`,
  //       }}
  //     />
  //     <Script
  //       src="https://sdk.nsureapi.com/sdk.js"
  //       strategy="beforeInteractive"
  //     />
  //   </>
  // );
}
