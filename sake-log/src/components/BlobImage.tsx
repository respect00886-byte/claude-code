import { useEffect, useRef } from "react";

interface Props {
  blob: Blob | undefined;
  alt: string;
  className?: string;
}

/** IndexedDB に保存した写真（Blob）を表示する。画面から消えたら一時URLを片付ける */
export function BlobImage({ blob, alt, className }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !blob) return;
    const url = URL.createObjectURL(blob);
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  if (!blob) return null;
  return <img ref={ref} alt={alt} className={className} />;
}
