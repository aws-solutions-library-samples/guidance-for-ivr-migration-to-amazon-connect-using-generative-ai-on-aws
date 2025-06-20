# Testing Guide for POST-based Solutions API

This guide will help you test your `/api/solutions` endpoint with various scenarios using different tools.

## Tools for Testing

You can test your API using any of these tools:

1. **cURL** - Command line tool
2. **Postman** - GUI-based API testing tool
3. **Fetch API** in browser console
4. **A test script** - Automated testing

## Basic Test Cases

### 1. LIST Action - Get All Solutions

```bash
# Using cURL
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -d '{"type":"LIST","data":{"limit":10,"sortBy":"id","sortOrder":"asc"}}'
```

```javascript
// Using Fetch API in browser console
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'LIST',
    data: {
      limit: 10,
      sortBy: 'id',
      sortOrder: 'asc'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 2. DETAIL Action - Get a Specific Solution

```bash
# Using cURL
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -d '{"type":"DETAIL","data":{"solutionId":"S0002144"}}'
```

```javascript
// Using Fetch API in browser console
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'DETAIL',
    data: {
      solutionId: 'S0002144'  // Replace with an actual ID
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 3. SEARCH Action - General Search

```bash
# Using cURL
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -d '{"type":"SEARCH","data":{"searchTerm":"integration","limit":10,"sortBy":"id","sortOrder":"asc"}}'
```

```javascript
// Using Fetch API in browser console
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'SEARCH',
    data: {
      searchTerm: 'integration',  // Replace with your search term
      limit: 10,
      sortBy: 'id',
      sortOrder: 'asc'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 4. SEARCH Action - Field-Specific Search

```bash
# Using cURL
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -d '{"type":"SEARCH","data":{"field":"solution_name","query":"platform","limit":10,"sortBy":"id","sortOrder":"asc"}}'
```

```javascript
// Using Fetch API in browser console
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'SEARCH',
    data: {
      field: 'solution_name',
      query: 'platform',
      limit: 10,
      sortBy: 'id',
      sortOrder: 'asc'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Creating a Test Script

You can create a simple Node.js script to test all API scenarios:

```javascript
// test-api.js
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/solutions';

async function testAPI() {
  try {
    // Test 1: LIST
    console.log('Testing LIST action...');
    const listResponse = await axios.post(API_URL, {
      type: 'LIST',
      data: {
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc'
      }
    });
    console.log('LIST response status:', listResponse.status);
    console.log('LIST data count:', listResponse.data.data.length);
    console.log('Has more pages:', listResponse.data.hasMore);
    console.log('-'.repeat(50));

    // Test 2: DETAIL
    // Use an ID from the LIST response if available
    const solutionId = listResponse.data.data.length > 0 
      ? listResponse.data.data[0].solution_id 
      : 'S0002144'; // Fallback ID
    
    console.log(`Testing DETAIL action for ID: ${solutionId}...`);
    const detailResponse = await axios.post(API_URL, {
      type: 'DETAIL',
      data: {
        solutionId
      }
    });
    console.log('DETAIL response status:', detailResponse.status);
    console.log('Solution name:', detailResponse.data.solution.solution_name);
    console.log('-'.repeat(50));

    // Test 3: SEARCH (general)
    console.log('Testing SEARCH action (general)...');
    const searchResponse = await axios.post(API_URL, {
      type: 'SEARCH',
      data: {
        searchTerm: 'test', // Adjust search term as needed
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc'
      }
    });
    console.log('SEARCH response status:', searchResponse.status);
    console.log('SEARCH results count:', searchResponse.data.data.length);
    console.log('-'.repeat(50));

    // Test 4: SEARCH (field-specific)
    console.log('Testing SEARCH action (field-specific)...');
    const fieldSearchResponse = await axios.post(API_URL, {
      type: 'SEARCH',
      data: {
        field: 'solution_name',
        query: 'platform', // Adjust search term as needed
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc'
      }
    });
    console.log('SEARCH (field) response status:', fieldSearchResponse.status);
    console.log('SEARCH (field) results count:', fieldSearchResponse.data.data.length);

  } catch (error) {
    console.error('Error during API testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
```

## Testing Edge Cases

### 1. Invalid Action Type

```javascript
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'INVALID_ACTION',
    data: {}
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 2. Missing Required Fields

```javascript
// Missing solutionId for DETAIL action
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'DETAIL',
    data: {}
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 3. Pagination Test

```javascript
// Get first page
fetch('/api/solutions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'LIST',
    data: {
      limit: 5,  // Small limit to get pagination
      sortBy: 'id',
      sortOrder: 'asc'
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('First page:', data);
  
  // If there's a next page, fetch it
  if (data.nextCursor) {
    return fetch('/api/solutions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'LIST',
        data: {
          limit: 5,
          cursor: data.nextCursor,
          sortBy: 'id',
          sortOrder: 'asc'
        }
      })
    })
    .then(response => response.json());
  }
})
.then(data => data && console.log('Second page:', data))
.catch(error => console.error('Error:', error));
```

## Troubleshooting

1. **CORS Issues**: If testing from a different origin, you might face CORS issues. Ensure your API has the correct CORS headers.

2. **Content-Type Header**: Always include `Content-Type: application/json` header.

3. **Response Format**: Verify the response structure matches what your frontend expects:
   - LIST/SEARCH: `{ data: [...], nextCursor: "...", hasMore: true }`
   - DETAIL: `{ solution: {...} }`

4. **Endpoint URL**: Make sure you're using the correct URL (e.g., `http://localhost:3000/api/solutions`).

5. **HTTP Status Codes**:
   - 200: Success
   - 400: Bad request (invalid parameters)
   - 404: Solution not found (for DETAIL)
   - 405: Method not allowed (only POST is supported)
   - 500: Server error

## Creating a Postman Collection

For more comprehensive testing, you can create a Postman collection:

1. Create a new collection named "Solutions API"
2. Add requests for each action type (LIST, DETAIL, SEARCH)
3. Set up environment variables for your API URL
4. Use test scripts to validate responses

This approach lets you save and reuse your API tests.
