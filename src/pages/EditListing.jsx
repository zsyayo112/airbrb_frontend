import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  Snackbar,
} from '@mui/material';

import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { getListingDetails, updateListing } from '../utils/source_api';


function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useContext(AuthContext);


  //basic information
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [bathrooms, setBathrooms] = useState(1);
  const [bedrooms, setBedrooms] = useState([]);

  //address status
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Australia');



  //bedroom status
  const [amenities, setAmenities] = useState([]);

  //thumbnail status
  // const [thumbnail, setThumbnail] = useState('');
  const [images, setImages] = useState([]);

  //error and loading status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ← 添加 Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });


  const availableAmenities = [
    'WiFi', 'Kitchen', 'Parking', 'Air Conditioning',
    'Heating', 'TV', 'Wahser', 'Pool', 'Gym'
  ];

  // bedtypes
  const bedTypes = ['Single', 'Double', 'Queen', 'King'];


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

  // get room data when loading 
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchListingData();
  }, [id, token, navigate]);

  // get room information and pre-fill the form
  const fetchListingData = async () => {
    try {
      setLoading(true);
      const data = await getListingDetails(id);
      const listing = data.listing;

      console.log('Listing data:', listing);

      // fill the basic information
      setTitle(listing.title || '');
      setPrice(listing.price || '');
      setPropertyType(listing.metadata?.propertyType || 'House');
      setBathrooms(listing.metadata?.bathrooms || 1);

      // fill the address
      setStreet(listing.address?.street || '');
      setCity(listing.address?.city || '');
      setState(listing.address?.state || '');
      setPostcode(listing.address?.postcode || '');
      setCountry(listing.address?.country || 'Australia');

      // fill the bedroom
      if (listing.metadata?.bedrooms && listing.metadata.bedrooms.length > 0) {
        setBedrooms(listing.metadata.bedrooms);
      }

      // fill the amenities
      setAmenities(listing.metadata?.amenities || []);

      // fill the thumbnail
      // setThumbnail(listing.thumbnail || '');

      // 填充图片（从 metadata.images 加载，如果没有则用 thumbnail）
      if (listing.metadata?.images && listing.metadata.images.length > 0) {
        setImages(listing.metadata.images);
      } else if (listing.thumbnail) {
        // 兼容旧数据：如果没有 metadata.images，用单张 thumbnail
        setImages([listing.thumbnail]);
      } else {
        setImages([]);
      }

    } catch (err) {
      console.error('get room information failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // add a bedroom
  const addBedroom = () => {
    setBedrooms([...bedrooms, { beds: 1, type: 'Single' }]);
  };

  // delete a bedroom
  const removeBedroom = (index) => {
    if (bedrooms.length > 1) {
      setBedrooms(bedrooms.filter((_, i) => i !== index));
    }
  };

  // update bedroom information
  const updateBedroom = (index, field, value) => {
    const newBedrooms = [...bedrooms];
    newBedrooms[index][field] = value;
    setBedrooms(newBedrooms);
  };

  // change selecting facilities
  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  // handle image upload
  // const handleImageUpload = (e) => {
  //     const file = e.target.files[0];
  //     if (!file) return;

  //     if (!file.type.startsWith('image/')) {
  //     setError('Please select the file');
  //     return;
  //     }

  //     if (file.size > 5 * 1024 * 1024) {
  //     setError('Image size no more than 5MB.');
  //     return;
  //     }

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //     setThumbnail(reader.result);
  //     };
  //     reader.onerror = () => {
  //     setError('Read image failed');
  //     };
  //     reader.readAsDataURL(file);
  // };
  // 处理多图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 验证图片数量（最多10张）
    if (images.length + files.length > 10) {
      setError('At most upload 10 images!');
      return;
    }

    // 处理每个文件
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('The image size cannot exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImages(prevImages => [...prevImages, reader.result]);
      };
      reader.onerror = () => {
        setError('Image failed to load');
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除某张图片
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // check form
  const validateForm = () => {
    if (!title.trim()) {
      setError('Please input the property header.');
      return false;
    }
    if (!price || price <= 0) {
      setError('Please input a valid price.');
      return false;
    }
    if (!street.trim() || !city.trim()) {
      setError('Please fill in whole address.');
      return false;
    }
    // if (!thumbnail) {
    // setError('Please upload the image.');
    // return false;
    // }
    if (images.length === 0) {
      setError('Please upload at least one property photo');
      return false;
    }
    return true;
  };

  // submit the form
  const handleSubmit = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // construct data
      const address = {
        street,
        city,
        state,
        postcode,
        country,
      };

      // const metadata = {
      //     propertyType,
      //     bathrooms: Number(bathrooms),
      //     bedrooms: bedrooms,
      //     amenities: amenities,
      // };

      // const listingData = {
      //     title: title.trim(),
      //     address: address,
      //     price: Number(price),
      //     thumbnail: thumbnail,
      //     metadata: metadata,
      // };

      const metadata = {
        propertyType,
        bathrooms: Number(bathrooms),
        bedrooms: bedrooms,
        amenities: amenities,
        images: images, // 所有图片存储在 metadata 中
      };

      const listingData = {
        title: title.trim(),
        address: address,
        price: Number(price),
        thumbnail: images[0], // 第一张图作为封面
        metadata: metadata,
      };

      console.log('update listing detail:', listingData);

      // update API
      await updateListing(token, id, listingData);

      // alert('update success!');
      // navigate('/hosted-listings');
      showSnackbar('Update success!', 'success');
      // 延迟导航，让用户看到成功提示
      setTimeout(() => {
        navigate('/hosted-listings');
      }, 1500);

    } catch (err) {
      console.error('update failed:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // loading status
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
                Edit the property
      </Typography>

      {/* error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* basic information*/}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
                    Basic information
        </Typography>

        <TextField
          label="room-header"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="price/night ($)"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={propertyType}
                label="Property Type"
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <MenuItem value="House">House</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Studio">Studio</MenuItem>
                <MenuItem value="Condo">Condo</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Bathroom number"
              type="number"
              fullWidth
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 地址信息 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
                    Address information
        </Typography>

        <TextField
          label="Street address"
          fullWidth
          margin="normal"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="State/Province"
              fullWidth
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Postcode"
              fullWidth
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              fullWidth
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 卧室信息 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
                        Bedroom information
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addBedroom}
            variant="outlined"
            size="small"
          >
                        Add a bedroom
          </Button>
        </Box>

        {bedrooms.map((bedroom, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ minWidth: '80px' }}>
                                Bedroom {index + 1}
              </Typography>

              <TextField
                label="Bed number"
                type="number"
                size="small"
                value={bedroom.beds}
                onChange={(e) => updateBedroom(index, 'beds', Number(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ width: '120px' }}
              />

              <FormControl size="small" sx={{ minWidth: '150px' }}>
                <InputLabel>Bed type</InputLabel>
                <Select
                  value={bedroom.type}
                  label="Bed type"
                  onChange={(e) => updateBedroom(index, 'type', e.target.value)}
                >
                  {bedTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton
                color="error"
                onClick={() => removeBedroom(index)}
                disabled={bedrooms.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Paper>

      {/* 设施 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
                    Property Amenities
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {availableAmenities.map(amenity => (
            <Chip
              key={amenity}
              label={amenity}
              onClick={() => toggleAmenity(amenity)}
              color={amenities.includes(amenity) ? 'primary' : 'default'}
              variant={amenities.includes(amenity) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* upload the image*/}
      {/* <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
            Property image
            </Typography>

            <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
            >
            Change Images
            <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
            />
            </Button>

            {thumbnail && (
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Image
                </Typography>
                <img
                src={thumbnail}
                alt="Pre look"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                />
            </Box>
            )}
        </Paper> */}
      {/* 图片上传 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
                    Property Photos
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
                    You can upload up to 10 images, and the first one will be used as the cover image.
        </Typography>

        <Button
          variant="contained"
          component="label"
          sx={{ mt: 2 }}
        >
                    Select images (multiple selection allowed)
          <input
            type="file"
            hidden
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </Button>

        {images.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                            Uploaded {images.length} images:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      overflow: 'hidden',
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`preload ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {index === 0 && (
                      <Chip
                        label="Cover"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>


      {/* Submit Button*/}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/hosted-listings')}
        >
                    Cancle
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Updating...' : 'Save update'}
        </Button>
      </Box>

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


export default EditListing;
