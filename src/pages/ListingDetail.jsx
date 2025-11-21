import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Breadcrumbs,
  Alert,
  Paper,
  TextField,
  Rating, 
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  ArrowBack as ArrowBackIcon,  // ← 添加
  ArrowForward as ArrowForwardIcon,  // ← 添加
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { getListingDetails } from '../utils/source_api';
import { createBooking } from '../utils/booking_api';

function ListingDetail() {
  const { id } = useParams(); // 从 URL 获取房源 ID
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 添加这些状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前显示的图片索引

  // add booking status
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isBooking, setIsBooking] = useState(false);


  // ← 添加 Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });


  useEffect(() => {
    fetchListingDetail();
  }, [id]);

  // calculate days
  const calculateDays = () => {
    if(!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end-start);
    const diffDays = Math.ceil(diffTime/ (1000*60*60*24));
    return diffDays;
  };



  //calculate total price
  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * (listing?.price || 0);
  };

  //handle booking
  const handleBooking = async () => {
    setBookingError('');

    //check data
    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setBookingError('Check-out date must be after check-in date')
      return;
    }


    // 验证日期是否在可用范围内
    const isAvailable = listing.availability.some(range => {
      const rangeStart = new Date(range.start);
      const rangeEnd = new Date(range.end);
      const selectedStart = new Date(checkIn);
      const selectedEnd = new Date(checkOut);
      
      return selectedStart >= rangeStart && selectedEnd <= rangeEnd;
    });
    
    if (!isAvailable) {
      setBookingError('Selected dates are not available');
      return;
    }

    try {
      setIsBooking(true);
      const dateRange = { start: checkIn, end: checkOut };
      const totalPrice = calculateTotalPrice();
      
      await createBooking(token, id, dateRange, totalPrice);
      
      // alert('Booking successful! You can view it in "My Bookings"');
      showSnackbar('Booking successful! You can view it in "My Bookings"', 'success');
      setCheckIn('');
      setCheckOut('');
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError(err.message);
    } finally {
      setIsBooking(false);
    }

  };

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      const data = await getListingDetails(id);
      console.log('ListingDeatil:', data);
      setListing(data.listing);
    } catch (err) {
      console.error('Get ListDetail failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ← 添加这些函数
  // 关闭 Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 显示 Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // 上一张图片
  const handlePrevImage = () => {
    const images = listing.metadata?.images || [listing.thumbnail];
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // 下一张图片
  const handleNextImage = () => {
    const images = listing.metadata?.images || [listing.thumbnail];
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // 跳转到指定图片
  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  // loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // error
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Loading failed: {error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Back to home page</Button>
      </Container>
    );
  }

  // no data
  if (!listing) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Can not find the listing</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Back to home page</Button>
      </Container>
    );
  }

  const { title, address, price, thumbnail, metadata, reviews, availability, published } = listing;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* 面包屑导航 */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Listing information</Typography>
      </Breadcrumbs>

      {/* 标题和价格 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          ${price} / night
        </Typography>
        {!published && (
          <Chip label="Unpublished" color="default" sx={{ mt: 1 }} />
        )}
      </Box>

      {/* 主图 */}
      {/* <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={thumbnail}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      </Card> */}
      {/* 图片轮播 */}
      <Card sx={{ mb: 4, position: 'relative', overflow: 'hidden' }}>
        {(() => {
          // 获取所有图片（优先使用 metadata.images，否则用 thumbnail）
          const images = metadata?.images && metadata.images.length > 0 
            ? metadata.images 
            : [thumbnail];
          
          return (
            <>
              {/* 图片显示 */}
              <CardMedia
                component="img"
                height="500"
                image={images[currentImageIndex]}
                alt={`${title} - 图片 ${currentImageIndex + 1}`}
                sx={{ objectFit: 'cover' }}
              />
              
              {/* 只有多张图片时显示轮播控制 */}
              {images.length > 1 && (
                <>
                  {/* 左箭头 */}
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                      },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  
                  {/* 右箭头 */}
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                      },
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                  
                  {/* 图片指示器（小圆点） */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                      padding: 1,
                    }}
                  >
                    {images.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => handleDotClick(index)}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: index === currentImageIndex 
                            ? 'white' 
                            : 'rgba(255, 255, 255, 0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'white',
                            transform: 'scale(1.2)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                  
                  {/* 图片计数 */}
                  <Chip
                    label={`${currentImageIndex + 1} / ${images.length}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                    }}
                  />
                </>
              )}
            </>
          );
        })()}
      </Card>

      <Grid container spacing={4}>
        {/* 左侧：房源信息 */}
        <Grid item xs={12} md={8}>
          {/* 基本信息 */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1 }} color="action" />
                  <Typography>
                    Room type: <strong>{metadata?.propertyType || 'Unknown'}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BathtubIcon sx={{ mr: 1 }} color="action" />
                  <Typography>
                    Bathroom: <strong>{metadata?.bathrooms || 0} 个</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* 卧室信息 */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
              <HotelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Bedroom details
            </Typography>
            {metadata?.bedrooms && metadata.bedrooms.length > 0 ? (
              <List>
                {metadata.bedrooms.map((bedroom, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Bedroom ${index + 1}`}
                      secondary={`${bedroom.beds} beds`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary"> {"we don't have room details currently"} </Typography>
            )}

            {/* 设施 */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
              facilities
            </Typography>
            {metadata?.amenities && metadata.amenities.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {metadata.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No facility information now.</Typography>
            )}
          </Paper>

          {/* 地址 */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Address
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              {address?.street || ''}, {address?.city || ''}, {address?.state || ''} {address?.postcode || ''}, {address?.country || ''}
            </Typography>
          </Paper>

          {/* 可预订日期 */}
          {published && availability && availability.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available date
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {availability.map((range, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Date range ${index + 1}`}
                      secondary={`${range.start} to ${range.end}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* 评价 */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Reviews ({reviews?.length || 0})
              </Typography>
              {reviews && reviews.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={
                      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                    } 
                    readOnly 
                    precision={0.1}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {reviews && reviews.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviews.map((review, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {review.user || 'Anonymous User'}
                        </Typography>
                        <Rating value={review.rating || 0} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {review.comment || 'No comment'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右侧：预订卡片 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              ${price} / night
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {!published ? (
              <Alert severity="info">Room not published yet.</Alert>
            ) : token ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select date to book.
                </Typography>

                {/**check-in date */}
                <TextField
                  label="Check-in"
                  type="date"
                  fullWidth
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb:2 }}
                />

                {/** check-out data */}
                <TextField
                  label="Check-out"
                  type="date"
                  fullWidth
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  InputLabelProps={{ shrink:true }}
                  sx={{ mb:2 }}
                />

                {/** showing days and price */}
                {checkIn && checkOut && calculateDays() > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {calculateDays()} nights
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Total: ${calculateTotalPrice()}
                    </Typography>
                  </Box>
                )}


                {/* 错误提示 */}
                {bookingError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {bookingError}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleBooking}
                  disabled={isBooking || !checkIn || !checkOut}
                >
                  {isBooking ? 'Booking...' : 'Book Now'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Please login first.
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default ListingDetail;