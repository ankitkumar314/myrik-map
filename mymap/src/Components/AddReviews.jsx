import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Rating
} from "@mui/material";

// Default fallback coordinates
const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946 // Bangalore fallback
};

const AddReviews = ({ locations = [], onAddReview, mapboxToken }) => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(DEFAULT_LOCATION);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          () => resolve(DEFAULT_LOCATION)
        );
      }
    });
  };

  const getPlaceName = async (lat, lng) => {
    try {
      const accessToken = mapboxToken;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }

      const data = await response.json();
      debugger;
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }

      return "Unknown location";
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Unknown location";
    }
  };

  const handleSubmitReview = async (e) => {
    try {
      if (!reviewText.trim()) return;

      const coords = await getUserLocation();
      setSelectedLocation(coords);

      const placeName = await getPlaceName(coords.lat, coords.lng);

      const review = {
        locationIndex: coords,
        text: reviewText.trim(),
        rating,
        coordinates: coords,
        placeName: placeName,
        address: placeName,
        timestamp: new Date().toISOString()
      };

      if (onAddReview) {
        onAddReview(review);
      }

      setReviewText("");
      setSelectedLocation("");
      setRating(0);
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        maxWidth: 250,
        mx: "auto",
        borderRadius: 4,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)"
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        ✨ Add a Review
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          variant="contained"
          size="medium"
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2}}
        >
          Write Review
        </Button>
      </Box>


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Write Your Review</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
          />

          <TextField
            multiline
            rows={4}
            label="Your Experience"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us what you liked or disliked..."
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!reviewText.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          🎉 Review added successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddReviews;
