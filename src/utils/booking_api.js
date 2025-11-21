/**
 * Create a new booking for a listing
 */


//api base url

const API_BASE = 'http://localhost:5005';



export async function createBooking(token, listingId, dateRange, totalPrice) {
  const response = await fetch(`${API_BASE}/bookings/new/${listingId}`, {
    method: 'POST',
    headers : {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ dateRange, totalPrice }),
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(data.error || 'Create booking')
  }

  return data;
}



/**
 * Get all bookings
 * 
 */



export async function getAllBookings(token) {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Get bookings failed');
  }


  return data;
}


/**
 * Delete a booking
 */

export async function deleteBooking(token, bookingId) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${token}`,
    },
  });

  if(!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Delete booking failed');
  }
}




/**
 * Accept a booking(host only)
 */

export async function acceptBooking(token,bookingId) {
  const response = await fetch(`${API_BASE}/bookings/accept/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Accept booking failed');
  }

  return data;
}



/**
 * Decline a booking(host only)
 */


export async function declineBooking(token,bookingId) {
  const response = await fetch(`${API_BASE}/bookings/decline/${bookingId}`, {
    method: 'PUT',
    headers : {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if(!response.ok) {
    throw new Error(data.error || 'Decline booing failed');
  }


  return data;
}






