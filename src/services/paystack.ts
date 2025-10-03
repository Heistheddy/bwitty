const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function verifyPayment(reference: string) {
  const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });

  return response.json();
}

export async function createOrder(orderData: any) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  return response.json();
}
