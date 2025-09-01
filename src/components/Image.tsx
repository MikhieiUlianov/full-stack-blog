import { Image as IkImage } from "@imagekit/react";

const Image = ({
  src,
  className,
  alt,
  w,
  h,
}: {
  src: string;
  className?: string;
  alt: string;
  w: number;
  h: number;
}) => {
  return (
    <IkImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      src={src}
      alt={alt}
      className={className}
      lqip={{ active: true, quality: 20 }}
      loading="lazy"
      width={w}
      height={h}
    />
  );
};

export default Image;
