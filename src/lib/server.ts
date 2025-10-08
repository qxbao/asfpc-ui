export const BackendURL =
  (process.env.NEXT_PUBLIC_BACKEND_URL?.charAt(-1) === "/"
    ? process.env.NEXT_PUBLIC_BACKEND_URL?.slice(0, -1)
    : process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:8000";
