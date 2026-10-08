import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "react-router";

type LinkBehaviorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href?: string;
};

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** Lets MUI `Link`/`Button` `href` props navigate client-side for internal paths. */
const LinkBehavior = forwardRef<HTMLAnchorElement, LinkBehaviorProps>(function LinkBehavior(
  { href = "/", ...props },
  ref,
) {
  if (isExternal(href)) {
    return <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  }
  return <RouterLink ref={ref} to={href} {...props} />;
});

export default LinkBehavior;
