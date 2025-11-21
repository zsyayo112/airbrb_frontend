import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Paper,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
import { getAllListings, getListingDetails } from '../utils/source_api';
import { useLocation } from 'react-router-dom';
// import { getAllListings } from '../utils/source_api';
import { AuthContext } from '../contexts/AuthContext'
import ListingCard from '../components/listing/ListingCard';

function Home() {
  const location = useLocation();
  const [allListings, setAllListings] = useState([]);
  // const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { email } = useContext(AuthContext);
  // 搜索和筛选条件
  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedroomCount, setBedroomCount] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'price-asc', 'price-desc', 'rating-desc'
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');


  // get listings when loading..
  useEffect(() => {
    fetchListings();
  }, [location]);

  // 应用筛选条件
  useEffect(() => {
    applyFilters();
  }, [allListings, searchText, minPrice, maxPrice, bedroomCount, sortBy, checkInDate, checkOutDate]);


  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListings();
      console.log('Alllistings:', data);
      
      // 重要：获取每个房源的详细信息，过滤出已发布的
      const allListingsWithDetails = await Promise.all(
        data.listings.map(async (listing) => {
          try {
            const details = await getListingDetails(listing.id);
            return {
              ...listing,
              published: details.listing.published,
              availability: details.listing.availability,
              metadata : details.listing.metadata,
            };
          } catch (err) {
            console.error(`Get room ${listing.id} information failed:`, err);
            return listing;
          }
        })
      );
      
      // only show published room
      const publishedListings = allListingsWithDetails.filter(
        listing => listing.published === true
      );

      // setAllListings(publishedListings);
      
      console.log('Published room:', publishedListings);
      // setListings(publishedListings);
      setAllListings(publishedListings);
    } catch (err) {
      console.error('Get room information failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allListings];

    // 1. 按标题搜索
    if (searchText.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 2. 按价格范围筛选
    if (minPrice !== '') {
      filtered = filtered.filter(listing => listing.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      filtered = filtered.filter(listing => listing.price <= Number(maxPrice));
    }

    // 3. 按卧室数量筛选
    if (bedroomCount !== '') {
      filtered = filtered.filter(listing => {
        const bedrooms = listing.metadata?.bedrooms?.length || 0;
        return bedrooms >= Number(bedroomCount);
      });
    }

    // 4. 按日期范围筛选可用房源
    if (checkInDate && checkOutDate) {
      filtered = filtered.filter(listing => {
        if (!listing.availability || listing.availability.length === 0) {
          return false;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // 检查是否有可用的日期范围包含所选日期
        return listing.availability.some(range => {
          const rangeStart = new Date(range.start);
          const rangeEnd = new Date(range.end);
          return checkIn >= rangeStart && checkOut <= rangeEnd;
        });
      });
    }

    // 5. 排序
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      filtered.sort((a, b) => {
        const ratingA = a.reviews?.length > 0
          ? a.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / a.reviews.length
          : 0;
        const ratingB = b.reviews?.length > 0
          ? b.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / b.reviews.length
          : 0;
        return ratingB - ratingA;
      });
    }

    setFilteredListings(filtered);
  };

  // 清除所有筛选条件
  const handleClearFilters = () => {
    setSearchText('');
    setMinPrice('');
    setMaxPrice('');
    setBedroomCount('');
    setSortBy('');
    setCheckInDate('');
    setCheckOutDate('');
  };

  // 检查是否有激活的筛选条件
  const hasActiveFilters = searchText || minPrice || maxPrice || bedroomCount || sortBy || checkInDate || checkOutDate;

  // Loading status
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error status
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      {!email && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 8,
            mb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Find your next adventure
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                fontWeight: 400,
                opacity: 0.95,
              }}
            >
              Discover amazing places to stay around the world
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ mt: email ? 4 : 0, mb: 6 }}>
        {/* Welcome Message */}
        {email && (
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 3,
              color: 'text.primary',
            }}
          >
            Welcome back, {email.split('@')[0]}!
          </Typography>
        )}

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search destinations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
            />
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* 筛选器面板 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography>Advanced Filters</Typography>
              {hasActiveFilters && (
                <Chip
                  label={`${Object.values({ searchText, minPrice, maxPrice, bedroomCount, sortBy, checkInDate, checkOutDate }).filter(Boolean).length} active`}
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* 价格范围 */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Min Price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Max Price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* 卧室数量 */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Min Bedrooms</InputLabel>
                    <Select
                      value={bedroomCount}
                      label="Min Bedrooms"
                      onChange={(e) => setBedroomCount(e.target.value)}
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="1">1+</MenuItem>
                      <MenuItem value="2">2+</MenuItem>
                      <MenuItem value="3">3+</MenuItem>
                      <MenuItem value="4">4+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 排序 */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="">Default</MenuItem>
                      <MenuItem value="price-asc">Price: Low to High</MenuItem>
                      <MenuItem value="price-desc">Price: High to Low</MenuItem>
                      <MenuItem value="rating-desc">Rating: High to Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 日期范围 */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Check-in Date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Check-out Date"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* 结果数量 */}
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {filteredListings.length === allListings.length
            ? `${allListings.length} stays`
            : `${filteredListings.length} of ${allListings.length} stays`}
        </Typography>

        {/* 房源列表 */}
        {filteredListings.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {allListings.length === 0
                ? 'No listings available yet'
                : 'No listings match your search'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {allListings.length === 0
                ? 'Check back later for amazing places to stay'
                : 'Try adjusting your filters to see more results'}
            </Typography>
            {hasActiveFilters && (
              <Button
                variant="contained"
                size="large"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredListings.map((listing) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Home;