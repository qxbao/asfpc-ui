import { Home } from "@mui/icons-material";
import { Box } from "@mui/material";
import CustomLink from "./Link";
import React from "react";

export default function Navigator({ link }: { link: string[] }) {
	return (
		<Box display={"flex"} gap={0.8} fontSize={13} color={"text.secondary"}>
			<CustomLink href="/">
				<Home sx={{ fontSize: 18 }} />
			</CustomLink>
			{link.map((item, index) => (
				<React.Fragment key={index}>
					<Box>{"/"}</Box>
					<Box>{item}</Box>
				</React.Fragment>
			))}
		</Box>
	);
}
