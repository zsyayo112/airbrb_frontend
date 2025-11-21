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
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { getAllBookings, acceptBooking, declineBooking } from '../utils/booking_api';
import { getAllListings, getListingDetails } from '../utils/source_api';

function HostBookings() {
  const navigate = useNavigate();
  const { token, email } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0); // 0: pending, 1: accepted, 2: declined

  const [statistics, setStatistics] = useState({
    totalDaysThisYear: 0,
    totalProfitThisYear: 0,
    oldestListingDays: 0,
  });

  // ← 添加 Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHostBookings();
  }, [token, navigate]);

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


  const fetchHostBookings = async () => {
    try {
      setLoading(true);

      // 1. 获取所有预订
      const bookingsData = await getAllBookings(token);
      console.log('All bookings:', bookingsData);

      // 2. 获取当前用户的所有房源
      const listingsData = await getAllListings();
      const myListings = listingsData.listings.filter(listing => listing.owner === email);
      const myListingIds = myListings.map(listing => listing.id);

      console.log('My listing IDs:', myListingIds);

      // 3. 过滤出针对我的房源的预订
      const myListingIdsStr = myListingIds.map(id => String(id));
      const myBookings = bookingsData.bookings.filter(
        booking => myListingIdsStr.includes(String(booking.listingId))
      );

      // 4. 获取每个预订对应的房源详细信息
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

      console.log('Host bookings with listings:', bookingsWithListings);
      setBookings(bookingsWithListings);

      // 计算并更新统计数据
      const stats = calculateStatistics(bookingsWithListings);
      setStatistics(stats);
    } catch (err) {
      console.error('Get host bookings failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  // const calculateStatistics = (bookingsWithListings) => {
  //   console.log('🔍 开始计算统计数据...');
  //   console.log('预订数量:', bookingsWithListings.length);
  
  //   const currentYear = new Date().getFullYear();
  //   console.log('当前年份:', currentYear);
  //   let totalDays = 0;
  //   let totalProfit = 0;
  //   let oldestPostedDate = null;

  //   // 计算今年的预订天数和收益
  //   bookingsWithListings.forEach(booking => {
  //     if (booking.status === 'accepted') {
  //       const startDate = new Date(booking.dateRange.start);
  //       const endDate = new Date(booking.dateRange.end);
  //       const bookingYear = startDate.getFullYear();

  //       // 只统计今年的预订
  //       if (bookingYear === currentYear || endDate.getFullYear() === currentYear) {
  //         // 计算天数
  //         const diffTime = Math.abs(endDate - startDate);
  //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //         totalDays += diffDays;

  //         // 累加收益
  //         totalProfit += booking.totalPrice || 0;
  //       }
  //     }

  //     // 找到最早的发布日期
  //     if (booking.listing?.postedOn) {
  //       const postedDate = new Date(booking.listing.postedOn);
  //       if (!oldestPostedDate || postedDate < oldestPostedDate) {
  //         oldestPostedDate = postedDate;
  //       }
  //     }
  //   });

  //   // 计算最早房源的在线天数
  //   let oldestListingDays = 0;
  //   if (oldestPostedDate) {
  //     const today = new Date();
  //     const diffTime = Math.abs(today - oldestPostedDate);
  //     oldestListingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   }

  //   return {
  //     totalDaysThisYear: totalDays,
  //     totalProfitThisYear: totalProfit,
  //     oldestListingDays: oldestListingDays,
  //   };
  // };

  // 计算统计数据
  const calculateStatistics = (bookingsWithListings) => {
    // console.log('开始计算统计数据...');
    // console.log('预订数量:', bookingsWithListings.length);
    
    const currentYear = new Date().getFullYear();
    // console.log('当前年份:', currentYear);
    
    let totalDays = 0;
    let totalProfit = 0;
    let oldestPostedDate = null;

    // 计算今年的预订天数和收益
    bookingsWithListings.forEach((booking, index) => {
      console.log(`Book ${index + 1}:`, {
        status: booking.status,
        dateRange: booking.dateRange,
        totalPrice: booking.totalPrice,
        postedOn: booking.listing?.postedOn,
      });
      
      if (booking.status === 'accepted') {
        const startDate = new Date(booking.dateRange.start);
        const endDate = new Date(booking.dateRange.end);
        const bookingYear = startDate.getFullYear();

        // console.log(`  已接受的预订 - 年份: ${bookingYear}`);

        // 只统计今年的预订
        if (bookingYear === currentYear || endDate.getFullYear() === currentYear) {
          // 计算天数
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          totalProfit += booking.totalPrice || 0;
          
          // console.log(`  天数: ${diffDays}, 收益: $${booking.totalPrice}`);
        }
      }

      // 找到最早的发布日期
      if (booking.listing?.postedOn) {
        const postedDate = new Date(booking.listing.postedOn);
        console.log(`Public date: ${postedDate}`);
        if (!oldestPostedDate || postedDate < oldestPostedDate) {
          oldestPostedDate = postedDate;
        }
      }
    });

    // 计算最早房源的在线天数
    let oldestListingDays = 0;
    if (oldestPostedDate) {
      const today = new Date();
      const diffTime = Math.abs(today - oldestPostedDate);
      oldestListingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    console.log('final statistic:', {
      totalDaysThisYear: totalDays,
      totalProfitThisYear: totalProfit,
      oldestListingDays: oldestListingDays,
    });

    return {
      totalDaysThisYear: totalDays,
      totalProfitThisYear: totalProfit,
      oldestListingDays: oldestListingDays,
    };
  };


  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Are you sure to accept this booking?')) {
      return;
    }

    try {
      await acceptBooking(token, bookingId);

      // 更新本地状态
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'accepted' }
          : booking
      );
      setBookings(updatedBookings);

      // 重新计算统计数据
      const stats = calculateStatistics(updatedBookings);
      setStatistics(stats);

      // alert('Booking accepted successfully!');
      showSnackbar('Booking accepted successfully!', 'success');
    } catch (err) {
      // alert('Accept booking failed: ' + err.message);
      showSnackbar('Accept booking failed: ' + err.message, 'error');
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    if (!window.confirm('Are you sure to decline this booking?')) {
      return;
    }

    try {
      await declineBooking(token, bookingId);

      // 更新本地状态
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'declined' }
          : booking
      );
      setBookings(updatedBookings);

      // 重新计算统计数据
      const stats = calculateStatistics(updatedBookings);
      setStatistics(stats);

      showSnackbar('Booking declined successfully!', 'success');
    } catch (err) {
      showSnackbar('Decline booking failed: ' + err.message, 'error');
    }
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

  // 根据状态过滤预订
  const getFilteredBookings = () => {
    switch (currentTab) {
    case 0:
      return bookings.filter(b => b.status === 'pending');
    case 1:
      return bookings.filter(b => b.status === 'accepted');
    case 2:
      return bookings.filter(b => b.status === 'declined');
    default:
      return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

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
        Manage Bookings
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Total {bookings.length} bookings for your listings
      </Typography>

      {/* ← 添加统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Oldest Listing Online
              </Typography>
              <Typography variant="h4" component="div">
                {statistics.oldestListingDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                days online
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Booked Days This Year
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {statistics.totalDaysThisYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                days booked
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Profit This Year
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                ${statistics.totalProfitThisYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                total earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label={`Pending (${bookings.filter(b => b.status === 'pending').length})`} />
          <Tab label={`Accepted (${bookings.filter(b => b.status === 'accepted').length})`} />
          <Tab label={`Declined (${bookings.filter(b => b.status === 'declined').length})`} />
        </Tabs>
      </Box>

      {filteredBookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No {currentTab === 0 ? 'pending' : currentTab === 1 ? 'accepted' : 'declined'} bookings
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
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
                    <strong>Guest:</strong> {booking.owner}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Check-in:</strong> {booking.dateRange.start}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Check-out:</strong> {booking.dateRange.end}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Duration:</strong> {calculateDays(booking.dateRange)} nights
                  </Typography>

                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Total: ${booking.totalPrice}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/listing/${booking.listingId}`)}
                    >
                      View Listing
                    </Button>

                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAcceptBooking(booking.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeclineBooking(booking.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

export default HostBookings;