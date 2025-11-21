import { useState, useEffect, useContext } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';

import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { getAllListings, getListingDetails, deleteListing, publishListing, unpublishListing } from '../utils/source_api';
import { getAllBookings } from '../utils/booking_api';
import ProfitGraph from '../components/charts/ProfitGraph';

function HostedListings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, email } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allBookings, setAllBookings] = useState([]);


  // 新增：发布对话框相关状态
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [currentListingId, setCurrentListingId] = useState(null);
  const [availabilityRanges, setAvailabilityRanges] = useState([
    { start: '', end: '' }
  ]);

  const [publishError, setPublishError] = useState('');

  //get lists when loading
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [token, navigate, location]);

  // Fetch bookings when listings are loaded
  useEffect(() => {
    if (listings.length > 0 && token) {
      fetchAllBookings();
    }
  }, [listings.length, token]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListings();

      // get the room created by current user.
      const myListings = data.listings.filter(listing => listing.owner === email);

      // getAllListings do not return published and availability
      const myListingsWithDetails = await Promise.all(
        myListings.map(async (listing) => {
          try {
            const details = await getListingDetails(listing.id);
            return {
              ...listing,
              published: details.listing.published,
              availability: details.listing.availability,
              metadata: details.listing.metadata,
            };
          } catch (err) {
            console.error(`Get property ${listing.id} information failed:`, err);
            return listing;
          }
        })
      );

      console.log('My room with details:', myListingsWithDetails);

      setListings(myListingsWithDetails);
    } catch (err) {
      console.error('Get room failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }

  };

  // Fetch all bookings for profit calculation
  const fetchAllBookings = async () => {
    try {
      const data = await getAllBookings(token);

      // Filter bookings for my listings only
      const myListingIds = listings.map(l => String(l.id));

      // Convert listingId to string for comparison
      const myBookings = data.bookings.filter(b => myListingIds.includes(String(b.listingId)));

      setAllBookings(myBookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      // Don't show error to user, just fail silently for graph
    }
  };

  // delete room
  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure to delete this room?')) {
      return;
    }

    try {
      await deleteListing(token, listingId);
      //when deleting success, remove from the list
      setListings(listings.filter(listing => listing.id !== listingId));
      alert('Delet success!');
    } catch (err) {
      alert('Delete failed:' + err.message);
    }
  };

  // open message dialog 
  const handleOpenPublishDialog = (listingId) => {
    setCurrentListingId(listingId);
    setPublishDialogOpen(true);
    setPublishError('');
  };

  // close dialog message
  const handleClosePublishDialog = () => {
    setPublishDialogOpen(false);
    setCurrentListingId(null);
    setAvailabilityRanges([{ start: '', end: '' }]);
    setPublishError('');
  };

  // add date range
  const addAvailabilityRange = () => {
    setAvailabilityRanges([...availabilityRanges, { start: '', end: '' }]);
  };


  // remove time range
  const removeAvailabilityRange = (index) => {
    if (availabilityRanges.length > 1) {
      setAvailabilityRanges(availabilityRanges.filter((_, i) => i !== index));
    }
  };

  // update date range
  const updateAvailabilityRange = (index, field, value) => {
    const newRanges = [...availabilityRanges];
    newRanges[index][field] = value;
    setAvailabilityRanges(newRanges);
  };

  // publish a property
  const handlePublish = async () => {
    setPublishError('');

    // check the date
    const validRanges = availabilityRanges.filter(
      range => range.start && range.end
    );

    if (validRanges.length === 0) {
      setPublishError('please at least fill a valid date.');
      return;
    }

    // check valid date
    for (const range of validRanges) {
      if (new Date(range.start) > new Date(range.end)) {
        setPublishError('Start date can not later than end date.');
        return;
      }
    }

    try {
      await publishListing(token, currentListingId, validRanges);

      // update the status in the list
      setListings(listings.map(listing =>
        listing.id === currentListingId
          ? { ...listing, published: true, availability: validRanges }
          : listing
      ));

      alert('Published success!');
      handleClosePublishDialog();
      fetchMyListings(); // 刷新列表

    } catch (err) {
      setPublishError(err.message);
    }
  };


  // 下架房源
  const handleUnpublish = async (listingId) => {
    if (!window.confirm('Are you sure to unpublish this property? After that, tourists can not book.')) {
      return;
    }

    try {
      await unpublishListing(token, listingId);

      // update listing status
      setListings(listings.map(listing =>
        listing.id === listingId
          ? { ...listing, published: false }
          : listing
      ));

      alert('Unpublished success');
      fetchMyListings(); // refresh listings

    } catch (err) {
      alert('Unpublish failed.' + err.message);
    }
  };


  // status when loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Header and create button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My room
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-listing')}
        >
          Create a new Room
        </Button>
      </Box>

      {/* error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profit Graph */}
      {listings.length > 0 && (
        <ProfitGraph bookings={allBookings} />
      )}

      {/* room num */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        All {listings.length} room
      </Typography>

      {/* room list */}
      {listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {"You haven't create ant room."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {'Start by clicking "Create a new Room" to start.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Room image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={listing.title}
                  sx={{ objectFit: 'cover' }}
                />

                {/* Room information */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {listing.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type {listing.metadata?.propertyType || 'Unknown'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Bedroom: {listing.metadata?.bedrooms?.length || 0} ·
                    Bathroom: {listing.metadata?.bathrooms || 0}
                  </Typography>

                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    ${listing.price} / night
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ⭐ Comment: {listing.reviews?.length || 0}
                  </Typography>
                </CardContent>

                {/* Operation button */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(listing.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  {/* Publish/Unpublish Button - 完全修复版 */}
                  <Box>
                    {(() => {
                      // multiple ways
                      const hasPublishedField = listing.published === true;
                      const hasAvailability = listing.availability && Array.isArray(listing.availability) && listing.availability.length > 0;
                      const isPublished = hasPublishedField || hasAvailability;

                      // Debug
                      // console.log(`房源 "${listing.title}" (ID: ${listing.id}) 状态检查:`, {
                      //     published字段: listing.published,
                      //     availability数组: listing.availability,
                      //     hasPublishedField,
                      //     hasAvailability,
                      //     最终判断: isPublished ? 'Published' : 'Unpublished'
                      // });

                      if (isPublished) {
                        return (
                          <Chip
                            label="Published"
                            color="success"
                            size="small"
                            onDelete={() => handleUnpublish(listing.id)}
                            deleteIcon={<span>Unpublish</span>}
                          />
                        );
                      } else {
                        return (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenPublishDialog(listing.id)}
                          >
                            Publish
                          </Button>
                        );
                      }
                    })()}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Publish dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={handleClosePublishDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Publish the property - Set available date.</DialogTitle>
        <DialogContent>
          {publishError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {publishError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please set the available date range for the listing; guests can only book within these dates.
          </Typography>

          {availabilityRanges.map((range, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">
                  Date range {index + 1}
                </Typography>
                {availabilityRanges.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeAvailabilityRange(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start date"
                    type="date"
                    fullWidth
                    size="small"
                    value={range.start}
                    onChange={(e) => updateAvailabilityRange(index, 'start', e.target.value)}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End date"
                    type="date"
                    fullWidth
                    size="small"
                    value={range.end}
                    onChange={(e) => updateAvailabilityRange(index, 'end', e.target.value)}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addAvailabilityRange}
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
          >
            Add more date ranges
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClosePublishDialog}>
            Cancle
          </Button>
          <Button onClick={handlePublish} variant="contained">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HostedListings;







