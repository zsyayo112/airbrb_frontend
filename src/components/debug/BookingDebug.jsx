import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { getAllBookings } from '../../utils/booking_api';
import { getAllListings } from '../../utils/source_api';

function BookingDebug() {
  const { token, email } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);

  const fetchData = async () => {
    try {
      const [bookingsData, listingsData] = await Promise.all([
        getAllBookings(token),
        getAllListings(),
      ]);
      setBookings(bookingsData.bookings);
      setListings(listingsData.listings);
      console.log('Debug - Bookings:', bookingsData.bookings);
      console.log('Debug - Listings:', listingsData.listings);
    } catch (err) {
      console.error('Debug error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const myListings = listings.filter((l) => l.owner === email);
  const myListingIds = myListings.map((l) => String(l.id));
  const myBookings = bookings.filter((b) => myListingIds.includes(String(b.listingId)));

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        🐛 Debug Information
      </Typography>

      <Button variant="outlined" size="small" onClick={fetchData} sx={{ mb: 2 }}>
        Refresh Data
      </Button>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Your Email: {email}</Typography>
        <Typography variant="subtitle2">Total Listings: {listings.length}</Typography>
        <Typography variant="subtitle2">Your Listings: {myListings.length}</Typography>
        <Typography variant="subtitle2">Total Bookings: {bookings.length}</Typography>
        <Typography variant="subtitle2">Your Bookings (as host): {myBookings.length}</Typography>
      </Box>

      {myBookings.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Your Bookings Detail:
          </Typography>
          {myBookings.map((booking, index) => (
            <Box
              key={booking.id}
              sx={{
                p: 1,
                mb: 1,
                bgcolor: 'white',
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              <div>#{index + 1} - ID: {booking.id}</div>
              <div>Listing ID: {booking.listingId}</div>
              <div>Status: {booking.status}</div>
              <div>Owner: {booking.owner}</div>
              <div>Total Price: ${booking.totalPrice}</div>
              <div>
                Date Range: {JSON.stringify(booking.dateRange)}
              </div>
            </Box>
          ))}
        </Box>
      )}

      {myBookings.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No bookings found for your listings. Create a listing and get some bookings to test!
        </Typography>
      )}
    </Paper>
  );
}

export default BookingDebug;
