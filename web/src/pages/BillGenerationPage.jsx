import React, { useState, useRef } from 'react';
import { Search, Download, Printer, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import html2pdf from 'html2pdf.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const BillGenerationPage = () => {
  const [searchOrderId, setSearchOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgInfo, setOrgInfo] = useState(null);
  const billRef = useRef();
  const token = useAuthStore((state) => state.token);

  const searchOrder = async () => {
    if (!searchOrderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/${searchOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.order);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!order) return { subtotal: 0, gst: 0, serviceTax: 0, total: 0 };

    const subtotal = order.totalAmount || 0;
    const gst = subtotal * 0.05; // 5% GST
    const serviceTax = subtotal * 0.1; // 10% Service Tax
    const total = subtotal + gst + serviceTax;

    return { subtotal, gst, serviceTax, total };
  };

  const generatePDF = () => {
    if (!billRef.current) return;

    const element = billRef.current;
    const opt = {
      margin: 10,
      filename: `bill-${order.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(element).save();
  };

  const printBill = () => {
    if (!billRef.current) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(billRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const { subtotal, gst, serviceTax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bill Generation</h1>
          <p className="text-gray-400">Search for orders and generate bills</p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., UICHWvRtAM2E2U7eb6mG)"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={searchOrder}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Searching...</p>
          </div>
        )}

        {/* Bill Display */}
        {order && (
          <>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={printBill}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Bill
              </button>
            </div>

            {/* Bill Content */}
            <div
              ref={billRef}
              className="bg-white text-black p-8 rounded-lg shadow-lg"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h1 className="text-3xl font-bold">EASY ONE RESTAURANT</h1>
                <p className="text-sm">123 Main Street, Mumbai, India</p>
                <p className="text-sm">Phone: +91-9876543210</p>
                <p className="text-sm">Email: info@easyone.com</p>
              </div>

              {/* Bill Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">BILL</h2>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p><strong>Bill No:</strong> {order.orderId}</p>
                  <p><strong>Date:</strong> {new Date(order.createdAt?._seconds * 1000 || order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(order.createdAt?._seconds * 1000 || order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p><strong>Table No:</strong> {order.tableNumber}</p>
                  <p><strong>Guest Name:</strong> {order.guestName}</p>
                  <p><strong>Guests:</strong> {order.guestCount}</p>
                  <p><strong>Server:</strong> {order.serverName}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-6 text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">₹{item.price?.toFixed(2)}</td>
                      <td className="text-right py-2">₹{(item.price * item.quantity)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                  <strong>Special Instructions:</strong> {order.specialInstructions}
                </div>
              )}

              {/* Allergies */}
              {order.allergies && (
                <div className="mb-4 p-3 bg-yellow-100 rounded text-sm">
                  <strong>Allergies:</strong> {order.allergies}
                </div>
              )}

              {/* Totals */}
              <div className="border-t-2 border-black pt-4 mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>GST (5%):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span>Service Tax (10%):</span>
                  <span>₹{serviceTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
                  <span>TOTAL:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t-2 border-black pt-4 text-sm">
                <p>Thank you for your visit!</p>
                <p>Please visit again</p>
                <p className="mt-4 text-xs">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
          </>
        )}

        {/* No Order Selected */}
        {!order && !loading && !error && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Search for an order to generate a bill</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillGenerationPage;

