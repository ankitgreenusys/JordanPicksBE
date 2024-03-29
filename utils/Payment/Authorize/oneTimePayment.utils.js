const authorizenet = require("authorizenet");
const ApiContracts = authorizenet.APIContracts;
const ApiControllers = authorizenet.APIControllers;

const oneTimePayment = (cardDetails, product, cardDeduction) => {
  const merchantAuthenticationType =
    new ApiContracts.MerchantAuthenticationType();

  console.log(cardDetails, product, cardDeduction);

  merchantAuthenticationType.setName(process.env.AUTHORIZE_API_LOGIN_KEY);
  merchantAuthenticationType.setTransactionKey(
    process.env.AUTHORIZE_API_TRANSACTION_KEY
  );

  const creditCard = new ApiContracts.CreditCardType();
  creditCard.setCardNumber(cardDetails.number);
  creditCard.setExpirationDate(cardDetails.expiryDate);
  creditCard.setCardCode(cardDetails.cvc);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  const orderDetails = new ApiContracts.OrderType();
  orderDetails.setInvoiceNumber(
    `INV-JP-${Math.floor(Math.random() * 1000000)}`
  );
  orderDetails.setDescription(product.name);

  const Item = new ApiContracts.LineItemType();
  Item.setItemId(product._id);
  Item.setName(product.name);
  Item.setQuantity(1);
  Item.setUnitPrice(product.price);

  const lineItems = [];
  lineItems.push(Item);

  const transactionSetting1 = new ApiContracts.SettingType();
  transactionSetting1.setSettingName("duplicateWindow");
  transactionSetting1.setSettingValue("120");

  const transactionSetting2 = new ApiContracts.SettingType();
  transactionSetting2.setSettingName("recurringBilling");
  transactionSetting2.setSettingValue("false");

  const transactionSettingList = [];
  transactionSettingList.push(transactionSetting1);
  transactionSettingList.push(transactionSetting2);

  const transactionSettings = new ApiContracts.ArrayOfSetting();
  transactionSettings.setSetting(transactionSettingList);

  const transactionRequestType = new ApiContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(
    ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
  );
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount(parseFloat(cardDeduction).toFixed(2));
  transactionRequestType.setOrder(orderDetails);
  transactionRequestType.setTransactionSettings(transactionSettings);

  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  const ctrl = new ApiControllers.CreateTransactionController(
    createRequest.getJSON()
  );

  return new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new ApiContracts.CreateTransactionResponse(apiResponse);
      console.log(JSON.stringify(response, null, 2));

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        )
          resolve(response.getMessages().getMessage()[0].getText());
        else reject(response.getTransactionResponse().getErrors().getError()[0].getErrorText());
      } else {
        reject("Null response received");
      }
    });
  });
};

module.exports = oneTimePayment;
