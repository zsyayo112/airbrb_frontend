import { Card, CardMedia, Typography, Box } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function ListingCard({ listing }) {
  const navigate = useNavigate();

  // calculate average score
  const averageRating = listing.reviews?.length > 0
    ? (listing.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / listing.reviews.length).toFixed(1)
    : 0;

  // get all nums of bedroom
  const bedroomCount = listing.metadata?.bedrooms?.length || 0;

  return (
    <Card
      onClick={() => navigate(`/listing/${listing.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: 'none',
        boxShadow: 'none',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          '& .listing-image': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* listing image with overlay */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '100%', // 1:1 aspect ratio - square image for larger display
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <CardMedia
          component="img"
          image={listing.thumbnail || 'https://via.placeholder.com/600x400?text=No+Image'}
          alt={listing.title}
          className="listing-image"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </Box>

      {/* listing information */}
      <Box sx={{ pt: 2, px: 0.5 }}>
        {/* Location and Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              mr: 1,
              fontSize: '1rem',
            }}
          >
            {listing.title}
          </Typography>
          {averageRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
              <StarIcon sx={{ fontSize: 16, color: 'text.primary' }} />
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {averageRating}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Property Type */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {listing.metadata?.propertyType || 'Property'}
        </Typography>

        {/* Bedrooms and Bathrooms */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '0.95rem',
            mb: 0.5,
          }}
        >
          {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'} · {listing.metadata?.bathrooms || 0}{' '}
          {listing.metadata?.bathrooms === 1 ? 'bath' : 'baths'}
        </Typography>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.125rem',
            }}
          >
            ${listing.price}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            night
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default ListingCard;