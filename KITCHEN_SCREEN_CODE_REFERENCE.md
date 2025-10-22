# 🍳 Kitchen Screen - Code Reference

## API Configuration

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

---

## 1. Fetch Kitchen Orders (GET)

### Initial Load + Refresh
```javascript
const fetchData = async () => {
  try {
    const [ordersRes, menusRes] = await Promise.all([
      axios.get(`${API_URL}/orders/kitchen/screen`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/menus`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setOrders(ordersRes.data.orders);
    
    // Create menu items map for quick lookup
    const itemsMap = {};
    (menusRes.data.menus || menusRes.data.items || []).forEach(item => {
      itemsMap[item.name] = item;
    });
    setMenuItems(itemsMap);
    setError('');
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load orders');
  } finally {
    setLoading(false);
  }
};
```

### Auto-Refresh Every 5 Seconds
```javascript
const fetchKitchenOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/kitchen/screen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(response.data.orders);
    setError('');
  } catch (err) {
    console.error('Error fetching kitchen orders:', err);
    setError('Failed to load orders');
  }
};

// In useEffect
useEffect(() => {
  if (!token) {
    setError('Not authenticated');
    setLoading(false);
    return;
  }
  fetchData();
  const interval = setInterval(fetchKitchenOrders, 5000);
  return () => clearInterval(interval);
}, [token]);
```

---

## 2. Start Cooking (POST)

```javascript
const handleStartCooking = async (orderId, itemId) => {
  try {
    await axios.post(
      `${API_URL}/orders/${orderId}/items/${itemId}/start-cooking`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchKitchenOrders();
  } catch (err) {
    console.error('Error starting cooking:', err);
    alert(err.response?.data?.error || 'Failed to start cooking');
  }
};
```

**Endpoint:** `POST /api/orders/:orderId/items/:itemId/start-cooking`
**Status Change:** `pending` → `cooking`

---

## 3. Fire Item (POST)

```javascript
const handleBumpToExpo = async (orderId, itemId) => {
  try {
    await axios.post(
      `${API_URL}/orders/${orderId}/items/${itemId}/fire`,
      { station: 'Kitchen' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchKitchenOrders();
  } catch (err) {
    console.error('Error bumping to expo:', err);
    alert(err.response?.data?.error || 'Failed to bump to expo');
  }
};
```

**Endpoint:** `POST /api/orders/:orderId/items/:itemId/fire`
**Payload:** `{ station: 'Kitchen' }`
**Status Change:** `cooking` → `fired`

---

## 4. Recall Item (POST)

```javascript
const handleRecallItem = async (orderId, itemId) => {
  try {
    await axios.post(
      `${API_URL}/orders/${orderId}/items/${itemId}/recall`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchKitchenOrders();
  } catch (err) {
    console.error('Error recalling item:', err);
    alert(err.response?.data?.error || 'Failed to recall item');
  }
};
```

**Endpoint:** `POST /api/orders/:orderId/items/:itemId/recall`
**Status Change:** `fired` → `cooking`

---

## Status Color Mapping

```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-red-100 text-red-800 border-red-300 border-l-4 border-l-red-600';
    case 'cooking':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 border-l-4 border-l-yellow-600';
    case 'bumped':
      return 'bg-green-100 text-green-800 border-green-300 border-l-4 border-l-green-600';
    case 'done':
      return 'bg-blue-100 text-blue-800 border-blue-300 border-l-4 border-l-blue-600';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 border-l-4 border-l-gray-600';
  }
};
```

---

## ✅ All Endpoints Verified and Working!

