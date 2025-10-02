import { Box, Button, Card, CardContent, Chip, IconButton, Typography } from "@mui/material";
import { Cancel, Refresh } from "@mui/icons-material";

interface ErrorCardProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
  icon?: React.ReactNode;
}

export default function ErrorCard({
  title = "Connection Error",
  message = "Unable to fetch data from the server. Please check your connection and try again.",
  errorCode,
  onRetry,
  onRefresh,
  icon,
}: ErrorCardProps) {
  return (
    <Card
      sx={{
        border: 2,
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          {/* Error Icon Container */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 3,
              bgcolor: "error.main",
              color: "white",
              boxShadow: 3,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": {
                  boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.7)",
                },
                "70%": {
                  boxShadow: "0 0 0 10px rgba(211, 47, 47, 0)",
                },
                "100%": {
                  boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)",
                },
              },
            }}
          >
            {icon || <Cancel sx={{ fontSize: 30 }} />}
          </Box>

          {/* Error Content */}
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {message}
            </Typography>

            {errorCode && (
              <Chip
                label={errorCode}
                size="small"
                sx={{
                  bgcolor: "error.50",
                  color: "error.main",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Action Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: 1,
            borderColor: "grey.200",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "error.main",
                animation: "blink 1s infinite",
                "@keyframes blink": {
                  "0%, 50%": { opacity: 1 },
                  "51%, 100%": { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              System Status: Disconnected
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            {onRetry && (
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<Refresh />}
                onClick={onRetry}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Retry Connection
              </Button>
            )}

            {onRefresh && (
              <IconButton
                size="small"
                onClick={onRefresh}
                sx={{
                  bgcolor: "background.default",
                  border: 1,
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "primary.50",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Troubleshooting Tips */}
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
            💡 Troubleshooting: Verify network connection, check server status, or refresh the browser
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
