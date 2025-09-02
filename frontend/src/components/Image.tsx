import { Image as IkImage } from "@imagekit/react";

const Image = ({
  src,
  className,
  w,
  h,
  alt,
}: {
  src: string;
  className?: string;
  alt?: string;
  w?: number;
  h?: number;
}) => {
  return (
    <IkImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      src={src}
      className={className}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      alt={alt}
      width={w}
      height={h}
      transformation={[
        {
          width: w,
          height: h,
        },
      ]}
    />
  );
};

export default Image;
