function buildCustomerOrderEmail(order, frontendUrl) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;">${item.name}</td>
        <td style="padding:8px 0;text-align:center;">
          ${item.qty}
        </td>
        <td style="padding:8px 0;text-align:right;">
          ₹${item.price}
        </td>
      </tr>
    `,
    )
    .join("");

  return {
    subject: `HamperLand Order Confirmation #${order.orderId}`,

    html: `
			<!DOCTYPE html>
			<html>
			<body style="
				margin:0;
				padding:20px;
				background:#f3f4f6;
				font-family:Arial,sans-serif;
			">
				<table width="100%" cellpadding="0" cellspacing="0">
					<tr>
						<td align="center">

							<table
								width="600"
								cellpadding="0"
								cellspacing="0"
								style="
									background:#ffffff;
									border-radius:8px;
									overflow:hidden;
								"
							>

								<tr>
									<td
										style="
											background:#111827;
											color:white;
											text-align:center;
											padding:32px;
										"
									>
										<img
											src="${frontendUrl}/logo.svg"
											alt="HamperLand"
											height="60"
										/>
										<p style="margin-top:10px;">
											Your order has been placed successfully
										</p>
									</td>
								</tr>

								<tr>
									<td style="padding:32px;">

										<p>
											Hi ${order.customer.name},
										</p>

										<p>
											Thank you for shopping with
											<strong>HamperLand</strong>.
										</p>

										<p>
											We've received your order and
											will begin processing it shortly.
										</p>

										<hr style="margin:24px 0;" />

										<h3>Order Summary</h3>

										<p>
											<strong>Order ID:</strong>
											${order.orderId}
										</p>

										<p>
											<strong>Status:</strong>
											${order.orderStatus}
										</p>

										<p>
											<strong>Payment Method:</strong>
											${order.paymentMethod}
										</p>

										<table
											width="100%"
											cellpadding="0"
											cellspacing="0"
											style="
												margin-top:20px;
												border-collapse:collapse;
											"
										>
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

										<hr style="margin:24px 0;" />

										<p
											style="
												font-size:18px;
												font-weight:bold;
											"
										>
											Total: ₹${order.totals.totalPrice}
										</p>

										<div
											style="
												text-align:center;
												margin-top:32px;
											"
										>
											<a
												href="${frontendUrl}/orders/${order.orderId}"
												style="
													display:inline-block;
													background:#111827;
													color:white;
													text-decoration:none;
													padding:12px 24px;
													border-radius:6px;
												"
											>
												Track Order
											</a>
										</div>

										<p
											style="
												margin-top:32px;
												color:#4b5563;
											"
										>
											We'll keep you updated as your
											order progresses.
										</p>

									</td>
								</tr>

								<tr>
									<td
										style="
											background:#f9fafb;
											text-align:center;
											color:#6b7280;
											font-size:12px;
											padding:20px;
										"
									>
										© HamperLand
									</td>
								</tr>

							</table>

						</td>
					</tr>
				</table>
			</body>
			</html>
			`,

    text: `
			HamperLand Order Confirmation

			Order ID: ${order.orderId}

			Total: ₹${order.totals.totalPrice}

			Track Order:
			${frontendUrl}/orders/${order.orderId}
`,
  };
}

module.exports = {
  buildCustomerOrderEmail,
};
