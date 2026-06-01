function buildAdminOrderEmail(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td align="center">${item.qty}</td>
        <td align="right">₹${item.price}</td>
      </tr>
    `,
    )
    .join("");

  return {
    subject: `New HamperLand Order #${order.orderId}`,

    html: `
			<!DOCTYPE html>
			<html>
			<body style="
				font-family:Arial,sans-serif;
				padding:20px;
			">

			<h1>New Order Received</h1>

			<h3>Customer</h3>

			<p>
				${order.customer.name}<br />
				${order.customer.email}
			</p>

			<h3>Shipping Address</h3>

			<p>
				${order.shippingAddress.name}<br />
				${order.shippingAddress.phone}<br />
				${order.shippingAddress.address}<br />
				${order.shippingAddress.city},
				${order.shippingAddress.state}<br />
				${order.shippingAddress.pincode}
			</p>

			<h3>Order Details</h3>

			<p>
				<strong>Order ID:</strong>
				${order.orderId}
			</p>

			<p>
				<strong>Payment Method:</strong>
				${order.paymentMethod}
			</p>

			<p>
				<strong>Status:</strong>
				${order.orderStatus}
			</p>

			<table width="100%">
				<thead>
					<tr>
						<th align="left">Product</th>
						<th align="center">Qty</th>
						<th align="right">Price</th>
					</tr>
				</thead>

				<tbody>
					${itemsHtml}
				</tbody>
			</table>

			<p
				style="
					font-size:18px;
					font-weight:bold;
				"
			>
				Total: ₹${order.totals.totalPrice}
			</p>

			</body>
			</html>
			`,

    text: `
			New HamperLand Order

			Customer:
			${order.customer.name}
			${order.customer.email}

			Order ID:
			${order.orderId}

			Total:
			₹${order.totals.totalPrice}
		`,
  };
}

module.exports = {
  buildAdminOrderEmail,
};
