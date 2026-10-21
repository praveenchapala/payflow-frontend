
import { useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);

  async function createOrder() {
    setLoading(true);
    setError("");
    setOrder(null);
    setPaymentResponse(null);

    try {
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Check index.html and refresh the page."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payments/create-order`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to create order");
      }

      setOrder(data);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "PayFlow",
        description: "PayFlow Demo Product",
        order_id: data.orderId,

        handler: function (result) {
          setPaymentResponse(result);
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay Checkout closed");
          },
        },

        theme: {
          color: "#5956e0",
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", function (result) {
        setError(
          result.error?.description || "Payment failed. Try again."
        );
      });

      checkout.open();
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to backend. Check that Spring Boot is running on port 8080."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="checkout-card">
        <div className="brand">
          <span className="brand-icon">P</span>
          <span>PayFlow</span>
        </div>

        <p className="eyebrow">RAZORPAY TEST ENVIRONMENT</p>
        <h1>Simple. Secure. Payments.</h1>

        <p className="description">
          Experience a payment flow powered by Razorpay.
          This is a demonstration using test mode.
        </p>

        <div className="product">
          <div className="product-info">
            <h2>PayFlow Demo Product</h2>
            <p>One-time test purchase</p>
          </div>
          <strong>₹499.00</strong>
        </div>

        <div className="payment-details">
          <div>
            <span>Subtotal</span>
            <span>₹499.00</span>
          </div>
          <div>
            <span>Taxes</span>
            <span>₹0.00</span>
          </div>
          <div className="total">
            <span>Total</span>
            <strong>₹499.00</strong>
          </div>
        </div>

        <button
          className="pay-button"
          onClick={createOrder}
          disabled={loading}
        >
          {loading ? "Opening checkout..." : "Pay ₹499 with Razorpay"}
        </button>

        {error && (
          <div className="error-message" role="alert">
            <strong>Payment error</strong>
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="success-message">
            <h3>Razorpay order created</h3>
            <p>Order ID: {order.orderId}</p>
            <p>Amount: ₹{(order.amount / 100).toFixed(2)}</p>
          </div>
        )}

        {paymentResponse && (
          <div className="success-message" role="status">
            <h3>Checkout response received</h3>
            <p>
              Payment ID: {paymentResponse.razorpay_payment_id}
            </p>
            <p>
              Server verification is pending. This is not yet a
              verified payment.
            </p>
          </div>
        )}

        <div className="security-note">
          <span aria-hidden="true">🔒</span>
          <span>Test mode only. No real payment is intended.</span>
        </div>

        <footer>
          PayFlow Demo · Built with React, Spring Boot and Razorpay
        </footer>
      </section>
    </main>
  );
}

export default App;
