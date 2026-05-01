// Type declarations for static image/asset imports
// Required for `tsc --noEmit` to resolve .png / .svg / .jpg / .webp imports

declare module '*.png' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.svg' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpg' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.webp' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.gif' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}
