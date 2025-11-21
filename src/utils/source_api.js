// const API_BASE = 'http://localhost:5005';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5005';

/**
 * get all lists
 */
export async function getAllListings() {
  const response = await fetch(`${API_BASE}/listings`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Get lists failed...');
  }

  return data;
}

/**
 * collect all of the data pertaining to a particular AirBrB listing
 */
export async function getListingDetails(listingId) {
  const response = await fetch(`${API_BASE}/listings/${listingId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'get data pertaining failed...');
  }

  return data;
}

/**
 * create a new AirBrB listing
 */
export async function createListing(token, listingData) {
  const response = await fetch(`${API_BASE}/listings/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(listingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'create new listing failed..');
  }

  return data;
}

/**
 * update the detail of a particular AirBrB listing.
 */
export async function updateListing(token, listingId, listingData) {
  const response = await fetch(`${API_BASE}/listings/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(listingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Update listing failed.');
  }

  return data;
}

/**
 * Delete a particular AirBrB listing
 */
export async function deleteListing(token, listingId) {
  const response = await fetch(`${API_BASE}/listings/${listingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'delete a listing failed..');
  }
}

/**
 * Publish a particular AirBrB LISTING
 */
export async function publishListing(token, listingId, availability) {
  const response = await fetch(`${API_BASE}/listings/publish/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ availability }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'publish listing failed..');
  }

  return data;
}

/**
 * unpublish a listing
 */
export async function unpublishListing(token, listingId) {
  const response = await fetch(`${API_BASE}/listings/unpublish/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unpublish failed..');
  }

  return data;
}


/**
 * Leave a review for a listing
 */

export async function leaveReview(token, listingId, bookingId, review) {
  const response = await fetch(`${API_BASE}/listings/${listingId}/review/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ review }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Leave review failed');
  }

  return data;
}

