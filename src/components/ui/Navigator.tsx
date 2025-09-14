import { Home } from "@mui/icons-material"
import { Box } from "@mui/material"
import Link from "next/link"
import CustomLink from "./Link"

export default function Navigator({
  text
} : {
  text: string
}) {
  return (
    <Box display={'flex'} gap={1} fontSize={13} color={'text.secondary'}>
      <CustomLink href="/">
        <Home sx={{ fontSize: 18 }} />
      </CustomLink>
      <Box>{"/"}</Box>
      {text}
    </Box>
  )
}