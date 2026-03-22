import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from "@mui/material";

const AdminReviewer = ({ locations = [], onVerifyReview }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const unverifiedReviews = locations.filter(
    (loc) => loc.isReviewVerifed === false && loc.reviewText
  );

  const handleReviewClick = (review) => {
    try {
      setSelectedReview(review);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error selecting review:", error);
    }
  };

  const handleVerifyReview = () => {
    try {
      if (selectedReview && onVerifyReview) {
        onVerifyReview(selectedReview);
        setSnackbarMessage("Review verified successfully!");
        setOpenSnackbar(true);
        setOpenDialog(false);
        setSelectedReview(null);
      }
    } catch (error) {
      console.error("Error verifying review:", error);
      setSnackbarMessage("Error verifying review");
      setOpenSnackbar(true);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        borderRadius: 4,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)"
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🔍 Review Verification Panel
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {unverifiedReviews.length} unverified review(s) pending approval
      </Typography>

      {unverifiedReviews && unverifiedReviews.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {unverifiedReviews.map((review, index) => (
            <Card
              key={index}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6
                }
              }}
              onClick={() => handleReviewClick(review)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {review.placeName || "Unknown Location"}
                  </Typography>
                  <Chip label="Unverified" color="warning" size="small" />
                </Box>

                {review.address && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 {review.address}
                  </Typography>
                )}

                {review.rating !== undefined && review.rating > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                )}

                <Typography variant="body1" sx={{ mb: 1 }}>
                  {review.reviewText}
                </Typography>

                {review.timestamp && (
                  <Typography variant="caption" color="text.secondary">
                    📅 {new Date(review.timestamp).toLocaleString()}
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button size="small" variant="outlined" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          No unverified reviews at the moment. All reviews are verified! ✅
        </Alert>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review Details</DialogTitle>

        {selectedReview && (
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {selectedReview.placeName || "Unknown Location"}
              </Typography>
            </Box>

            {selectedReview.address && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {selectedReview.address}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Coordinates
              </Typography>
              <Typography variant="body1">
                Lat: {selectedReview.lat?.toFixed(4)}, Lng: {selectedReview.lng?.toFixed(4)}
              </Typography>
            </Box>

            {selectedReview.rating !== undefined && selectedReview.rating > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating
                </Typography>
                <Rating value={selectedReview.rating} readOnly />
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Review
              </Typography>
              <Typography variant="body1">
                {selectedReview.reviewText}
              </Typography>
            </Box>

            {selectedReview.timestamp && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted On
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedReview.timestamp).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerifyReview}
          >
            ✓ Verify Review
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminReviewer;
