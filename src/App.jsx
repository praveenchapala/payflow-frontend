
import { useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);

  async function verifyPayment(result) {
    setVerifying(true);
    setError("");
    setPaymentResponse({
      status: "pending",
      paymentId: result.razorpay_payment_id,
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: result.razorpay_order_id,
            razorpay_payment_id: result.razorpay_payment_id,
            razorpay_signature: result.razorpay_signature,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "verified") {
        setPaymentResponse({
          status: "rejected",
          paymentId: result.razorpay_payment_id,
          message: data.message || "Payment verification was rejected.",
        });
        return;
      }

      setPaymentResponse({
        status: "verified",
        paymentId: data.paymentId,
        orderId: data.orderId,
        message: data.message,
      });
    } catch (err) {
      console.error("Verification request failed:", err);

      setPaymentResponse({
        status: "unknown",
        paymentId: result.razorpay_payment_id,
        message:
          "Could not reach the verification endpoint. The payment status is unknown; check the backend before retrying.",
      });
    } finally {
      setVerifying(false);
    }
  }

  async function createOrder() {
    setLoading(true);
    setError("");
    setOrder(null);
    setPaymentResponse(null);

    try {
      if (!API_BASE_URL) {
        throw new Error(
          "API URL is missing. Check the frontend .env file."
        );
      }

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
          // Checkout callback is not proof of a verified payment.
          void verifyPayment(result);
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
          disabled={loading || verifying}
        >
          {loading
            ? "Opening checkout..."
            : verifying
              ? "Verifying payment..."
              : "Pay ₹499 with Razorpay"}
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

        {paymentResponse?.status === "pending" && (
          <div className="success-message" role="status">
            <h3>Verifying payment</h3>
            <p>
              Payment ID: {paymentResponse.paymentId}
            </p>
            <p>Waiting for the backend verification result.</p>
          </div>
        )}

        {paymentResponse?.status === "verified" && (
          <div className="success-message" role="status">
            <h3>Payment signature verified</h3>
            <p>
              Payment ID: {paymentResponse.paymentId}
            </p>
            <p>
              Order ID: {paymentResponse.orderId}
            </p>
            <p>{paymentResponse.message}</p>
            <p>
              Note: signature verification does not independently
              confirm that the payment has been captured.
            </p>
          </div>
        )}

        {paymentResponse?.status === "rejected" && (
          <div className="error-message" role="alert">
            <h3>Payment verification rejected</h3>
            <p>{paymentResponse.message}</p>
            <p>
              Payment ID: {paymentResponse.paymentId}
            </p>
          </div>
        )}

        {paymentResponse?.status === "unknown" && (
          <div className="error-message" role="alert">
            <h3>Verification status unknown</h3>
            <p>{paymentResponse.message}</p>
            <p>
              Payment ID: {paymentResponse.paymentId}
            </p>
          </div>
        )}

        <div className="security-note">
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
