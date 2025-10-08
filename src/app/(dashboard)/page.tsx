import React from "react";
import { Button } from "@mui/material";

export default function Dashboard() {
  return (
    <div>
      <Button
        variant="contained"
        size="large"
        color="primary"
        sx={{ textTransform: "none" }}
      >
        Click me
      </Button>
    </div>
  );
}
