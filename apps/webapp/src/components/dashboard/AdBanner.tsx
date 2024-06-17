import React from "react";


type AdBannerTypes = {

  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;

};

const AdBanner = ({ dataAdSlot, dataAdFormat, dataFullWidthResponsive }: AdBannerTypes) => {

  React.useEffect(() => {
    try {
      console.log("Banner ad");
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      console.log((window as any)?.adsbygoogle, ":::ADs by google window object");
    }
    catch (err: any) {
      console.log(err, ":::Error in ads banner");
    }
  }, [])

  return (
    <ins
      className="adsbygoogle min-h-[60px] bg-white"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6929781309402895"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    >
      {/* Google ads use ths ins tag */}
    </ins>
  )
}


export default AdBanner;
