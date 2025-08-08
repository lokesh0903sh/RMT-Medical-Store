// Simple test file for FormData submission

// Creates a test FormData object with the same structure as our form
export function createTestFormData() {
  const formData = new FormData();
  
  // Add basic fields
  formData.append('fullName', 'Test User');
  formData.append('phone', '1234567890');
  formData.append('email', 'test@example.com');
  formData.append('hasPrescription', 'no');
  formData.append('purchaseWithoutPrescription', 'yes');
  formData.append('productList', 'Test Medicine 1, Test Medicine 2');
  formData.append('message', 'This is a test submission from the FormData test utility');
  
  // Log the entries
  console.log('Test FormData entries:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  return formData;
}

// Direct fetch submission using FormData
export async function testSubmitFormData() {
  const formData = createTestFormData();
  
  try {
    console.log('Making test submission to /api/medical-query');
    
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-auth-token'] = token;
    }
    
    const response = await fetch('http://localhost:5000/api/medical-query', {
      method: 'POST',
      body: formData,
      headers
    });
    
    const responseText = await response.text();
    console.log('Server response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { text: responseText };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error('Test submission error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
