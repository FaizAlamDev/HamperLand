const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.Records[0].Sns.Message);

    const { orderId, customer, totals } = payload;
    await ses.send(
      new SendEmailCommand({
        Source: process.env.FROM_EMAIL,

        Destination: {
          ToAddresses: [customer.email],
        },

        Message: {
          Subject: {
            Data: `Order Confirmation #${orderId}`,
          },

          Body: {
            Text: {
              Data: `
						Thank you for your order.
						
						Order ID: ${orderId}
						
						Total: ₹${totals.totalPrice}
						
						View order:
						${process.env.FRONTEND_URL}/orders/${orderId}
						`,
            },
          },
        },
      }),
    );
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
};
