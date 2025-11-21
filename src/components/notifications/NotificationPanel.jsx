import { useState, useEffect, useContext } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { getAllBookings } from '../../utils/booking_api';
import { getAllListings } from '../../utils/source_api';

function NotificationPanel() {
  const { token, email } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheckedBookings, setLastCheckedBookings] = useState([]);

  // Poll for notifications every 5 seconds
  useEffect(() => {
    if (!token) return;

    // Initial fetch
    checkForNotifications();

    // Set up polling
    const interval = setInterval(() => {
      checkForNotifications();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [token, email]);

  const checkForNotifications = async () => {
    try {
      const [bookingsData, listingsData] = await Promise.all([
        getAllBookings(token),
        getAllListings(),
      ]);

      // Get my listings
      const myListings = listingsData.listings.filter((l) => l.owner === email);
      const myListingIds = myListings.map((l) => String(l.id));

      // Separate bookings into host bookings (for my listings) and guest bookings (made by me)
      const hostBookings = bookingsData.bookings.filter((b) =>
        myListingIds.includes(String(b.listingId))
      );
      const guestBookings = bookingsData.bookings.filter((b) => b.owner === email);

      const newNotifications = [];

      // Check for new booking requests (Host notification)
      hostBookings.forEach((booking) => {
        const wasChecked = lastCheckedBookings.find((b) => b.id === booking.id);
        if (!wasChecked && booking.status === 'pending') {
          newNotifications.push({
            id: `booking-request-${booking.id}`,
            type: 'booking_request',
            message: `New booking request for your listing`,
            bookingId: booking.id,
            listingId: booking.listingId,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      });

      // Check for booking status changes (Guest notification)
      guestBookings.forEach((booking) => {
        const wasChecked = lastCheckedBookings.find((b) => b.id === booking.id);
        if (wasChecked && wasChecked.status !== booking.status) {
          if (booking.status === 'accepted') {
            newNotifications.push({
              id: `booking-accepted-${booking.id}`,
              type: 'booking_accepted',
              message: `Your booking request has been accepted!`,
              bookingId: booking.id,
              listingId: booking.listingId,
              timestamp: new Date().toISOString(),
              read: false,
            });
          } else if (booking.status === 'declined') {
            newNotifications.push({
              id: `booking-declined-${booking.id}`,
              type: 'booking_declined',
              message: `Your booking request has been declined`,
              bookingId: booking.id,
              listingId: booking.listingId,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      // Update state - only add notifications that don't already exist
      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          // Filter out notifications that already exist
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));

          if (uniqueNewNotifications.length > 0) {
            return [...uniqueNewNotifications, ...prev];
          }
          return prev;
        });

        // Only update unread count for truly new notifications
        setUnreadCount((prev) => {
          const existingIds = new Set(notifications.map(n => n.id));
          const uniqueCount = newNotifications.filter(n => !existingIds.has(n.id)).length;
          return prev + uniqueCount;
        });
      }

      // Update last checked bookings
      setLastCheckedBookings(bookingsData.bookings);
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opening
    if (unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationColor = (type) => {
    switch (type) {
    case 'booking_request':
      return 'primary';
    case 'booking_accepted':
      return 'success';
    case 'booking_declined':
      return 'error';
    default:
      return 'default';
    }
  };

  if (!token) return null;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            maxWidth: 360,
            minWidth: 300,
            maxHeight: 400,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                {!notification.read && (
                  <CircleIcon sx={{ fontSize: 8, color: 'primary.main', mr: 1 }} />
                )}
                <Chip
                  label={notification.type.replace('_', ' ')}
                  size="small"
                  color={getNotificationColor(notification.type)}
                  sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                />
              </Box>
              <ListItemText
                primary={notification.message}
                secondary={formatTimestamp(notification.timestamp)}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontWeight: notification.read ? 400 : 600 },
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                }}
              />
            </MenuItem>
          ))
        )}

        {notifications.length > 10 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                +{notifications.length - 10} more notifications
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}

export default NotificationPanel;
