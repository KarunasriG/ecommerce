const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async ({ orderId, amount, currency, key_id }) => {
  const res = await loadRazorpay();
  if (!res) {
    throw new Error('Razorpay SDK failed to load');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: key_id,
      amount: amount,
      currency: currency,
      name: 'Ecommerce Store',
      description: 'Purchase Payment',
      order_id: orderId,
      handler: function (response) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        }
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com'
      },
      theme: {
        color: '#059669'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      reject(new Error(response.error.description));
    });
    paymentObject.open();
  });
};