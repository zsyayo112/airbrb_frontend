//api base url

const API_BASE = 'http://localhost:5005';

/**
 * user login 
 * @param {string} email - user e-mail
 * @param {string} password -user password
 * @returns {Promise<{token: string}>} return token
 */


export async function login(email,password) {
  const response = await fetch(`${API_BASE}/user/auth/login`,{
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'login failed');
  }

  return data; // {token: .....}
}


/**
 * user register
 * @param {String} email -user email
 * @param {String} password -user password
 * @param {String} name -user name
 * @returns {Promise<{token: String}>}  return token
 *
*/


export async function register(email, password, name){
  //debug
  console.log('发送注册请求:', { email, password, name });

  const requestBody = { email, password, name };
  console.log('请求体:', requestBody);
  console.log('JSON字符串:', JSON.stringify(requestBody));

  const response = await fetch(`${API_BASE}/user/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email , password , name }),
  });


  const data = await response.json();
  console.log('响应:', data);

  if (!response.ok) {
    throw new Error(data.error || 'register failed');
  }


  return data;  //{token: ...}

}


/**
 * user logout
 * @param {String} token -user's tokne
 */


export async function logout(token) {
  const response = await fetch(`${API_BASE}/user/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'logout failed');
  }
}

