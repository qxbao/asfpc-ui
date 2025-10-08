import { Box } from "@mui/material";
import Link from "next/link";

export default function CustomLink({
  href,
  children,
  props,
}: {
  href: string;
  children: React.ReactNode;
  props?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}) {
  return (
    <Box
      component={"span"}
      sx={{
        "&:hover": {
          textDecoration: "underline",
          cursor: "pointer",
        },
      }}
    >
      <Link href={href} {...props}>
        {children}
      </Link>
    </Box>
  );
}
