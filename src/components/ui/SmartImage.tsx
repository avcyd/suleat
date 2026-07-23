"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState, type SyntheticEvent } from "react";
import { FALLBACK_IMAGE, isRemoteImageSrc } from "@/lib/images";

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  /** Shown when the source fails to load. */
  fallbackSrc?: string;
};

/**
 * Renders local Next/Image assets and remote http(s) URLs.
 * Remote hosts use a plain <img> so any URL works without host allowlisting.
 */
export function SmartImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  className,
  onError,
  fill,
  width,
  height,
  sizes,
  style,
  unoptimized,
  ...rest
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setFailed(false);
  }, [src, fallbackSrc]);

  const resolved = failed || !currentSrc ? fallbackSrc : currentSrc;
  const remote = isRemoteImageSrc(resolved);

  function handleError(event: SyntheticEvent<HTMLImageElement, Event>) {
    onError?.(event as never);
    if (!failed && resolved !== fallbackSrc) {
      setFailed(true);
      setCurrentSrc(fallbackSrc);
    }
  }

  if (remote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary merchant image URLs
      <img
        src={resolved}
        alt={alt}
        className={
          fill
            ? `absolute inset-0 size-full ${className ?? ""}`
            : className
        }
        style={style}
        sizes={sizes}
        width={fill ? undefined : (typeof width === "number" ? width : undefined)}
        height={
          fill ? undefined : (typeof height === "number" ? height : undefined)
        }
        onError={handleError}
      />
    );
  }

  return (
    <Image
      {...rest}
      src={resolved}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      style={style}
      className={className}
      unoptimized={unoptimized}
      onError={handleError}
    />
  );
}
