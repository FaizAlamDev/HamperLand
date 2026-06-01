const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const {
  buildCustomerOrderEmail,
} = require("./email-templates/customer-order-created");
const {
  buildAdminOrderEmail,
} = require("./email-templates/admin-order-created");

const ses = new SESClient({});
const cognito = new CognitoIdentityProviderClient({});

async function sendEmail(toAddresses, email) {
  await ses.send(
    new SendEmailCommand({
      Source: process.env.FROM_EMAIL,

      Destination: {
        ToAddresses: toAddresses,
      },

      Message: {
        Subject: {
          Data: email.subject,
        },

        Body: {
          Html: {
            Data: email.html,
          },

          Text: {
            Data: email.text,
          },
        },
      },
    }),
  );
}

async function getAdminEmails() {
  const response = await cognito.send(
    new ListUsersInGroupCommand({
      UserPoolId: process.env.USER_POOL_ID,
      GroupName: "admin",
    }),
  );

  return (
    response.Users?.flatMap((user) => {
      const emailAttr = user.Attributes?.find((attr) => attr.Name === "email");

      return emailAttr?.Value ? [emailAttr.Value] : [];
    }) ?? []
  );
}

exports.handler = async (event) => {
  try {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);

    if (snsMessage.eventType !== "ORDER_CREATED") {
      console.log("Ignoring event:", snsMessage.eventType);
      return;
    }

    const order = snsMessage.order;

    const frontendUrl = process.env.FRONTEND_URL;

    const customerEmail = buildCustomerOrderEmail(order, frontendUrl);

    await sendEmail([order.customer.email], customerEmail);

    console.log("Customer email sent:", order.customer.email);

    const adminEmails = await getAdminEmails();

    if (adminEmails.length > 0) {
      const adminEmail = buildAdminOrderEmail(order);

      await sendEmail(adminEmails, adminEmail);

      console.log("Admin emails sent:", adminEmails);
    }
  } catch (error) {
    console.error("Failed to process order email", error);

    throw error;
  }
};
