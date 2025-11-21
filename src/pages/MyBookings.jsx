import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Snackbar,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { getListingDetails, leaveReview } from '../utils/source_api';
import { getAllBookings, deleteBooking } from '../utils/booking_api';

function MyBookings() {
  const navigate = useNavigate();
  const { token, email } = useContext(AuthContext);
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 评价对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');


  // ← 添加 Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });


  // 关闭 Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 显示 Snackbar（辅助函数）
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyBookings();
  }, [token, navigate]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings(token);
      console.log('All bookings:', data);
      
      // 过滤出当前用户的预订
      const myBookings = data.bookings.filter(booking => booking.owner === email);
      
      // 获取每个预订对应的房源信息
      const bookingsWithListings = await Promise.all(
        myBookings.map(async (booking) => {
          try {
            const listingData = await getListingDetails(booking.listingId);
            return {
              ...booking,
              listing: listingData.listing,
            };
          } catch (err) {
            console.error(`Get listing ${booking.listingId} failed:`, err);
            return booking;
          }
        })
      );
      
      console.log('My bookings with listings:', bookingsWithListings);
      setBookings(bookingsWithListings);
    } catch (err) {
      console.error('Get bookings failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure to cancel this booking?')) {
      return;
    }

    try {
      await deleteBooking(token, bookingId);
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      // alert('Booking cancelled successfully!');
      showSnackbar('Booking cancelled successfully!', 'success');
    } catch (err) {
      // alert('Cancel booking failed: ' + err.message);
      showSnackbar('Cancel booking failed: ' + err.message, 'error');
    }
  };

  // 打开评价对话框
  const handleOpenReviewDialog = (booking) => {
    setCurrentBooking(booking);
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewDialogOpen(true);
  };

  // 关闭评价对话框
  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setCurrentBooking(null);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  // 提交评价
  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    try {
      const review = {
        rating: rating,
        comment: comment.trim(),
      };

      await leaveReview(token, currentBooking.listingId, currentBooking.id, review);
      
      // alert('Review submitted successfully!');
      showSnackbar('Review submitted successfully!', 'success');
      handleCloseReviewDialog();
      
      // 重新获取预订列表以更新评价状态
      fetchMyBookings();
    } catch (err) {
      console.error('Submit review failed:', err);
      setReviewError(err.message);
    }
  };

  // 检查预订是否可以评价
  const canReview = (booking) => {
    // 必须是已接受的预订
    if (booking.status !== 'accepted') {
      return false;
    }

    // 必须已经结束（checkout 日期已过）
    const checkoutDate = new Date(booking.dateRange.end);
    const today = new Date();
    if (checkoutDate > today) {
      return false;
    }

    // 检查是否已经评价过（查看房源的评价列表）
    const hasReviewed = booking.listing?.reviews?.some(
      review => review.bookingId === booking.id
    );

    return !hasReviewed;
  };

  const getStatusColor = (status) => {
    switch (status) {
    case 'accepted':
      return 'success';
    case 'declined':
      return 'error';
    case 'pending':
    default:
      return 'warning';
    }
  };

  const calculateDays = (dateRange) => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Total {bookings.length} bookings
      </Typography>

      {bookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No bookings yet
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
            Browse Listings
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {booking.listing?.title || 'Unknown Listing'}
                    </Typography>
                    <Chip 
                      label={booking.status} 
                      color={getStatusColor(booking.status)} 
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Check-in: {booking.dateRange.start}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Check-out: {booking.dateRange.end}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Duration: {calculateDays(booking.dateRange)} nights
                  </Typography>
                  
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Total: ${booking.totalPrice}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/listing/${booking.listingId}`)}
                    >
                      View Listing
                    </Button>
                    {booking.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {canReview(booking) && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenReviewDialog(booking)}
                      >
                        Leave Review
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 评价对话框 */}
      <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          {currentBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {currentBooking.listing?.title}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography component="legend" gutterBottom>
                Rating
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                size="large"
              />
              
              <TextField
                fullWidth
                label="Your Review"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                sx={{ mt: 3 }}
              />
              
              {reviewError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {reviewError}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MyBookings;