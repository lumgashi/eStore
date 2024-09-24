export const placedOrderTemplate = (
  storeOwnerName: string,
  orderItem: any,
  customer: any,
) => {
  return `
    <div>
      <h2>New Order Received – Order ${orderItem.id}</h2>

      <p>Dear ${storeOwnerName},</p>
      <p>We are excited to inform you that a new order has been placed in your store! Below are the details of the order:</p>

      <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
        <tbody>
          <tr>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Order ID</th>
            <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>${orderItem.id}</td>
          </tr>
          <tr>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Customer Name</th>
            <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>${customer.name}</td>
          </tr>
          <tr>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Order Date</th>
            <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>${orderItem.createdAt}</td>
          </tr>
        </tbody>
      </table>

      <h3>Items Ordered</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Product Name</th>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Quantity</th>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {orderItem.product.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{item.name}</td>
              <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{orderItem.quantity}</td>
              <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total Amount: ${orderItem.totalAmount}</h3>

      <h3>Shipping Details</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd", backgroundColor: "#f4f4f4" }}>Shipping Address</th>
            <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{customer.address}</td>
          </tr>
        </tbody>
      </table>

      <p>Please review the order and prepare the items for shipping as soon as possible. If you have any questions or need assistance, feel free to reach out.</p>
      <p>Thank you for your continued dedication to providing excellent service to your customers!</p>

      <p>Best regards,<br />
      <strong>[Your Store Name] Team</strong></p>
    </div>
  `;
};
